import React, { useState } from 'react';
import styles from '../../styles/Payment.module.css';

const CreditCard = ({
  amount,
  description,
  userId,
  firstName,
  lastName,
  userEmail,
  isLocked,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    cardHolder: '',
    number: '',
    month: '',
    year: '',
    code: '',
  });

  const [paymentStatus, setPaymentStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'number') {
      const formattedValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = formattedValue.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || '';
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
        setFormData((prev) => ({ ...prev, [name]: parts.join(' ') }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const listenToPayment = async (fullClient) => {
    const paymentIntentId = fullClient.split('_client')[0];

    for (let i = 5; i > 0; i--) {
      setPaymentStatus(`Checking payment status... ${i}`);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (i === 1) {
        const paymentIntentData = await fetch(
          'https://api.paymongo.com/v1/payment_intents/' +
            paymentIntentId +
            '?client_key=' +
            fullClient,
          {
            headers: {
              Authorization: `Basic ${btoa(
                process.env.REACT_APP_PAYMONGO_PUBLIC_KEY + ':'
              )}`,
            },
          }
        )
          .then((response) => {
            return response.json();
          })
          .then((response) => {
            console.log('Payment Intent Status:', response.data);
            return response.data;
          });

        if (paymentIntentData.attributes.last_payment_error) {
          setPaymentStatus(
            JSON.stringify(paymentIntentData.attributes.last_payment_error)
          );
          onPaymentError &&
            onPaymentError(paymentIntentData.attributes.last_payment_error);
        } else if (paymentIntentData.attributes.status === 'succeeded') {
          setPaymentStatus('Payment Success');
          onPaymentSuccess && onPaymentSuccess(paymentIntentData);
        } else {
          i = 5;
        }
      }
    }
  };

  const createPaymentIntent = async () => {
    setPaymentStatus('Creating Payment Intent');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE}/api/v1/payments/create-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: amount,
            description: description,
            statement_descriptor: 'EduOps',
            userId: userId,
            firstName: firstName,
            lastName: lastName,
            email: userEmail,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `HTTP ${response.status}: Failed to create payment intent`
        );
      }

      if (data.success && data.data && data.data.data) {
        return data.data.data;
      } else {
        throw new Error(
          data.message || data.error || 'Failed to create payment intent'
        );
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setPaymentStatus('Error creating payment intent');
      throw error;
    }
  };

  // Create Payment Method
  const createPaymentMethod = async () => {
    setPaymentStatus('Creating Payment Method');

    try {
      const expYear =
        parseInt(formData.year) > 2000
          ? parseInt(formData.year) % 100
          : parseInt(formData.year);

      const response = await fetch(
        'https://api.paymongo.com/v1/payment_methods',
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa(
              process.env.REACT_APP_PAYMONGO_PUBLIC_KEY + ':'
            )}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              attributes: {
                type: 'card',
                details: {
                  card_number: formData.number.replace(/\s/g, ''),
                  exp_month: parseInt(formData.month),
                  exp_year: expYear,
                  cvc: formData.code,
                },
                billing: {
                  name: formData.name,
                  email: formData.email,
                  phone: formData.phone,
                },
              },
            },
          }),
        }
      );

      const data = await response.json();
      if (data.data) {
        return data.data;
      } else {
        let errorMessage = 'Failed to create payment method';
        if (data.data && data.data.error && data.data.error.errors) {
          errorMessage = data.data.error.errors
            .map((err) => err.detail || err.message)
            .join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      setPaymentStatus('Error creating payment method');
      throw error;
    }
  };

  // Attach Payment Method to the Intent
  const attachIntentMethod = async (intent, method) => {
    setPaymentStatus('Processing Payment');

    try {
      const clientKey = intent?.attributes?.client_key;
      if (!clientKey) throw new Error('Client key not found in intent object');

      const methodId = method?.id || method?.data?.id;

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE}/api/v1/payments/attach-method`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            payment_intent_id: intent?.id,
            payment_method_id: methodId,
            client_key: clientKey,
          }),
        }
      );

      const data = await response.json();
      if (data.success && data.data && data.data.data) {
        const paymentIntent = data.data.data;

        if (!paymentIntent || !paymentIntent.attributes) {
          throw new Error(
            'Invalid payment intent structure returned from attach method'
          );
        }

        const paymentIntentStatus = paymentIntent.attributes.status;

        if (paymentIntentStatus === 'awaiting_next_action') {
          setPaymentStatus('3D Secure Authentication Required');
          window.open(
            paymentIntent.attributes.next_action.redirect.url,
            '_blank'
          );
          listenToPayment(paymentIntent.attributes.client_key);
        } else {
          setPaymentStatus(paymentIntentStatus);
          if (paymentIntentStatus === 'succeeded') {
            onPaymentSuccess && onPaymentSuccess(paymentIntent);
          }
        }
      } else {
        throw new Error(data.message || 'Failed to attach payment method');
      }
    } catch (error) {
      setPaymentStatus('Error processing payment');
      onPaymentError && onPaymentError(error);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (isLocked) return;
    setIsProcessing(true);

    try {
      const paymentIntent = await createPaymentIntent();
      const paymentMethod = await createPaymentMethod();
      await attachIntentMethod(paymentIntent, paymentMethod);
    } catch (error) {
      setPaymentStatus('Payment failed. Please try again.');
      onPaymentError && onPaymentError(error);
    } finally {
      setIsProcessing(false);
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
            name="name"
            className={styles.input}
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="phone">Phone Number:</label>
          <input
            id="phone"
            placeholder="09xxxxxxxxx"
            name="phone"
            className={styles.input}
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            placeholder="user@domain.com"
            className={styles.input}
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        <h2>Payment Details</h2>
        <div className={styles.formField}>
          <label htmlFor="cc-name">Card Holder:</label>
          <input
            id="cc-name"
            name="cardHolder"
            placeholder="Juan Dela Cruz"
            className={styles.input}
            value={formData.cardHolder}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="cc-number">Card number:</label>
          <input
            id="cc-number"
            name="number"
            maxLength="19"
            placeholder="1111 2222 3333 4444"
            className={styles.input}
            value={formData.number}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.formField}>
          <label htmlFor="expiry-month">Expiry date:</label>
          <div className={styles.dateVal}>
            <select
              id="expiry-month"
              name="month"
              className={styles.select}
              value={formData.month}
              onChange={handleInputChange}
              required
            >
              <option value="">Month</option>
              <option value="1">01</option>
              <option value="2">02</option>
              <option value="3">03</option>
              <option value="4">04</option>
              <option value="5">05</option>
              <option value="6">06</option>
              <option value="7">07</option>
              <option value="8">08</option>
              <option value="9">09</option>
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
            </select>
            <select
              id="expiry-year"
              name="year"
              className={styles.select}
              value={formData.year}
              onChange={handleInputChange}
              required
            >
              <option value="">Year</option>
              <option value="2024">24</option>
              <option value="2025">25</option>
              <option value="2026">26</option>
              <option value="2027">27</option>
              <option value="2028">28</option>
              <option value="2029">29</option>
              <option value="2030">30</option>
              <option value="2031">31</option>
              <option value="2032">32</option>
              <option value="2033">33</option>
              <option value="2034">34</option>
              <option value="2035">35</option>
            </select>
          </div>
        </div>
        <div className={styles.formField}>
          <label htmlFor="sec-code">Security code:</label>
          <input
            name="code"
            type="password"
            maxLength="3"
            placeholder="123"
            className={styles.input}
            value={formData.code}
            onChange={handleInputChange}
            required
          />
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
            : 'Pay with Card'}
        </button>
        <p>{paymentStatus}</p>
      </form>
    </section>
  );
};

export default CreditCard;
