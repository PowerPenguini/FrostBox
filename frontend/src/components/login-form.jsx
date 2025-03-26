"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link";


export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/v1/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Nieprawidłowy e-mail lub hasło');
      }

      const data = await response.json();
      const token = data.access_token;

      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub;
      const role = payload.role;
      
      localStorage.setItem("auth", JSON.stringify({ user: { userId, role }, token: token }));
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleLogin} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Zaloguj się</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Logujesz się do konta Voltdesk
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="email@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Hasło</Label>
            <Link href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
              Zapomniałeś hasła?
            </Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
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
