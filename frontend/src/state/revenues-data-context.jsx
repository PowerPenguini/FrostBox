"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "./auth-context";

const RevenuesDataContext = createContext();

export const RevenuesDataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/v1/revenues", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw toast("Błąd sieciowy przy pobieraniu danych");
      }
      const result = await response.json();
      setData(result || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const refetchData = () => {
    fetchData();
  };

  return (
    <RevenuesDataContext.Provider value={{ data, loading, error, refetchData }}>
      {children}
    </RevenuesDataContext.Provider>
  );
};

export const useRevenuesDataContext = () => {
  return useContext(RevenuesDataContext);
};
