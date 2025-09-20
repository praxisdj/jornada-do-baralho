import { describe, expect, test, beforeEach } from "bun:test";
import { PATCH } from "@/app/api/user/route";
import { createMultipleUsers, createUser, setupTests } from "@tests/utils";
import { User } from "@/types/user.type";
import { NextRequest } from "next/server";

describe("PATCH /api/user", () => {
  beforeEach(async () => {
    await setupTests();
  });

  test("should update user", async () => {
    const user = await createUser();
    await createMultipleUsers(3); // to make sure we are not updating the wrong user

    const cardIdToBeSigned = user.userCards[0].id;

    const updateObject = {
      id: user.id,
      userCards: [
        {
          id: cardIdToBeSigned,
          status: "SIGNED",
          comment: "test comment",
          signedAt: new Date(),
        },
      ],
    };

    const response = await PATCH(
      new NextRequest(`http://localhost/api/user`, {
        method: "PATCH",
        body: JSON.stringify(updateObject),
      }),
    );

    const responseBody = await response.json();
    const parsedUser = responseBody as User;

    expect(response.status).toBe(200);
    expect(parsedUser).toBeInstanceOf(Object);
    expect(parsedUser.id).toBe(user.id);

    const signedCard = parsedUser.userCards.find(
      (card) => card.id === cardIdToBeSigned,
    );
    expect(signedCard?.status).toBe("SIGNED");
    expect(signedCard?.comment).toBe("test comment");
    expect(signedCard?.signedAt).toBeDefined();
    expect(
      parsedUser.userCards.filter((card) => card.status === "PENDING").length,
    ).toBe(20);
    expect(
      parsedUser.userCards.filter((card) => card.status === "SIGNED").length,
    ).toBe(1);
  });
});
