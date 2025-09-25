"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useUser } from "@/contexts/UserContext";
import { useMotion } from "@/contexts/MotionContext";
import { Card as CardUI, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardGrid } from "@/components/card-grid";
import { Leaderboard } from "@/components/leaderboard";
import { CardDetailModal } from "@/components/card-detail-modal";
import { LoginModal } from "@/components/login-modal";
import { SuccessToast } from "@/components/success-toast";
import {
  Trophy,
  Users,
  Star,
  TrendingUp,
  Loader2,
  Filter,
  LogOut,
  LogIn,
} from "lucide-react";
import Image from "next/image";
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
  const { prefersReducedMotion } = useMotion();
  const [cards, setCards] = useState<DisplayCard[]>([]);
  const [allCards, setAllCards] = useState<DisplayCard[]>([]);
  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>(
    []
  );
  const [isClient, setIsClient] = useState(false);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [selectedCard, setSelectedCard] = useState<DisplayCard | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedCardForLogin, setSelectedCardForLogin] =
    useState<DisplayCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [statusFilter, setStatusFilter] = useState<CardStatus | "all">("all");

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
        })
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

  // Fetch all cards when user is not authenticated
  useEffect(() => {
    if (!isClient) return;

    const fetchAllCards = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/card");
        if (!response.ok) {
          throw new Error(`Failed to fetch cards: ${response.statusText}`);
        }
        const cardsData = await response.json();

        // Transform cards to display format with pending status for non-authenticated users
        const transformedCards: DisplayCard[] = cardsData.map((card: Card) => ({
          id: card.id,
          code: card.code,
          title: card.title,
          description: card.description,
          imageUrl: card.imageUrl,
          createdAt: card.createdAt,
          updatedAt: card.updatedAt,
          status: "pending" as CardStatus, // All cards show as pending for non-authenticated users
        }));

        setAllCards(transformedCards);
      } catch (err) {
        console.error("Error fetching all cards:", err);
        setAllCards([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch all cards if user is not authenticated
    if (status === "unauthenticated") {
      fetchAllCards();
    }
  }, [isClient, status]);

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

  // Use different card sets based on authentication status
  const displayCards = session ? cards : allCards;
  const signedCards = displayCards.filter((card) => card.status === "signed");
  const pendingCards = displayCards.filter((card) => card.status === "pending");

  // Filter cards based on selected status
  const filteredCards =
    statusFilter === "all"
      ? displayCards
      : displayCards.filter((card) => card.status === statusFilter);

  const updateCard = (updatedCard: DisplayCard) => {
    setCards((prev) =>
      prev.map((card) => (card.id === updatedCard.id ? updatedCard : card))
    );

    // Show success toast
    setSuccessMessage("Carta atualizada com sucesso! 🎉");
    setShowSuccessToast(true);
  };

  const handleCardClick = (card: DisplayCard) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleStatusFilterChange = (status: CardStatus | "all") => {
    setStatusFilter(status);
  };

  const handleStatsCardClick = (status: CardStatus | "all") => {
    setStatusFilter(status);
    // Switch to collection tab if not already there
    if (activeTab !== "collection") {
      setActiveTab("collection");
    }
  };

  const handleLogin = () => {
    setIsLoginModalOpen(false);
    setSelectedCardForLogin(null);
    signIn("google", { callbackUrl: "/" });
  };

  const handleCardClickForLogin = (card: DisplayCard) => {
    setSelectedCardForLogin(card);
    setIsLoginModalOpen(true);
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  // Loading state - only show if we're authenticated and loading
  if (status === "authenticated" && (isLoading || userLoading)) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden group cursor-pointer">
                <Image
                  src="/favicon.ico"
                  alt="Jovem Nerd - Jornada do Baralho"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-balance">
                  Jovem Nerd - Jornada do Baralho
                </h1>
                <p className="text-muted-foreground text-pretty">
                  Gerencie sua coleção de cartas do Jovem Nerd e acompanhe
                  assinaturas
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
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
        </main>
      </div>
    );
  }

  // Error state
  if (userError) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden group cursor-pointer">
                <Image
                  src="/favicon.ico"
                  alt="Jovem Nerd - Jornada do Baralho"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-balance">
                  Jovem Nerd - Jornada do Baralho
                </h1>
                <p className="text-muted-foreground text-pretty">
                  Gerencie sua coleção de cartas do Jovem Nerd e acompanhe
                  assinaturas
                </p>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden group cursor-pointer">
              <Image
                src="/favicon.ico"
                alt="Jovem Nerd - Jornada do Baralho"
                width={48}
                height={48}
                className="w-12 h-12 object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-balance">
                Jovem Nerd - Jornada do Baralho
              </h1>
              <p className="text-muted-foreground text-pretty">
                Gerencie sua coleção de cartas do Jovem Nerd e acompanhe
                assinaturas
              </p>
            </div>
            {session ? (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </Button>
            ) : (
              <Button
                onClick={handleLogin}
                size="sm"
                className="flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="space-y-6"
        >
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full grid-cols-2 max-w-sm bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg rounded-2xl p-1.5">
              <TabsTrigger
                value="leaderboard"
                className="rounded-xl transition-all duration-300 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/50"
              >
                Ranking
              </TabsTrigger>
              <TabsTrigger
                value="collection"
                className="rounded-xl transition-all duration-300 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md hover:bg-accent/50"
              >
                Meu Deck
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="leaderboard">
            <div
              className={`${prefersReducedMotion ? "" : "animate-slide-in-left"}`}
            >
              {isLoadingLeaderboard ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                      Carregando ranking...
                    </p>
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
            </div>
          </TabsContent>

          <TabsContent value="collection" className="space-y-6">
            <div
              className={`${prefersReducedMotion ? "" : "animate-slide-in-right"}`}
            >
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
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <CardUI
                      className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer hover:shadow-md"
                      onClick={() => handleStatsCardClick("signed")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                            <Star className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {signedCards.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Cartas Assinadas
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </CardUI>

                    <CardUI
                      className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer hover:shadow-md"
                      onClick={() => handleStatsCardClick("pending")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-400/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {pendingCards.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Pendentes
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </CardUI>

                    <CardUI
                      className="bg-card border-border hover:bg-accent/50 transition-colors cursor-pointer hover:shadow-md"
                      onClick={() => handleStatsCardClick("all")}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-purple-400/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {cards.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total de Cartas
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </CardUI>

                    <CardUI className="bg-card border-border hover:bg-accent/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-green-400/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {Math.round(
                                (signedCards.length / cards.length) * 100
                              )}
                              %
                            </p>
                            <p className="text-sm text-muted-foreground"></p>
                          </div>
                        </div>
                      </CardContent>
                    </CardUI>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold text-foreground">
                          Filtrar por Status
                        </h3>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleStatusFilterChange("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          statusFilter === "all"
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-card border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        Todas ({cards.length})
                      </button>
                      <button
                        onClick={() => handleStatusFilterChange("signed")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          statusFilter === "signed"
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-card border border-border text-muted-foreground hover:bg-green-500/10 hover:text-green-600"
                        }`}
                      >
                        Assinadas ({signedCards.length})
                      </button>
                      <button
                        onClick={() => handleStatusFilterChange("pending")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          statusFilter === "pending"
                            ? "bg-orange-500 text-white shadow-md"
                            : "bg-card border border-border text-muted-foreground hover:bg-orange-500/10 hover:text-orange-600"
                        }`}
                      >
                        Pendentes ({pendingCards.length})
                      </button>
                    </div>
                  </div>

                  <CardGrid
                    cards={filteredCards}
                    onCardClick={handleCardClick}
                  />
                </>
              ) : (
                <>
                  {/* Stats Grid for non-authenticated users */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <CardUI className="bg-card border-border hover:bg-accent/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-yellow-400/10 flex items-center justify-center">
                            <Star className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {signedCards.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Cartas Assinadas
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </CardUI>

                    <CardUI className="bg-card border-border hover:bg-accent/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-blue-400/10 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {pendingCards.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Pendentes
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </CardUI>

                    <CardUI className="bg-card border-border hover:bg-accent/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-purple-400/10 flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {displayCards.length}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total de Cartas
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </CardUI>

                    <CardUI className="bg-card border-border hover:bg-accent/50 transition-colors">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-green-400/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-foreground">
                              {displayCards.length > 0
                                ? Math.round(
                                    (signedCards.length / displayCards.length) *
                                      100
                                  )
                                : 0}
                              %
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Progresso
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </CardUI>
                  </div>

                  {/* Status Filter */}
                  <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold text-foreground">
                          Filtrar por Status
                        </h3>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleStatusFilterChange("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          statusFilter === "all"
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-card border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        Todas ({displayCards.length})
                      </button>
                      <button
                        onClick={() => handleStatusFilterChange("signed")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          statusFilter === "signed"
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-card border border-border text-muted-foreground hover:bg-green-500/10 hover:text-green-600"
                        }`}
                      >
                        Assinadas ({signedCards.length})
                      </button>
                      <button
                        onClick={() => handleStatusFilterChange("pending")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          statusFilter === "pending"
                            ? "bg-orange-500 text-white shadow-md"
                            : "bg-card border border-border text-muted-foreground hover:bg-orange-500/10 hover:text-orange-600"
                        }`}
                      >
                        Pendentes ({pendingCards.length})
                      </button>
                    </div>
                  </div>

                  <CardGrid
                    cards={filteredCards}
                    onCardClick={handleCardClickForLogin}
                  />
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setSelectedCardForLogin(null);
        }}
        onLogin={handleLogin}
        cardTitle={selectedCardForLogin?.title}
      />

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
              signedDate:
                userCard.signedAt &&
                !isNaN(new Date(userCard.signedAt).getTime())
                  ? new Date(userCard.signedAt).toISOString().split("T")[0]
                  : undefined,
            };
            updateCard(updatedCard);
          }
        }}
      />

      {/* Success Toast */}
      <SuccessToast
        message={successMessage}
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
      />
    </div>
  );
}
