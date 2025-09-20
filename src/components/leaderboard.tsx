"use client";

interface User {
  id: string;
  name: string;
  avatar?: string;
  signedCards: number;
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Star, TrendingUp } from "lucide-react";

interface LeaderboardProps {
  users: User[];
}

export function Leaderboard({ users }: LeaderboardProps) {
  // Sort users by signed cards count in descending order
  const sortedUsers = [...users].sort((a, b) => b.signedCards - a.signedCards);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <Star className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getRankBadgeColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Ranking de Colecionadores</h2>
          <p className="text-muted-foreground">
            Quem tem mais cartas assinadas
          </p>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {sortedUsers.slice(0, 3).map((user, index) => {
          const position = index + 1;
          return (
            <Card
              key={user.id}
              className={`relative border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                position === 1
                  ? "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 md:scale-105"
                  : position === 2
                    ? "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20"
                    : "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20"
              }`}
            >
              <CardContent className="p-6 text-center">
                {/* Rank Badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge
                    className={`${getRankBadgeColor(position)} px-3 py-1 text-sm font-bold shadow-lg`}
                  >
                    #{position}
                  </Badge>
                </div>

                {/* Avatar */}
                <div className="mt-4 mb-4">
                  <Avatar className="w-16 h-16 mx-auto border-4 border-white shadow-lg">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback className="text-lg font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* User Info */}
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-balance">
                    {user.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    {getRankIcon(position)}
                    <span className="text-2xl font-bold">
                      {user.signedCards}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      cartas
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Leaderboard */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Ranking Completo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-0">
            {sortedUsers.map((user, index) => {
              const position = index + 1;
              return (
                <div
                  key={user.id}
                  className={`flex items-center gap-4 p-4 transition-colors hover:bg-muted/50 ${
                    index !== sortedUsers.length - 1
                      ? "border-b border-border"
                      : ""
                  }`}
                >
                  {/* Position */}
                  <div className="flex items-center justify-center w-8 h-8">
                    {position <= 3 ? (
                      getRankIcon(position)
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">
                        #{position}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={user.avatar || "/placeholder.svg"}
                      alt={user.name}
                    />
                    <AvatarFallback className="text-sm font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold">{user.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {user.signedCards} carta
                      {user.signedCards !== 1 ? "s" : ""} assinada
                      {user.signedCards !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-xl font-bold">{user.signedCards}</div>
                    {position <= 3 && (
                      <Badge variant="outline" className="text-xs">
                        Top {position}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-lg font-bold">
                  {sortedUsers[0]?.signedCards || 0}
                </p>
                <p className="text-xs text-muted-foreground">Maior pontuação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-lg font-bold">
                  {sortedUsers.length > 0
                    ? Math.round(
                        sortedUsers.reduce(
                          (acc, user) => acc + user.signedCards,
                          0,
                        ) / sortedUsers.length,
                      )
                    : 0}
                </p>
                <p className="text-xs text-muted-foreground">Média de cartas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-card to-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-lg font-bold">{sortedUsers.length}</p>
                <p className="text-xs text-muted-foreground">
                  Colecionadores ativos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
