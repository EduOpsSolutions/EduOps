import Cookies from 'js-cookie';
import { getCookieItem } from './jwt';

export const isAuthenticated = () => {
  const token = getCookieItem('token');
  const user = getCookieItem('user');
  return token !== null && user !== null;
};

export const getUser = () => {
  const user = getCookieItem('user');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  Cookies.remove('token');
  Cookies.remove('user');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};
