import React, { useState } from "react";
import styles from "../../styles/Payment.module.css";

const GCash = ({ amount, description, onPaymentSuccess, onPaymentError }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [payProcess, setPayProcess] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const publicKey = process.env.REACT_APP_PAYMONGO_PUBLIC_KEY;

  // Function to Create A Source
  const createSource = async () => {
    setPaymentStatus("Creating GCash Payment Source");
    
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(publicKey)}`
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount * 100,
            redirect: { 
              success: `${window.location.origin}/payment`, 
              failed: `${window.location.origin}/payment` 
            },
            billing: { 
              name: name, 
              phone: phone, 
              email: email 
            },
            type: 'gcash',
            currency: 'PHP'
          }
        }
      })
    };
    
    return fetch('https://api.paymongo.com/v1/sources', options)
      .then(response => response.json())
      .then(response => {
        console.log('GCash source response:', response);
        return response;
      })
      .catch(err => {
        console.error('GCash source error:', err);
        throw err;
      });
  };

  // Function to Listen to the Source in the Front End
  const listenToPayment = async (sourceId) => {
    let i = 5;
    for (i = 5; i > 0; i--) {
      setPaymentStatus(`Listening to Payment in ${i}`);
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (i === 1) {
        const sourceData = await fetch(
          'https://api.paymongo.com/v1/sources/' + sourceId,
          {
            headers: {
              Authorization: `Basic ${btoa(publicKey)}`
            }
          }
        ).then((response) => {
          return response.json();
        }).then((response) => {
          console.log('GCash source status:', response.data);
          return response.data;
        });

        if (sourceData.attributes.status === "failed") {
          setPaymentStatus("Payment Failed");
          onPaymentError && onPaymentError({ message: "Payment failed" });
        } else if (sourceData.attributes.status === "paid") {
          setPaymentStatus("Payment Success");
          onPaymentSuccess && onPaymentSuccess(sourceData);
        } else {
          i = 5;
          setPayProcess(sourceData.attributes.status);
        }
      }
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsProcessing(true);
    
    try {
      const source = await createSource();
      
      if (source.data && source.data.attributes && source.data.attributes.redirect && source.data.attributes.redirect.checkout_url) {
        window.open(source.data.attributes.redirect.checkout_url, "_blank");
        listenToPayment(source.data.id);
      } else {
        console.error('Invalid GCash source response:', source);
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error('GCash payment error:', error);
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
            placeholder="user@domain.com"
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
        <p>{payProcess}</p>
      </form>
    </section>
  );
};

export default GCash;