import React, { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAuthContext } from "@/state/auth-context";
import { translateRole } from "@/formatting/roles";

export function UserRoleSelect({ id, value, onChange }) {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthContext();

  useEffect(() => {
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/v1/users/roles", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error("Sieć niedostępna");
        }
        const data = await response.json();
        setRoles(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, [token]);

  if (loading) return <div>Loading...</div>;
  if (error)
    return (
      <div>
        <p className="text-red-500 text-sm font-medium">{error}</p>
      </div>
    );

  return (
    <div>
      <Select
        id={id}
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Wybierz rolę" />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role) => (
            <SelectItem key={role} value={role}>
              {translateRole(role)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
