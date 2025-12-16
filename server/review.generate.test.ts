import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("review API endpoints", () => {
  it("should list reviews for authenticated user", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const reviews = await caller.review.list();
    expect(Array.isArray(reviews)).toBe(true);
  });

  it("should get available options", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const options = await caller.review.getOptions();
    expect(options).toBeDefined();
    expect(Array.isArray(options.positiveTraits)).toBe(true);
    expect(Array.isArray(options.weaknesses)).toBe(true);
    expect(Array.isArray(options.suggestions)).toBe(true);
  });

  it("should validate student name is required", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.review.generate({
        studentName: "",
        positiveTraits: ["認真負責"],
        weaknesses: [],
        impressivePoints: "表現良好",
        suggestions: [],
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });

  it("should validate impressive points are required", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.review.generate({
        studentName: "小明",
        positiveTraits: ["認真負責"],
        weaknesses: [],
        impressivePoints: "",
        suggestions: [],
      });
      expect.fail("Should have thrown validation error");
    } catch (error: any) {
      expect(error.code).toBe("BAD_REQUEST");
    }
  });
});
