import { describe, expect, test, beforeEach } from "bun:test";
import { GET } from "@/app/api/user/route";
import { setupTests, createMultipleUsers } from "@tests/utils";
import { User } from "@/types/user.type";
import { NextRequest } from "next/server";

describe("GET /api/user", () => {
  beforeEach(async () => {
    await setupTests();
  });

  test("should return no users", async () => {
    const response = await GET(
      new NextRequest(`http://localhost/api/user`, {
        method: "GET",
      }),
    );

    const responseBody = await response.json();

    expect(response.status).toBe(200);
    const parsedUser = responseBody as User[];
    expect(parsedUser).toBeInstanceOf(Array);
    expect(parsedUser.length).toBe(0);
  });

  test("should return all users", async () => {
    await createMultipleUsers(3);

    const response = await GET(
      new NextRequest(`http://localhost/api/user`, {
        method: "GET",
      }),
    );

    const responseBody = await response.json();

    expect(response.status).toBe(200);
    const parsedUser = responseBody as User[];
    expect(parsedUser).toBeInstanceOf(Array);
    expect(parsedUser.length).toBe(3);
    for (const user of parsedUser) {
      expect(user.email).toBeUndefined(); // make sure we are not exposing the emails
      expect(user.name).toBeDefined();
      expect(user.image).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.deletedAt).toBeDefined();
      expect(user.userCards).toBeDefined();
      expect(user.userCards.length).toBe(21);
      for (const userCard of user.userCards) {
        expect(userCard.id).toBeDefined();
        expect(userCard.status).toBeDefined();
        expect(userCard.comment).toBeDefined();
        expect(userCard.signedAt).toBeDefined();
      }
    }
  });
});
