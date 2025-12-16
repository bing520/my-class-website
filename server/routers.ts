import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { generateStudentReview } from "./reviewGenerator";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  review: router({
    // 取得使用者的所有評語
    list: protectedProcedure.query(({ ctx }) =>
      db.getUserReviews(ctx.user.id)
    ),

    // 取得特定評語
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const review = await db.getReviewById(input.id);
        if (!review || review.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "評語不存在",
          });
        }
        return review;
      }),

    // 更新評語
    update: protectedProcedure
      .input(z.object({ id: z.number(), generatedReview: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const review = await db.getReviewById(input.id);
        if (!review || review.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "評語不存在",
          });
        }
        await db.updateReview(input.id, input.generatedReview);
        return { success: true };
      }),

    // 删除評語
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const review = await db.getReviewById(input.id);
        if (!review || review.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "評語不存在",
          });
        }
        await db.deleteReview(input.id);
        return { success: true };
      }),

    // 取得預設選項
    getOptions: protectedProcedure.query(async ({ ctx }) => {
      const positiveTraits = await db.getDefaultPositiveTraits();
      const weaknesses = await db.getDefaultWeaknesses();
      const suggestions = await db.getDefaultSuggestions();

      return {
        positiveTraits: positiveTraits.map((t) => t.trait),
        weaknesses: weaknesses.map((w) => w.weakness),
        suggestions: suggestions.map((s) => s.suggestion),
      };
    }),

    // 生成評語
    generate: protectedProcedure
      .input(
        z.object({
          studentName: z.string().min(1),
          positiveTraits: z.array(z.string()).min(1),
          weaknesses: z.array(z.string()),
          impressivePoints: z.string().optional(),
          suggestions: z.array(z.string()),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // 生成評語
        const { review, usedQuotes } = await generateStudentReview(input);

        // 保存評語記錄
        const result = await db.createReview({
          userId: ctx.user.id,
          studentName: input.studentName,
          positiveTraits: JSON.stringify(input.positiveTraits),
          weaknesses: JSON.stringify(input.weaknesses),
          impressivePoints: input.impressivePoints || "",
          suggestions: JSON.stringify(input.suggestions),
          generatedReview: review,
          usedQuotes: JSON.stringify(usedQuotes),
        });

        return {
          review,
          usedQuotes,
          savedId: result,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
