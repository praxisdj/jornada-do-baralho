"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardGrid } from "@/components/card-grid";
import { Leaderboard } from "@/components/leaderboard";
import { CardDetailModal } from "@/components/card-detail-modal";
import { LoginButton } from "@/components/login-button";
import { Trophy, Users, Star, TrendingUp, Loader2 } from "lucide-react";
import type { User } from "@/types/user.type";
import type { Card } from "@/types/card.type";
import type { CardStatus } from "@/types/card.type";

// Interface for display cards with user status
interface DisplayCard extends Card {
  status: CardStatus;
  comment?: string;
  signedBy?: string;
  signedDate?: string;
  userCardId?: string; // Add the userCard ID for updates (optional for CardGrid)
}

// Interface for leaderboard users
interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  signedCards: number;
}

export function CardDeckManager() {
  const { data: session, status } = useSession();
  const { user, isLoading: userLoading, error: userError } = useUser();
  const [cards, setCards] = useState<DisplayCard[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>(
    [],
  );
  const [isClient, setIsClient] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [selectedCard, setSelectedCard] = useState<DisplayCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Transform user cards to display cards
  useEffect(() => {
    if (user?.userCards) {
      const transformedCards: DisplayCard[] = user.userCards.map(
        (userCard) => ({
          id: userCard.card.id,
          code: userCard.card.code,
          title: userCard.card.title,
          description: userCard.card.description,
          imageUrl: userCard.card.imageUrl,
          createdAt: userCard.card.createdAt,
          updatedAt: userCard.card.updatedAt,
          status: userCard.status.toLowerCase() as CardStatus,
          comment: userCard.comment || undefined,
          signedBy: userCard.signedAt ? user.name || undefined : undefined,
          signedDate: userCard.signedAt
            ? new Date(userCard.signedAt).toISOString().split("T")[0]
            : undefined,
          userCardId: userCard.id, // Add the actual userCard ID
        }),
      );
      setCards(transformedCards);
      setIsLoading(false);
    } else if (user && !user.userCards) {
      // User exists but has no cards yet
      setCards([]);
      setIsLoading(false);
    } else if (!user && status === "unauthenticated") {
      // No user and not authenticated - stop loading
      setCards([]);
      setIsLoading(false);
    }
  }, [user, status]);

  // Set client-side flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch leaderboard users
  useEffect(() => {
    if (!isClient) return;

    const fetchLeaderboardUsers = async () => {
      try {
        setIsLoadingLeaderboard(true);
        const response = await fetch("/api/user");
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.statusText}`);
        }
        const users = await response.json();

        // Transform users to leaderboard format
        const leaderboardData: LeaderboardUser[] = users.map((user: User) => ({
          id: user.id,
          name: user.name || "Usuário",
          avatar: user.image || undefined,
          signedCards:
            user.userCards?.filter((userCard) => userCard.status === "SIGNED")
              .length || 0,
        }));

        setLeaderboardUsers(leaderboardData);
      } catch (err) {
        console.error("Error fetching leaderboard users:", err);
        setLeaderboardUsers([]);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchLeaderboardUsers();
  }, [isClient]);

  const signedCards = cards.filter((card) => card.status === "signed");
  const pendingCards = cards.filter((card) => card.status === "pending");

  const updateCard = (updatedCard: DisplayCard) => {
    setCards((prev) =>
      prev.map((card) => (card.id === updatedCard.id ? updatedCard : card)),
    );
  };

  const handleCardClick = (card: DisplayCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  // Loading state - only show if we're authenticated and loading
  if (status === "authenticated" && (isLoading || userLoading)) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              {userLoading
                ? "Carregando dados do usuário..."
                : "Carregando cartas..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (userError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">
                Erro ao carregar dados
              </h2>
              <p className="text-muted-foreground mb-4">{userError}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Jovem Nerd - Jornada do Baralho
            </h1>
            <p className="text-muted-foreground">
              Gerencie sua coleção de cartas do Jovem Nerd e acompanhe
              assinaturas
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
          <TabsTrigger value="collection">Minha Coleção</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          {isLoadingLeaderboard ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Carregando ranking...</p>
              </div>
            </div>
          ) : leaderboardUsers.length > 0 ? (
            <Leaderboard users={leaderboardUsers} />
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Nenhum usuário encontrado
                  </h3>
                  <p className="text-muted-foreground">
                    Ainda não há usuários cadastrados no sistema.
                  </p>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="collection" className="space-y-6">
          {status === "loading" ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Verificando autenticação...
                </p>
              </div>
            </div>
          ) : session ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <CardUI className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-success" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {signedCards.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Cartas Assinadas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CardUI>

                <CardUI className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {pendingCards.length}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Pendentes
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CardUI>

                <CardUI className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{cards.length}</p>
                        <p className="text-sm text-muted-foreground">
                          Total de Cartas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CardUI>

                <CardUI className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {Math.round(
                            (signedCards.length / cards.length) * 100,
                          )}
                          %
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Completude
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </CardUI>
              </div>

              <CardGrid cards={cards} onCardClick={handleCardClick} />
            </>
          ) : (
            <LoginButton />
          )}
        </TabsContent>
      </Tabs>

      {/* Card Detail Modal */}
      <CardDetailModal
        userCard={
          selectedCard && selectedCard.userCardId
            ? {
                id: selectedCard.userCardId, // Use the actual userCard ID
                userId: (session?.user as { id?: string })?.id || "",
                cardId: selectedCard.id,
                status: selectedCard.status as "SIGNED" | "PENDING",
                comment: selectedCard.comment || null,
                signedAt: selectedCard.signedDate
                  ? new Date(selectedCard.signedDate)
                  : null,
                createdAt: selectedCard.createdAt,
                updatedAt: selectedCard.updatedAt,
                card: selectedCard,
              }
            : null
        }
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={(userCard) => {
          if (userCard && selectedCard) {
            const updatedCard: DisplayCard = {
              ...selectedCard,
              status: userCard.status.toLowerCase() as CardStatus,
              comment: userCard.comment || undefined,
              signedBy: (session?.user as { name?: string })?.name || undefined,
              signedDate: userCard.signedAt
                ? new Date(userCard.signedAt).toISOString().split("T")[0]
                : undefined,
            };
            updateCard(updatedCard);
          }
        }}
      />
    </div>
  );
}
