import { createContext, useState, useEffect, useCallback } from 'react';
import { applicationsAPI } from '../services/api.js';

export const ApplicationsContext = createContext();

export const ApplicationsProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationsAPI.getAll();
      setApplications(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const addApplication = async (applicationData) => {
    setError(null);
    try {
      const newApplication = await applicationsAPI.create(applicationData);
      setApplications(prev => [...prev, newApplication]);
      return newApplication;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateApplicationStatus = async (id, status) => {
    setError(null);
    try {
      const updatedApplication = await applicationsAPI.updateStatus(id, status);
      setApplications(prev =>
        prev.map(app => app._id === id ? updatedApplication : app)
      );
      return updatedApplication;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteApplication = async (id) => {
    setError(null);
    try {
      await applicationsAPI.delete(id);
      setApplications(prev => prev.filter(app => app._id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getApplicationsByEmail = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationsAPI.getByEmail(email);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getApplicationsByJobId = async (jobId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await applicationsAPI.getByJobId(jobId);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <ApplicationsContext.Provider value={{
      applications,
      loading,
      error,
      addApplication,
      updateApplicationStatus,
      deleteApplication,
      getApplicationsByEmail,
      getApplicationsByJobId,
      refreshApplications: fetchApplications
    }}>
      {children}
    </ApplicationsContext.Provider>
  );
};
