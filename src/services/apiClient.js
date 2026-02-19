import axios from "axios";
import { store } from "../store";
import { BASE_URL } from "../utils/constants";
import { setLoading } from "../features/loading/loadingSlice";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

apiClient.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.auth?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    store.dispatch(setLoading(true));
    return config;
  },
  (error) => {
    store.dispatch(setLoading(false));
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    store.dispatch(setLoading(false));
    return response;
  },
  async (error) => {
    store.dispatch(setLoading(false));
    return Promise.reject(error);
  }
);

export default apiClient;
