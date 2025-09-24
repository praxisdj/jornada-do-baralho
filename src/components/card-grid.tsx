"use client";

import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Eye, Sparkles, Heart, Star } from "lucide-react";
import { useMotion } from "@/contexts/MotionContext";
import Image from "next/image";
import type { Card } from "@/types/card.type";
import type { CardStatus } from "@/types/card.type";

interface DisplayCard extends Card {
  status: CardStatus;
  comment?: string;
  signedBy?: string;
  signedDate?: string;
}

interface CardGridProps {
  cards: DisplayCard[];
  onCardClick: (card: DisplayCard) => void;
}

export function CardGrid({ cards, onCardClick }: CardGridProps) {
  const { prefersReducedMotion } = useMotion();

  // Empty state component
  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-6 text-center max-w-md">
          <div
            className={`relative ${prefersReducedMotion ? "" : "animate-bounce"}`}
          >
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Star className="w-3 h-3 text-yellow-900" />
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Sua coleção está vazia
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Que tal começar a colecionar cartas do Jovem Nerd? Faça login para
              começar sua jornada!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <CardUI
          key={card.id}
          className={`group cursor-pointer transition-all duration-300 ease-out hover:shadow-2xl hover:-translate-y-2 border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm overflow-hidden interactive ${
            card.status === "signed" ? "ring-2 ring-green-400/20" : ""
          } ${prefersReducedMotion ? "" : "hover:scale-[1.02]"}`}
          onClick={() => onCardClick(card)}
          style={
            prefersReducedMotion
              ? {}
              : {
                  animationDelay: `${index * 100}ms`,
                  animationName: "fadeInUp",
                  animationDuration: "0.6s",
                  animationTimingFunction: "ease-out",
                  animationFillMode: "forwards",
                }
          }
        >
          <CardContent className="p-0">
            {/* Card Image */}
            <div className="relative aspect-[652/1020] overflow-hidden bg-gradient-to-br from-muted/30 to-muted/60">
              <div className="absolute inset-4 rounded-lg overflow-hidden">
                <Image
                  src={card.imageUrl || "/placeholder.svg"}
                  alt={card.title}
                  fill
                  className={`object-contain transition-all duration-300 ${
                    prefersReducedMotion
                      ? ""
                      : "group-hover:scale-105 group-hover:brightness-110"
                  }`}
                />
              </div>

              {/* Gradient Overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
                  prefersReducedMotion
                    ? "opacity-0"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              />

              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <Badge
                  variant={card.status === "signed" ? "default" : "secondary"}
                  className={`${
                    card.status === "signed"
                      ? "bg-green-500/90 text-white border-green-400/50 shadow-lg"
                      : "bg-orange-500/90 text-white border-orange-400/50 shadow-lg"
                  } backdrop-blur-sm transition-all duration-300 ${
                    prefersReducedMotion ? "" : "group-hover:scale-105"
                  }`}
                >
                  {card.status === "signed" ? (
                    <CheckCircle className="w-3 h-3 mr-1.5" />
                  ) : (
                    <Clock className="w-3 h-3 mr-1.5" />
                  )}
                  {card.status === "signed" ? "Assinada" : "Pendente"}
                </Badge>
              </div>

              {/* Signed Sparkle Effect */}
              {card.status === "signed" && (
                <div
                  className={`absolute top-4 left-4 transition-opacity duration-300 ${
                    prefersReducedMotion
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Sparkles
                    className={`w-5 h-5 text-yellow-400 ${
                      prefersReducedMotion ? "" : "animate-pulse"
                    }`}
                  />
                </div>
              )}

              {/* Hover Overlay Content */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 transform ${
                  prefersReducedMotion
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
                }`}
              >
                <Button
                  size="sm"
                  className="bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg backdrop-blur-sm border border-primary-foreground/20"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Ver detalhes
                </Button>
              </div>
            </div>

            {/* Card Info */}
            <div className="p-3 space-y-2">
              <div className="space-y-2">
                <h3
                  className={`font-bold text-sm text-foreground leading-tight transition-colors duration-300 ${
                    prefersReducedMotion ? "" : "group-hover:text-primary"
                  }`}
                >
                  {card.title}
                </h3>
                {card.description !== null && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                )}
                {card.signedBy && (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    <span>Assinada por {card.signedBy}</span>
                  </div>
                )}
                {card.signedDate && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(card.signedDate).toLocaleDateString("pt-BR")}
                  </p>
                )}
              </div>

              {/* Bottom Action Area */}
              <div className="pt-1 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {card.status === "signed" ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-xs font-medium">Completa</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        <span className="text-xs font-medium">Pendente</span>
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className={`text-xs h-6 px-2 transition-all duration-300 hover:bg-primary/10 hover:text-primary ${
                      prefersReducedMotion
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Detalhes
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </CardUI>
      ))}
    </div>
  );
}
