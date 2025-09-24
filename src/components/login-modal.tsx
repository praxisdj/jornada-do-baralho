"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, Star, Heart } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  cardTitle?: string;
}

export function LoginModal({
  isOpen,
  onClose,
  onLogin,
  cardTitle,
}: LoginModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-primary" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Entre com sua conta Google para começar!
              </h3>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button onClick={onLogin} className="w-full" size="lg">
              <LogIn className="w-5 h-5 mr-2" />
              Entrar com Google
            </Button>

            <Button onClick={onClose} variant="outline" className="w-full">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
