import { describe, expect, test, beforeEach } from "bun:test";
import { GET } from "@/app/api/user/route";
import { clearDatabase, createMultipleUsers } from "@tests/utils";
import { User } from "@/types/user.type";
import { NextRequest } from "next/server";

describe("GET /api/user", () => {
  beforeEach(async () => {
    await clearDatabase();
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
  });
});
