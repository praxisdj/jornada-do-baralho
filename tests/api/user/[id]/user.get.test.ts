import { describe, expect, test, beforeEach } from "bun:test";
import { GET } from "@/app/api/user/[id]/route";
import { clearDatabase, createUser, createMultipleUsers } from "@tests/utils";
import { User } from "@/types/user.type";
import { NextRequest } from "next/server";

describe("GET /api/user/[id]", () => {
  beforeEach(async () => {
    await clearDatabase();
  });

  test("should return user by id", async () => {
    await createMultipleUsers(3);
    const user = await createUser({
      email: "test2@email.com",
      name: "test2 testing2",
    });

    const response = await GET(
      new NextRequest(`http://localhost/api/user/${user.id}`, {
        method: "GET",
      }),
      { params: { id: user.id } },
    );

    const responseBody = await response.json();

    expect(response.status).toBe(200);
    const parsedUser = responseBody as User;
    expect(parsedUser).toBeInstanceOf(Object);
    expect(parsedUser.id).toBe(user.id);
  });

  test("should return not found", async () => {
    const response = await GET(
      new NextRequest(`http://localhost/api/user/99999`, {
        method: "GET",
      }),
      { params: { id: `99999` } },
    );

    const responseBody = await response.json();

    expect(response.status).toBe(404);
    expect(responseBody).toEqual({
      error: `User not found with ID: 99999`,
    });
  });

  test("should handle unexpected errors", async () => {
    // This test simulates an unexpected error by passing null as the context object
    // This should cause a destructuring error when trying to access { params }
    const response = await GET(
      new NextRequest(`http://localhost/api/user/test-id`, {
        method: "GET",
      }),
      null as unknown, // This will cause a destructuring error
    );

    const responseBody = await response.json();

    expect(response.status).toBe(500);
    expect(responseBody).toEqual({
      error: "Unexpected Error",
    });
  });
});
