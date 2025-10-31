import { useEffect, useState } from "react";
import axios from "axios";
import { getCookieItem } from "../utils/jwt";

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const token = getCookieItem("token");
      const res = await axios.get(`${API_BASE_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(res.data.data || []);
    } catch (err) {
      setNotifications([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, loading, fetchNotifications };
}