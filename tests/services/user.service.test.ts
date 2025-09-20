import { describe, expect, test, beforeEach } from "bun:test";
import { setupTests } from "@tests/utils";
import { User } from "@/types/user.type";
import { UserService } from "@/services/user.service";

describe("UserService", () => {
  beforeEach(async () => {
    await setupTests();
  });

  test("should create a new user and assign default cards", async () => {
    const userService = new UserService();

    const createUserResult = await userService.createUser({
      email: "test@email.com",
      name: "test testing",
    });

    const findUserResult = await userService.findUser({
      id: createUserResult.id,
    });

    expect(findUserResult).toBeDefined();

    // Check that the user was created correctly
    expect(findUserResult?.id).toBe(createUserResult.id);
    expect(findUserResult?.email).toBe(createUserResult.email);
    expect(findUserResult?.name).toBe(createUserResult.name);

    // Check that user cards were created (21 cards total)
    expect(findUserResult?.userCards).toBeDefined();
    expect(findUserResult?.userCards.length).toBe(21);

    // Check that all user cards have the correct structure
    const parsedUser = findUserResult as User;
    expect(
      parsedUser.userCards.every((uc) => uc.userId === parsedUser.id),
    ).toBe(true);
    expect(parsedUser.userCards.every((uc) => uc.status === "PENDING")).toBe(
      true,
    );
  });
});
