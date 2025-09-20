import { NextResponse } from "next/server";
import { apiHandler } from "@/lib/utils/apiHandler";
import { CardService } from "@/services/card.service";

export const GET = apiHandler(getHandler);

const service = new CardService();

async function getHandler() {
  const cards = await service.findCards();

  return NextResponse.json(cards, { status: 200 });
}
