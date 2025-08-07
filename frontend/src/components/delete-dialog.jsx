"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuthContext } from "@/state/auth-context"
import { useState } from "react"
import { toast } from "sonner"
export function DeleteDialog({ title, description, id, endpoint, open, onOpenChange, onDeleted }) {
  const [loading, setLoading] = useState(false)
  const {token} = useAuthContext()

  const handleDelete = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${endpoint}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error("Failed to delete")
      }

      onDeleted?.(id)
      onOpenChange(false)
    } catch (err) {
      toast.error("Błąd usuwania typu zdarzenia");
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="destructive" disabled={loading}>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={loading} variant="destructive">
            {loading ? "Usuwanie..." : "Usuń"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
