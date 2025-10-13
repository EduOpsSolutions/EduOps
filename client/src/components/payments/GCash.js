import React, { useState } from "react";
import styles from "../../styles/Payment.module.css";

const GCash = ({ amount, description, onPaymentSuccess, onPaymentError }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    
    try {
      // Use the PIPM workflow for GCash payments
      console.log('Starting GCash payment with PIPM workflow...');
      await handleGCashPIPMFlow();
    } catch (error) {
      console.error('GCash payment error:', error);
      setPaymentStatus("Payment failed. Please try again.");
      onPaymentError && onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  // GCash Payment Intent + Payment Method workflow
  const handleGCashPIPMFlow = async () => {
    try {
      // Step 1: Create Payment Intent
      const intentResponse = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'PHP',
          description: description,
          payment_method_allowed: ['gcash'] // GCash payment method
        }),
      });

      const intentData = await intentResponse.json();
      // Debug: Payment Intent response
      
      if (!intentData.success) {
        throw new Error('Failed to create payment intent');
      }

      // Extract payment intent data from backend response (PayMongo shape)
      // Backend returns: { success, data: { data: { id, attributes: { client_key } } } }
      const paymentIntent = intentData?.data?.data;
      const clientKey = paymentIntent?.attributes?.client_key;
      
      // Extract Payment Intent ID (prefer direct id; fallback to split)
      const paymentIntentId = paymentIntent?.id || (clientKey ? clientKey.split('_client')[0] : undefined);

      // Client key is used only server-side via intent mapping; avoid storing locally
      
      // Debug IDs
      
      if (!paymentIntentId) {
        console.error('Full response:', intentData);
        throw new Error('Payment Intent ID not found in response');
      }

      // Step 2: Create Payment Method for GCash
      let paymentMethod;
      try {
        // Create GCash payment method directly via PayMongo API (client-side per devs advice)
        const methodResponse = await fetch('https://api.paymongo.com/v1/payment_methods', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(process.env.REACT_APP_PAYMONGO_PUBLIC_KEY + ':')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              attributes: {
                type: 'gcash', // GCash payment method type
                // Omit details entirely for e-wallets to avoid parameter_blank
                billing: {
                  name: name,
                  email: email,
                  phone: phone,
                }
              }
            }
          }),
        });

        const methodData = await methodResponse.json();
        // Debug: Payment Method response
        
        if (!methodData.data) {
          const errMsg = methodData?.errors?.map?.(e => e?.detail).join(', ') || 'Failed to create GCash payment method';
          throw new Error(errMsg);
        }

        paymentMethod = methodData.data;
      } catch (error) {
        throw new Error(`Payment method creation failed: ${error.message}`);
      }
      
      // Debug: Payment Method ID

      // Step 3: Attach Payment Method to Payment Intent (with return_url for GCash)
      const attachResponse = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/payments/attach-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethod.id,
          client_key: clientKey,
          return_url: `${window.location.origin}/payment-complete` // Redirect to completion page
        }),
      });

      const attachData = await attachResponse.json();
      // Debug: Attach response
      
      if (!attachData.success) {
        throw new Error('Failed to attach payment method');
      }

      const attachedIntent = attachData?.data?.data || attachData?.data;
      const status = attachedIntent.attributes.status;

      if (status === 'awaiting_next_action') {
        // GCash requires redirect
        const nextAction = attachedIntent.attributes.next_action;
        if (nextAction && nextAction.redirect && nextAction.redirect.url) {
          setPaymentStatus("Redirecting to GCash...");
          window.location.href = nextAction.redirect.url;
        } else {
          throw new Error("No redirect URL received");
        }
      } else if (status === 'succeeded') {
        setPaymentStatus("Payment Success");
        onPaymentSuccess && onPaymentSuccess(attachedIntent);
      } else {
        throw new Error(`Unexpected payment status: ${status}`);
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the main error handler
    }
  };
  return (
    <section>
      <form action="#" onSubmit={onSubmit}>
        <h2>Billing Information</h2>
        <div className={styles.formField}>
          <label htmlFor="customer-name">Customer Name:</label>
          <input
            id="customer-name"
            placeholder="Juan Dela Cruz"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="phone">Phone Number:</label>
          <input
            id="phone"
            placeholder="09xxxxxxxxx"
            className={styles.input}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            placeholder="email@example.com"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.payButton} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Pay with GCash"}
        </button>
        <p>{paymentStatus}</p>
      </form>
    </section>
  );
};

export default GCash;