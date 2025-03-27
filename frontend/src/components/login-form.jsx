"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/state/authContext";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { error, login } = useAuthContext();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    login(email, password);
  };

  useEffect(() => {
    if (!error) {
      router.push("/manager/dashboard");
    }
  }, [error]);

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleLogin}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Zaloguj się</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Logujesz się do konta Frostbox
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Hasło</Label>
            <Link
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Zapomniałeś hasła?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-red-500 font-medium text-sm">{error}</p>}
        <Button type="submit" className="w-full">
          Zaloguj
        </Button>
      </div>
      <div className="text-center text-sm">
        Nie masz konta? &nbsp;
        <Link href="#" className="underline underline-offset-4">
          Skontaktuj się z obsługą klienta
        </Link>
      </div>
    </form>
  );
}
