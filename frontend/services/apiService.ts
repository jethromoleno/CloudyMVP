import axios, { AxiosInstance } from 'axios';

// Get the base URL from the environment variables (e.g., http://localhost:8000)
const API_BASE_URL: string = import.meta.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// 1. Create an Axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure cookies (like session cookies, if used) are sent with the request
  withCredentials: true, 
});

/**
 * Sets the Authorization header for all subsequent requests and stores the token.
 * @param token The JWT access token.
 */
export const setAuthToken = (token: string | null): void => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('accessToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('accessToken');
  }
};

// 2. Load existing token on initialization
const token = localStorage.getItem('accessToken');
if (token) {
  setAuthToken(token);
}

/**
 * Handles user login and stores the JWT token.
 */
export const loginUser = async (username: string, password: string): Promise<{ success: boolean, message?: string }> => {
  try {
    const response = await api.post('/api/token/', { username, password });
    const { access } = response.data;
    
    setAuthToken(access);

    return { success: true };
  } catch (error) {
    console.error("Login failed:", error);
    if (axios.isAxiosError(error) && error.response) {
      return { success: false, message: error.response.data.detail || "Invalid credentials." };
    }
    return { success: false, message: "An unexpected error occurred during login." };
  }
};

/**
 * Clears the JWT token from storage and headers.
 */
export const logoutUser = (): void => {
  setAuthToken(null);
};


// 3. Export the configured instance for generic requests
export default api;