"use client";

import { useState, useEffect } from "react";
import type { CardStatus } from "@/types/card.type";
import { useUser } from "@/contexts/UserContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  Calendar,
  MessageSquare,
  Save,
} from "lucide-react";
import Image from "next/image";
import type { UserCard } from "@/types/userCard.type";

interface CardDetailModalProps {
  userCard: UserCard | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (card: UserCard) => void;
}

export function CardDetailModal({
  userCard,
  isOpen,
  onClose,
  onUpdate,
}: CardDetailModalProps) {
  const { user, refetchUser } = useUser();
  const [status, setStatus] = useState<CardStatus>("pending");
  const [comment, setComment] = useState("");
  const [signedDate, setSignedDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when card changes
  useEffect(() => {
    if (userCard) {
      setStatus(userCard.status as CardStatus);
      setComment(userCard.comment || "");
      setSignedDate(userCard.signedAt?.toISOString().split("T")[0] || "");
    }
  }, [userCard]);

  if (!userCard) return null;

  const handleSave = async () => {
    if (!user || !userCard) return;

    // Check if user has a valid ID
    if (!user.id) {
      console.error("CardDetailModal: User has no ID, cannot save");
      return;
    }

    setIsSaving(true);
    try {
      const updatedCard: UserCard = {
        ...userCard,
        status: status === "signed" ? "SIGNED" : "PENDING",
        comment: comment.trim() || null,
        signedAt: status === "signed" ? new Date(signedDate) : null,
      };

      // Call the PATCH API endpoint
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: user.id,
          userCards: [updatedCard],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update card: ${response.statusText}`);
      }

      // Refetch user data to get the updated information
      await refetchUser();

      // Call the original onUpdate callback for local state updates
      onUpdate(updatedCard);
      onClose();
    } catch (error) {
      console.error("Error updating card:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-balance">
            Detalhes da Carta
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card Display */}
          <div className="space-y-4">
            <CardUI className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/10">
              <CardContent className="p-0">
                <div className="relative aspect-[2.5/3.5] overflow-hidden rounded-lg bg-gradient-to-br from-muted/20 to-muted/40">
                  <Image
                    src={userCard.card.imageUrl || "/placeholder.svg"}
                    alt={userCard.card.title}
                    fill
                    className="object-cover"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge
                      variant={status === "signed" ? "default" : "secondary"}
                      className={`${
                        status === "signed"
                          ? "bg-success text-success-foreground"
                          : "bg-warning text-warning-foreground"
                      } shadow-sm`}
                    >
                      {status === "signed" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <Clock className="w-3 h-3 mr-1" />
                      )}
                      {status === "signed" ? "Assinada" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </CardUI>
          </div>

          {/* Card Management Form */}
          <div className="space-y-6">
            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">Status da Carta</Label>
              <Select
                value={status}
                onValueChange={(value: CardStatus) => setStatus(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-warning" />
                      Pendente
                    </div>
                  </SelectItem>
                  <SelectItem value="signed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      Assinada
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Signed Date (only if status is signed) */}
            {status === "signed" && (
              <div className="space-y-2">
                <Label htmlFor="signedDate">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Data da Assinatura
                </Label>
                <Input
                  id="signedDate"
                  type="date"
                  value={signedDate}
                  onChange={(e) => setSignedDate(e.target.value)}
                />
              </div>
            )}

            <Separator />

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="comment">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Comentário
              </Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Adicione um comentário sobre esta carta..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button variant="outline" onClick={onClose} disabled={isSaving}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
