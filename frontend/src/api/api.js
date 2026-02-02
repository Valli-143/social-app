import axios from 'axios';

const api = axios.create({
  baseURL: 'https://social-app-backend-b6dw.onrender.com',
});

export default api;
