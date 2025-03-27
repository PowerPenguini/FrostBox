"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthContext } from "./authContext";

const CostsDataContext = createContext();

export const CostsDataProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuthContext();

  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch("/api/v1/documents/cost", {
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
      setData(result);
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
    <CostsDataContext.Provider value={{ data, loading, error, refetchData }}>
      {children}
    </CostsDataContext.Provider>
  );
};

export const useCostsDataContext = () => {
  return useContext(CostsDataContext);
};
