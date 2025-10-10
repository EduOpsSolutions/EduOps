// Handles PayMongo return_url for GCash/Maya and shows a SweetAlert
import { useEffect } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router-dom";

const PaymentCompleteSwal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Optionally parse payment_intent_id or status from query params
    const params = new URLSearchParams(location.search);
    const paymentIntentId = params.get("payment_intent_id");
    // You can fetch payment status here if needed

    Swal.fire({
      icon: "success",
      title: "Payment Complete!",
      html: `<div class='text-left'>Thank you for your payment.<br/>You may now close this tab or return to the dashboard.</div>`,
      confirmButtonText: "Go to Dashboard",
      confirmButtonColor: "#890E07"
    }).then(() => {
      navigate("/payment"); // Or wherever you want to redirect
    });
  }, [navigate, location]);

  return null; // No visible UI
};

export default PaymentCompleteSwal;
