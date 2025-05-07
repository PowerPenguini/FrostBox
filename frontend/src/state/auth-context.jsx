"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth) {
        setToken(auth.token);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/v1/auth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Nieprawidłowy e-mail lub hasło");
      }


      const data = await response.json();
      const token = data.access_token;

      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.sub;
      const role = payload.role;

      setError(null)
      setToken(token)
      localStorage.setItem(
        "auth",
        JSON.stringify({ user: { userId, role }, token: token })
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider value={{ token, error, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
