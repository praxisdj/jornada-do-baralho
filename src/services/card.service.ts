import { Card, Prisma, User } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createLogger } from "@/lib/utils/logger";
import { UserCard } from "@/types/userCard.type";

const logger = createLogger();

export class CardService {
  private prisma: typeof prisma;

  constructor(prismaInstance?: typeof prisma) {
    this.prisma = prismaInstance || prisma;
  }

  async findCards(filters?: Prisma.CardWhereInput): Promise<Card[]> {
    logger.debug(`Finding cards with filters: ${JSON.stringify(filters)}`);

    const cards = await this.prisma.card.findMany({
      where: filters,
    });

    return cards;
  }

  async createCardsForNewUser(user: User): Promise<UserCard[]> {
    logger.debug(`Creating cards for new user: ${user.id}`);
    const defaultCards = await this.prisma.card.findMany();

    const userCards = defaultCards.map((card) => ({
      userId: user.id,
      cardId: card.id,
      status: "PENDING" as const,
    }));

    await this.prisma.userCard.createMany({
      data: userCards,
    });

    const createdUserCards = await this.prisma.userCard.findMany({
      where: { userId: user.id },
      include: {
        card: true,
      },
    });

    logger.debug(
      `Created ${createdUserCards.length} cards for user: ${user.id}`,
    );

    return createdUserCards;
  }
}
