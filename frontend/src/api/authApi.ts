import axiosClient from "./axiosClient";

export interface ActivateResetPayload {
  uid: string;
  token: string;
  new_password: string;
}

export const authApi = {
  /** First-time account activation. */
  activateAccount: async (payload: ActivateResetPayload) => {
    return axiosClient.post("/api/auth/activate/", payload);
  },

  /** Request a password reset link. */
  forgotPassword: async (email: string) => {
    return axiosClient.post("/api/auth/forgot-password/", { email });
  },

  /** Set a new password from a reset link. */
  resetPassword: async (payload: ActivateResetPayload) => {
    return axiosClient.post("/api/auth/reset-password/", payload);
  },

  /** Authenticated user changes their own password. */
  changePassword: async (current_password: string, new_password: string) => {
    return axiosClient.post("/api/auth/change-password/", {
      current_password,
      new_password,
    });
  },

  /** Administrator manually triggers a password reset for a user. */
  adminTriggerReset: async (userId: number) => {
    return axiosClient.post(`/api/users/${userId}/reset-password/`);
  },
};
