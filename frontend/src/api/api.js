import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // ajuste a URL base conforme seu backend
  timeout: 15000,
});

export const setTokens = ({ accessToken, refreshToken }) => {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
};

export const getAccessToken = () => localStorage.getItem('token');
export const getRefreshToken = () => localStorage.getItem('refreshToken');

// Variável para guardar a função de logout
let logoutFn = null;
export const setLogout = (logout) => {
  logoutFn = logout;
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  config => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return api(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        if (logoutFn) logoutFn();
        return Promise.reject(error);
      }

      return new Promise((resolve, reject) => {
        api.post('/auth/refresh-token', { refreshToken })
          .then(({ data }) => {
            setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
            api.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
            originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
            processQueue(null, data.accessToken);
            resolve(api(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            if (logoutFn) logoutFn();
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
