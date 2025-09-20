import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import { UserService } from "@/services/user.service";
import { BadRequestError } from "@/lib/utils/errors";
import { UpdateUserSchema } from "@/types/user.type";

export const GET = apiHandler(getHandler);
export const PATCH = apiHandler(patchHandler);
const service = new UserService();

async function getHandler() {
  const users = await service.findUsers();
  return NextResponse.json(users, { status: 200 });
}

async function patchHandler(request: NextRequest) {
  const body = await request.json();
  const validatedBody = UpdateUserSchema.safeParse(body);

  if (!validatedBody.success) {
    throw new BadRequestError(validatedBody.error.message);
  }

  const { id, userCards, ...updateData } = validatedBody.data;
  const updatedUser = await service.updateUser(id, {
    ...updateData,
    userCards,
  });

  return NextResponse.json(updatedUser, { status: 200 });
}
