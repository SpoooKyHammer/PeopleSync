import axios from 'axios';

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API_URL,
  timeout: 1000,
  validateStatus: () => true,
  headers: {
    'Content-Type': 'application/json',
  }
});


client.interceptors.response.use(response => {
  return response;
}, error => {
  if (error.response && error.response.status === 401) {
    // Handle unauthorized access, e.g., redirect to login page
    console.log('Unauthorized access - redirecting to login.');
    // You might want to clear the token and redirect to login here
    setAuthToken(null); // Clear the token
    window.location.href = '/login'; // Redirect to login page
  }
  return Promise.reject(error);
});


/*
 * Sets or clears the authentication token in Axios and localStorage.
 *
 * @param {string | null} token - The JWT token to set. Pass `null` to clear the token.
 * */
export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem("authToken", token);
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("authToken");
    delete client.defaults.headers.common['Authorization'];
  }
};

export function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}
