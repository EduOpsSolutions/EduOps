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
      console.log('Payment Intent response:', intentData);
      
      if (!intentData.success) {
        throw new Error('Failed to create payment intent');
      }

      // Extract payment intent data correctly based on PayMongo documentation
      // Response structure: { data: { id: "pi_xxx", attributes: { client_key: "pi_xxx_client_xxx" } } }
      const paymentIntent = intentData.data.data || intentData.data; // Handle nested response
      const clientKey = intentData.clientKey || intentData.data?.data?.attributes?.client_key || intentData.data?.attributes?.client_key;
      
      // Alternative extraction method as suggested by PayMongo: extract Payment Intent ID from client key
      const paymentIntentId = clientKey ? clientKey.split('_client')[0] : paymentIntent?.id;
      
      console.log('Payment Intent ID:', paymentIntentId);
      console.log('Client Key:', clientKey);
      
      if (!paymentIntentId) {
        console.error('Full response:', intentData);
        throw new Error('Payment Intent ID not found in response');
      }

      // Step 2: Create Payment Method for GCash
      let paymentMethod;
      try {
        // Create GCash payment method with empty details object
        const methodResponse = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/payments/create-method`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'gcash', // GCash payment method type
            details: {}, // Empty details object for e-wallet per PayMongo guidance
            billing: {
              name: name,
              email: email,
              phone: phone,
            }
          }),
        });

        const methodData = await methodResponse.json();
        console.log('Payment Method response:', methodData);
        
        if (!methodData.success) {
          throw new Error('Failed to create GCash payment method');
        }

        paymentMethod = methodData.data.data || methodData.data;
      } catch (error) {
        throw new Error(`Payment method creation failed: ${error.message}`);
      }
      
      console.log('Payment Method ID:', paymentMethod.id);

      // Step 3: Attach Payment Method to Payment Intent (with return_url for GCash)
      const attachResponse = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/payments/attach-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntentId,
          paymentMethodId: paymentMethod.id,
          clientKey: clientKey,
          return_url: `${window.location.origin}/payment-complete` // Return URL required for GCash
        }),
      });

      const attachData = await attachResponse.json();
      console.log('Attach Payment Method response:', attachData);
      
      if (!attachData.success) {
        throw new Error('Failed to attach payment method');
      }

      const attachedIntent = attachData.data.data || attachData.data;
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