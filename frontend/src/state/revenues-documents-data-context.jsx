"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "./auth-context";

const RevenueDocumentsDataContext = createContext();

export const RevenueDocumentsDataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/v1/documents/revenue", {
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
    <RevenueDocumentsDataContext.Provider value={{ data, loading, error, refetchData }}>
      {children}
    </RevenueDocumentsDataContext.Provider>
  );
};

export const useRevenueDocumentsDataContext = () => {
  return useContext(RevenueDocumentsDataContext);
};
