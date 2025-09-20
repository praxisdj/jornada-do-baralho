import { NextRequest, NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import { UserService } from "@/services/user.service";
import { NotFoundError } from "@/lib/utils/errors";

export const GET = apiHandler(getHandler);

const service = new UserService();

async function getHandler(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const user = await service.findUser({ id: params.id });
  if (!user) {
    throw new NotFoundError(`User not found with ID: ${params.id}`);
  }
  return NextResponse.json(user, { status: 200 });
}
