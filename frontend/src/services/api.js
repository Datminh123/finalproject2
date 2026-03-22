
import axios from "axios";
const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============ JOB API ============
export const jobsAPI = {
  getAll: async (params) => {
    try {
      const response = await API.get('/jobs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await API.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  },

  create: async (jobData) => {
    try {
      const response = await API.post('/jobs', jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  update: async (id, jobData) => {
    try {
      const response = await API.put(`/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await API.delete(`/jobs/${id}`);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  search: async (filters) => {
    try {
      const response = await API.get('/jobs', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  }
};

// ============ APPLICATIONS API ============
export const applicationsAPI = {
  getAll: async (params) => {
    try {
      const response = await API.get('/applications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await API.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching application:', error);
      throw error;
    }
  },

  create: async (applicationData) => {
    try {
      const response = await API.post('/applications', applicationData);
      return response.data;
    } catch (error) {
      console.error('Error creating application:', error);
      throw error;
    }
  },

  updateStatus: async (id, status) => {
    try {
      const response = await API.put(`/applications/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await API.delete(`/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  },

  getByEmail: async (email) => {
    try {
      const response = await API.get(`/applications?candidateEmail=${email}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications by email:', error);
      throw error;
    }
  },

  getByJobId: async (jobId) => {
    try {
      const response = await API.get(`/applications?jobId=${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching applications by job:', error);
      throw error;
    }
  }
};

// ============ AUTH API ============
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await API.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await API.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await API.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await API.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await API.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    try {
      const response = await API.post('/auth/reset-password', { email, otp, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
};

// ============ ADMIN API ============
export const adminAPI = {
  getStats: async () => {
    try {
      const response = await API.get('/admin/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  // Users
  getUsers: async (params) => {
    try {
      const response = await API.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await API.put(`/admin/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await API.delete(`/admin/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Jobs
  getJobs: async (params) => {
    try {
      const response = await API.get('/admin/jobs', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  updateJob: async (id, jobData) => {
    try {
      const response = await API.put(`/admin/jobs/${id}`, jobData);
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  deleteJob: async (id) => {
    try {
      const response = await API.delete(`/admin/jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },

  // Applications
  getApplications: async (params) => {
    try {
      const response = await API.get('/admin/applications', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  deleteApplication: async (id) => {
    try {
      const response = await API.delete(`/admin/applications/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting application:', error);
      throw error;
    }
  }
};

// ============ USERS API (Optional) ============
export const usersAPI = {
  getAll: async () => {
    try {
      const response = await API.get('/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  create: async (userData) => {
    try {
      const response = await API.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  findByEmail: async (email) => {
    try {
      const response = await API.get(`/users?email=${email}`);
      const users = response.data;
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }
};

export default API;