import { Prisma } from "@prisma/client";

export type UserCard = Prisma.UserCardGetPayload<{
  include: {
    card: true;
  };
}>;
