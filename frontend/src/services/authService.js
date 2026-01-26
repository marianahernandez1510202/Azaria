import api from './api';

export const authService = {
  login: async (email, credential, remember = false) => {
    return await api.post('/auth/login', {
      email,
      credential,
      remember,
      device_info: {
        name: navigator.platform,
        browser: navigator.userAgent,
        os: navigator.platform
      }
    });
  },

  logout: async () => {
    return await api.post('/auth/logout');
  },

  setupPIN: async (userId, pin, pinConfirmation) => {
    return await api.post('/auth/setup-pin', {
      user_id: userId,
      pin,
      pin_confirmation: pinConfirmation
    });
  },

  forgotPassword: async (email) => {
    return await api.post('/auth/forgot-password', { email });
  },

  verifyRecoveryCode: async (email, code) => {
    return await api.post('/auth/verify-code', { email, code });
  },

  resetPassword: async (resetToken, newCredential, credentialConfirmation) => {
    return await api.post('/auth/reset-password', {
      reset_token: resetToken,
      new_credential: newCredential,
      credential_confirmation: credentialConfirmation
    });
  },

  checkSession: async () => {
    return await api.get('/auth/check-session');
  },

  getTrustedDevices: async () => {
    return await api.get('/auth/devices');
  },

  logoutDevice: async (deviceId) => {
    return await api.delete(`/auth/devices/${deviceId}`);
  },

  logoutAllDevices: async () => {
    return await api.delete('/auth/devices/all');
  },

  completeOnboarding: async (userId) => {
    return await api.post(`/auth/onboarding/complete/${userId}`);
  }
};
