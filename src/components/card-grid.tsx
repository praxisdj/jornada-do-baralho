"use client";

import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock } from "lucide-react";
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <CardUI
          key={card.id}
          className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-0 shadow-sm bg-gradient-to-br from-card to-muted/10"
          onClick={() => onCardClick(card)}
        >
          <CardContent className="p-0">
            {/* Card Image */}
            <div className="relative aspect-[2.5/3.5] overflow-hidden rounded-t-lg bg-gradient-to-br from-muted/20 to-muted/40">
              <Image
                src={card.imageUrl || "/placeholder.svg"}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <Badge
                  variant={card.status === "signed" ? "default" : "secondary"}
                  className={`${
                    card.status === "signed"
                      ? "bg-success text-success-foreground"
                      : "bg-warning text-warning-foreground"
                  } shadow-sm`}
                >
                  {card.status === "signed" ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <Clock className="w-3 h-3 mr-1" />
                  )}
                  {card.status === "signed" ? "Assinada" : "Pendente"}
                </Badge>
              </div>
            </div>

            {/* Card Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-balance leading-tight">
                  {card.title}
                </h3>
                {card.description !== null && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {card.description}
                  </p>
                )}
                {card.signedBy && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Assinada por {card.signedBy}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-xs h-7 px-2 ml-auto"
                >
                  Ver detalhes
                </Button>
              </div>
            </div>
          </CardContent>
        </CardUI>
      ))}
    </div>
  );
}
