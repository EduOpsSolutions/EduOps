import React, { useState } from "react";
import styles from "../../styles/Payment.module.css";

const CreditCard = ({ amount, description, onPaymentSuccess, onPaymentError }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    cardHolder: "",
    number: "",
    month: "",
    year: "",
    code: ""
  });

  const [paymentStatus, setPaymentStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "number") {
      const formattedValue = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      const matches = formattedValue.match(/\d{4,16}/g);
      const match = (matches && matches[0]) || '';
      const parts = [];
      for (let i = 0, len = match.length; i < len; i += 4) {
        parts.push(match.substring(i, i + 4));
      }
      if (parts.length) {
        setFormData(prev => ({ ...prev, [name]: parts.join(' ') }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Function to Listen to the Payment in the Front End
  const listenToPayment = async (fullClient) => {
    const paymentIntentId = fullClient.split('_client')[0];
    
    for (let i = 5; i > 0; i--) {
      setPaymentStatus(`Checking payment status... ${i}`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (i === 1) {
        const paymentIntentData = await fetch(
          'https://api.paymongo.com/v1/payment_intents/' + paymentIntentId + '?client_key=' + fullClient,
          {
            headers: {
              Authorization: `Basic ${Buffer.from(process.env.REACT_APP_PAYMONGO_PUBLIC_KEY).toString("base64")}`
            }
          }
        ).then((response) => {
          return response.json();
        }).then((response) => {
          console.log('Payment Intent Status:', response.data);
          return response.data;
        });

        if (paymentIntentData.attributes.last_payment_error) {
          setPaymentStatus(JSON.stringify(paymentIntentData.attributes.last_payment_error));
          onPaymentError && onPaymentError(paymentIntentData.attributes.last_payment_error);
        } else if (paymentIntentData.attributes.status === "succeeded") {
          setPaymentStatus("Payment Success");
          onPaymentSuccess && onPaymentSuccess(paymentIntentData);
        } else {
          i = 5; // Reset counter to continue checking
        }
      }
    }
  };

  // Function to Create a Payment Intent
  const createPaymentIntent = async () => {
    setPaymentStatus("Creating Payment Intent");
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/payments/create-intent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount,
          description: description,
          statement_descriptor: "EduOps"
        }),
      });

      const data = await response.json();
      console.log('Payment Intent Response:', data); // Debug log
      
      if (data.success && data.data.success) {
        // Backend returns: { success: true, data: { success: true, data: paymongoResponse, clientKey, paymentIntentId } }
        // We want the actual PayMongo payment intent data
        return data.data.data.data; // This should be the PayMongo payment intent object
      } else {
        throw new Error(data.message || data.data.error || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setPaymentStatus("Error creating payment intent");
      throw error;
    }
  };

  // Function to Create a Payment Method
  const createPaymentMethod = async () => {
    setPaymentStatus("Creating Payment Method");
    
    try {
      const expYear = parseInt(formData.year) > 2000 ? parseInt(formData.year) % 100 : parseInt(formData.year);
      console.log('Card details being sent:', {
        card_number: formData.number.replace(/\s/g, ''),
        exp_month: parseInt(formData.month),
        exp_year: expYear,
        cvc: formData.code,
      }); // Debug log
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/payments/create-method`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
          }
        }),
      });

      const data = await response.json();
      console.log('Payment Method Response:', data); // Debug log
      
      if (data.success && data.data.success) {
        return data.data.data; // Extract the actual PayMongo payment method data
      } else {
        // Handle PayMongo errors
        let errorMessage = 'Failed to create payment method';
        if (data.data && data.data.error && data.data.error.errors) {
          errorMessage = data.data.error.errors.map(err => err.detail || err.message).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        }
        console.error('Payment Method Error Details:', data.data?.error || data);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error creating payment method:', error);
      setPaymentStatus("Error creating payment method");
      throw error;
    }
  };

  // Function to Attach a Payment Method to the Intent
  const attachIntentMethod = async (intent, method) => {
    setPaymentStatus("Processing Payment");
    
    try {
      console.log('Intent object:', intent); // Debug log
      console.log('Method object:', method); // Debug log
      
      // Handle different possible intent object structures
      let clientKey;
      if (intent && intent.attributes && intent.attributes.client_key) {
        clientKey = intent.attributes.client_key;
      } else if (intent && intent.client_key) {
        clientKey = intent.client_key;
      } else {
        throw new Error('Client key not found in intent object');
      }
      
      // Handle method object structure - it's wrapped in a data property
      const methodId = method.data ? method.data.id : method.id;
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE}/api/v1/payments/attach-method`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentIntentId: intent.id,
          paymentMethodId: methodId,
          clientKey: clientKey
        }),
      });

      const data = await response.json();
      console.log('Attach Method Response:', data); // Debug log
      console.log('Full data structure:', JSON.stringify(data, null, 2)); // Deep debug log
      
      if (data.success) {
        // Try different possible structures based on your backend response pattern
        let paymentIntent;
        if (data.data && data.data.data && data.data.data.data) {
          paymentIntent = data.data.data.data; // For nested structure
        } else if (data.data && data.data.data) {
          paymentIntent = data.data.data; // Current attempt
        } else if (data.data) {
          paymentIntent = data.data; // Direct data
        }
        
        console.log('Extracted payment intent:', paymentIntent); // Debug log
        
        if (!paymentIntent || !paymentIntent.attributes) {
          throw new Error('Invalid payment intent structure returned from attach method');
        }
        
        const paymentIntentStatus = paymentIntent.attributes.status;
        
        if (paymentIntentStatus === 'awaiting_next_action') {
          setPaymentStatus("3D Secure Authentication Required");
          window.open(paymentIntent.attributes.next_action.redirect.url, "_blank");
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
      console.error('Error attaching payment method:', error);
      setPaymentStatus("Error processing payment");
      onPaymentError && onPaymentError(error);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    
    try {
      const paymentIntent = await createPaymentIntent();
      const paymentMethod = await createPaymentMethod();
      await attachIntentMethod(paymentIntent, paymentMethod);
    } catch (error) {
      console.error('Credit card payment error:', error);
      setPaymentStatus("Payment failed. Please try again.");
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
        <button type="submit" className={styles.payButton} disabled={isProcessing}>
          {isProcessing ? "Processing..." : "Pay with Card"}
        </button>
        <p>{paymentStatus}</p>
      </form>
    </section>
  );
};

export default CreditCard;