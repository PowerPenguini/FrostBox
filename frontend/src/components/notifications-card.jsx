"use client";

import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useAuthContext } from "@/state/auth-context";
import { formatDate } from "@/formatting/date";
import { ScrollArea } from "./ui/scroll-area";
export function NotificationsCard({ className, ...props }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthContext();

  useEffect(() => {
    fetch("/api/v1/notifications", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => setNotifications(data))
      .catch((err) => console.error("Błąd pobierania powiadomień:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className={cn("flex flex-col gap-2 pb-2", className)} {...props}>
      <CardHeader>
        <CardTitle>Powiadomienia</CardTitle>
        <CardDescription>
          {loading
            ? "Ładowanie powiadomień..."
            : getNotificationMessage(notifications?.length)}
        </CardDescription>
      </CardHeader>
      <ScrollArea className="relative flex-1 min-h-0">
        <CardContent>
          <div className="py-6">
            {notifications?.map((notification, index) => (
              <Notification notification={notification} key={index} />
            ))}
          </div>
          <div className="top-0 left-0 absolute bg-gradient-to-t from-transparent to-white w-full h-6 pointer-events-none" />
          <div className="bottom-0 left-0 absolute bg-gradient-to-t from-white to-transparent w-full h-6 pointer-events-none" /> 
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

function Notification({ notification }) {
  return (
    <div className="items-start gap-4 grid grid-cols-[3px_1fr] mb-4 last:mb-0 pb-4 last:pb-0">
      <span
        className={`flex w-[3px] h-full ${
          notification.status === "CRITICAL" ? "bg-destructive" : "bg-amber-400"
        }`}
      />

      <div className="space-y-1">
        <p className="text-sm leading-none">
          {notification.status === "CRITICAL" && (
            <>
              Przekroczony interwał{" "}
              <span className="font-bold">{notification.event_type_name}</span>{" "}
              dla pojazdu{" "}
              <span className="font-bold">
                {notification.vehicle_registration_number}
              </span>
            </>
          )}
          {notification.status === "WARNING" && (
            <>
              Zbliża się interwał{" "}
              <span className="font-bold">{notification.event_type_name}</span>{" "}
              dla pojazdu{" "}
              <span className="font-bold">
                {notification.vehicle_registration_number}
              </span>
            </>
          )}
        </p>
        <p className="text-muted-foreground text-sm">
          {formatDate(notification.due_date)}
        </p>
      </div>
    </div>
  );
}

function getNotificationMessage(count) {
  if (count === 0 || !count) {
    return "Nie masz spraw, którymi musisz się zająć";
  }

  const mod10 = count % 10;
  const mod100 = count % 100;

  let word;

  if (count === 1) {
    word = "sprawa";
  } else if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) {
    word = "sprawy";
  } else {
    word = "spraw";
  }

  return `Masz ${count} ${word}, którymi musisz się zająć`;
}
