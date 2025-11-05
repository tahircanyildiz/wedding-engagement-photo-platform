export const setToken = (token) => {
  localStorage.setItem('accessToken', token);
};

export const getToken = () => {
  return localStorage.getItem('accessToken');
};

export const setRefreshToken = (token) => {
  localStorage.setItem('refreshToken', token);
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

export const removeToken = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const isAuthenticated = () => {
  return !!getToken();
};
