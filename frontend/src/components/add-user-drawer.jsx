import { useState } from "react";
import { useUsersDataContext } from "@/state/users-data-context";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { Label } from "./ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuthContext } from "@/state/auth-context";
import { UserRoleSelect } from "./user-role-select";
import { ErrorText } from "@/components/error-text";

export function AddUserDrawer() {
  const { refetchData } = useUsersDataContext();
  const { token } = useAuthContext();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const isMobile = useIsMobile();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!firstName) {
      // TODO add validation
      setError("Wprowadź imię");
      return;
    }

    if (!lastName) {
      setError("Wprowadź nazwisko");
      return;
    }

    if (!email) {
      setError("Wprowadź e-mail");
      return;
    }

    if (!password) {
      setError("Wprowadź hasło");
      return;
    }
    if (!role) {
      setError("Wprowadź hasło");
      return;
    }

    const payload = {
      first_name: firstName,
      last_name: lastName,
      email,
      password,
      role,
    };

    try {
      const response = await fetch("/api/v1/users", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast("Użytkownik dodany pomyślnie!");
      } else {
        toast("Błąd podczas dodawania użytkownika.");
      }
    } catch (error) {
      toast("Błąd sieci podczas przesyłania użytkownika.");
    } finally {
      refetchData();
      setOpen(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          <span className="hidden lg:inline">Dodaj użytkownika</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>Dodaj pojazd</DrawerTitle>
          <DrawerDescription>
            Dodaj użytkownika i nadaj mu odpowiednią rolę. Rola powinna być jak najniższa.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto text-sm">
          <form
            id="cost-document-form"
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col gap-3 px-4 pb-4">
              <Label htmlFor="firstName">Imię</Label>
              <Input
                id="firstName"
                placeholder="Jan"
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Label htmlFor="lastName">Nazwisko</Label>
              <Input
                id="lastName"
                placeholder="Kowalski"
                onChange={(e) => setLastName(e.target.value)}
              />
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="jan.kowalski@example.com"
                onChange={(e) => setEmail(e.target.value)}
              />
              <Label htmlFor="password">Passowrd</Label>
              <Input
                id="password"
                type="password"
                placeholder="Hasło"
                onChange={(e) => setPassword(e.target.value)}
              />
              <Label htmlFor="role">Uprawnienia</Label>
              <UserRoleSelect id="role"/>
              {error && (
                <ErrorText text={error} />
              )}
            </div>
          </form>
        </div>
        <DrawerFooter>
          <Button form="cost-document-form" type="submit">
            Dodaj
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Anuluj</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
