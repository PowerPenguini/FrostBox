"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext();

function isJwtValid(token) {
  try {
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64);
    const payload = JSON.parse(payloadJson);
    const exp = payload.exp;
    if (!exp) return false;
    return exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export const AuthProvider = ({ children }) => {
  const [rawToken, setRawToken] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // <-- loading startuje jako true

  useEffect(() => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth"));
      if (auth?.token) {
        setRawToken(auth.token);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch("/api/v1/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      setError(null);
      setRawToken(token);
      localStorage.setItem(
        "auth",
        JSON.stringify({
          user: { userId, role },
          token,
        })
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const logout = () => {
    setRawToken("");
    setError(null);
    localStorage.removeItem("auth");
  };

  const token = useMemo(() => {
    return isJwtValid(rawToken) ? rawToken : null;
  }, [rawToken]);

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{ token, error, isAuthenticated, loading, logout, login }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
