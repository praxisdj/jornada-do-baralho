"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LogIn, Star } from "lucide-react";

export function LoginButton() {
  const handleLogin = () => {
    signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="w-full max-w-md border-0 shadow-sm bg-gradient-to-br from-card to-muted/20">
        <CardContent className="p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto">
            <Star className="w-8 h-8 text-primary-foreground" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Acesso à Coleção</h2>
            <p className="text-muted-foreground">
              Faça login com sua conta Google para acessar sua coleção de cartas
            </p>
          </div>

          <Button onClick={handleLogin} className="w-full" size="lg">
            <LogIn className="w-5 h-5 mr-2" />
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
