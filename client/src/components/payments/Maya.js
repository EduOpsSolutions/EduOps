import React, { useState } from 'react';
import styles from '../../styles/Payment.module.css';
const apiUrl = process.env.REACT_APP_API_URL;
const paymongoPublicKey = process.env.REACT_APP_PAYMONGO_PUBLIC_KEY;
const Maya = ({
  amount,
  description,
  userId,
  firstName,
  lastName,
  userEmail,
  isLocked,
  onPaymentSuccess,
  onPaymentError,
  paymentId,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (isLocked) return;
    setIsProcessing(true);
    
    // Validate phone
    if (!phone || phone.length < 11) {
      setIsProcessing(false);
      setPhoneError('Phone number must be at least 11 digits.');
      return;
    }

    // Validate email
    if (!email || email.trim() === '') {
      setIsProcessing(false);
      setEmailError('Email is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setIsProcessing(false);
      setEmailError('Please enter a valid email address.');
      return;
    }

    // Clear errors
    setPhoneError('');
    setEmailError('');

    try {
      console.log('Starting Maya payment with traditional PIPM workflow...');
      await handleTraditionalPIPMFlow();
    } catch (error) {
      console.error('Maya payment error:', error);
      setPaymentStatus('Payment failed. Please try again.');
      onPaymentError && onPaymentError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTraditionalPIPMFlow = async () => {
    try {
      // Create Payment Intent
      const intentResponse = await fetch(`${apiUrl}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amount,
          currency: 'PHP',
          description: description,
          payment_method_allowed: ['paymaya'],
          userId: userId,
          firstName: firstName,
          lastName: lastName,
          email: email,
          paymentId: typeof paymentId !== 'undefined' ? paymentId : undefined
        }),
      });

      const intentData = await intentResponse.json();
      console.log('[Maya] create-intent response ok:', intentResponse.ok, 'success:', intentData?.success);

      if (!intentResponse.ok) {
        throw new Error(
          intentData.message ||
            intentData.error ||
            `HTTP ${intentResponse.status}: Failed to create payment intent`
        );
      }

      if (!intentData.success) {
        throw new Error(
          intentData.message ||
            intentData.error ||
            'Failed to create payment intent'
        );
      }
      const paymentIntent = intentData?.data?.data;
      const clientKey = paymentIntent?.attributes?.client_key;
      console.log('[Maya] intent id:', paymentIntent?.id, 'clientKey:', !!clientKey);
      const paymentIntentId =
        paymentIntent?.id ||
        (clientKey ? clientKey.split('_client')[0] : undefined);

      if (!paymentIntentId) {
        console.error('Full response:', intentData);
        throw new Error('Payment Intent ID not found in response');
      }

      // Create Payment Method
      let paymentMethod;
      try {
        const methodResponse = await fetch(
          'https://api.paymongo.com/v1/payment_methods',
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${btoa(paymongoPublicKey + ':')}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: {
                attributes: {
                  type: 'paymaya',
                  billing: {
                    name: name,
                    email: userEmail,
                    phone: phone,
                  },
                },
              },
            }),
          }
        );

        const methodData = await methodResponse.json();

        console.log('[Maya] payment_method created:', !!methodData?.data, methodData?.data?.id);

        if (!methodData.data) {
          const errMsg =
            methodData?.errors?.map?.((e) => e?.detail).join(', ') ||
            'Failed to create Maya payment method';
          throw new Error(errMsg);
        }

        paymentMethod = methodData.data;
      } catch (error) {
        throw new Error(`Payment method creation failed: ${error.message}`);
      }

      // Attach Payment Method to Payment Intent
      const attachResponse = await fetch(`${apiUrl}/payments/attach-method`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_intent_id: paymentIntentId,
          payment_method_id: paymentMethod.id,
          client_key: clientKey,
          //return_url: `${process.env.REACT_APP_CLIENT_URL || window.location.origin}/payment-complete` //production
          return_url: `${window.location.origin}/payment-complete`, // Redirect to completion page
        }),
      });

      const attachData = await attachResponse.json();

      console.log('[Maya] attach-method response ok:', attachResponse.ok, 'success:', attachData?.success);

      const attachedIntent = attachData?.data?.data || attachData?.data;
      const status = attachedIntent.attributes.status;

      if (status === 'awaiting_next_action') {
        const nextAction = attachedIntent.attributes.next_action;
        console.log('[Maya] awaiting_next_action redirect url:', nextAction?.redirect?.url);
        if (nextAction && nextAction.redirect && nextAction.redirect.url) {
          setPaymentStatus('Redirecting to Maya...');
          window.location.href = nextAction.redirect.url;
        } else {
          throw new Error('No redirect URL received');
        }
      } else if (status === 'succeeded') {
        console.log('[Maya] intent succeeded, triggering onPaymentSuccess');
        setPaymentStatus('Payment Success');
        onPaymentSuccess && onPaymentSuccess(attachedIntent);
      } else {
        console.warn('[Maya] unexpected status:', status);
        throw new Error(`Unexpected payment status: ${status}`);
      }
    } catch (error) {
      console.error('[Maya] flow error:', error);
      throw error;
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
            type="tel"
            inputMode="numeric"
            maxLength="15"
            value={phone}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '').slice(0, 15);
              setPhone(digits);
              if (digits.length >= 11) setPhoneError('');
            }}
            required
          />
          {phoneError && (
            <small style={{ color: '#b71c1c' }}>{phoneError}</small>
          )}
        </div>
        <div className={styles.formField}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            placeholder="email@example.com"
            className={styles.input}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (e.target.value.trim()) setEmailError('');
            }}
            required
          />
          {emailError && (
            <small style={{ color: '#b71c1c' }}>{emailError}</small>
          )}
        </div>
        <button
          type="submit"
          className={styles.payButton}
          disabled={isProcessing || isLocked}
        >
          {isLocked
            ? 'Payment Locked'
            : isProcessing
            ? 'Processing...'
            : 'Pay with Maya'}
        </button>
        <p>{paymentStatus}</p>
      </form>
    </section>
  );
};

export default Maya;
