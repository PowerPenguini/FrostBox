import React, { createContext, useContext, useEffect, useState } from 'react';

const CostsDataContext = createContext();

export const DataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/documents/cost');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetchData = () => {
    fetchData();
  };

  return (
    <CostsDataContext.Provider value={{ data, loading, error, refetchData }}>
      {children}
    </CostsDataContext.Provider>
  );
};

export const useCostsDataContext = () => {
  return useContext(CostsDataContext);
};
