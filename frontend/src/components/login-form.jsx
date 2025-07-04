import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/state/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorText } from "@/components/error-text";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Spinner } from "@/components/spinner";

export function LoginForm({ className, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { token, error, login, loading } = useAuthContext(); // loading - czy trwa sprawdzanie tokena
  const router = useRouter();

  useEffect(() => {
    if (token) {
      router.push("/manager/dashboard");
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  if (loading || token) {
    return (
      <div className="flex flex-col space-y-4"> 
        <Spinner />
        <div className="text-center"> Proszę czekać...</div>
        
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleLogin}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-bold text-2xl">Zaloguj się</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Logujesz się do konta FrostBox
        </p>
      </div>
      <div className="gap-6 grid">
        <div className="gap-2 grid">
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
        <div className="gap-2 grid">
          <div className="flex items-center">
            <Label htmlFor="password">Hasło</Label>
            <Link
              href="#"
              className="ml-auto text-sm hover:underline underline-offset-4"
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
        {error && <ErrorText text={error} />}
        <Button type="submit" className="w-full">
          Zaloguj
        </Button>
      </div>
      <div className="text-sm text-center">
        Nie masz konta? &nbsp;
        <Link href="#" className="underline underline-offset-4">
          Skontaktuj się z obsługą klienta
        </Link>
      </div>
    </form>
  );
}
