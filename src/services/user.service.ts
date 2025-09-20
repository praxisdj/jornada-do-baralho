import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { User, UserCardUpdate } from "@/types/user.type";
import { createLogger } from "@/lib/utils/logger";
import { NotFoundError } from "@/lib/utils/errors";
import { CardService } from "@/services/card.service";

const logger = createLogger();

export class UserService {
  private prisma: typeof prisma;
  private cardService: CardService;

  constructor(prismaInstance?: typeof prisma, cardService?: CardService) {
    this.prisma = prismaInstance || prisma;
    this.cardService = cardService || new CardService();
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    logger.debug(`Creating new user with email: ${data.email}`);

    const newUser = await this.prisma.user.create({
      data,
      include: {
        userCards: {
          include: {
            card: true,
          },
        },
      },
    });

    const userCards = await this.cardService.createCardsForNewUser(newUser);
    newUser.userCards = userCards;

    return newUser;
  }

  async findUsers(filters?: Prisma.UserWhereInput): Promise<User[]> {
    logger.debug(`Fetching users with filters: ${JSON.stringify(filters)}`);
    const users = await this.prisma.user.findMany({
      where: filters,
      include: {
        userCards: {
          include: {
            card: true,
          },
        },
      },
    });
    return users.length > 0 ? users : [];
  }

  async findUser(filters?: Prisma.UserWhereInput): Promise<User | null> {
    logger.debug(`Fetching user with filters: ${JSON.stringify(filters)}`);
    const user = await this.prisma.user.findFirst({
      where: filters,
      include: {
        userCards: {
          include: {
            card: true,
          },
        },
      },
    });
    return user || null;
  }

  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput & { userCards?: UserCardUpdate[] },
  ): Promise<User> {
    try {
      logger.debug(`Updating user with ID: ${id}`, { data });

      // Extract userCards from the data if present
      const { userCards, ...userData } = data as Prisma.UserUpdateInput & {
        userCards?: UserCardUpdate[];
      };

      // Update the user first
      const result = await this.prisma.user.update({
        where: { id },
        data: userData,
        include: {
          userCards: {
            include: {
              card: true,
            },
          },
        },
      });

      // If userCards are provided, update them separately
      if (userCards && Array.isArray(userCards)) {
        for (const userCard of userCards) {
          // Check if the userCard exists and belongs to the user
          const existingUserCard = await this.prisma.userCard.findFirst({
            where: {
              id: userCard.id,
            },
          });

          if (existingUserCard?.userId !== id) {
            logger.warn(
              `Algum safado tentou atualizar uma carta que não é da sua conta. UserCard with ID ${userCard.id} does not belong to user ${id}`,
            );
            continue; // Skip this userCard and continue with others
          }

          if (!existingUserCard) {
            logger.warn(
              `UserCard with ID ${userCard.id} not found for user ${id}`,
            );
            continue; // Skip this userCard and continue with others
          }

          await this.prisma.userCard.update({
            where: { id: userCard.id },
            data: {
              status: userCard.status,
              comment: userCard.comment,
              signedAt: userCard.signedAt,
            },
          });
        }

        // Fetch the updated user with userCards
        const updatedUser = await this.prisma.user.findUnique({
          where: { id },
          include: {
            userCards: {
              include: {
                card: true,
              },
            },
          },
        });

        return updatedUser!;
      }

      return result;
    } catch (error: unknown) {
      console.error("❌❌❌❌❌❌:", error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        throw new NotFoundError(`Entity not found.`, false, {
          userId: id,
          dataToUpdate: data,
        });
      }
      throw error;
    }
  }
}
