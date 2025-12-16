import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  reviews,
  InsertReview,
  positiveTraitOptions,
  weaknessOptions,
  suggestionOptions,
  quotes,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * 取得特定使用者的所有評語記錄
 */
export async function getUserReviews(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(reviews)
    .where(eq(reviews.userId, userId))
    .orderBy(desc(reviews.createdAt));
}

/**
 * 取得特定評語記錄
 */
export async function getReviewById(reviewId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * 建立新的評語記錄
 */
export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(reviews).values(review);
  // 取得最後插入的記錄的 ID
  const created = await db.select().from(reviews).orderBy(desc(reviews.id)).limit(1);
  return created[0]?.id || 0;
}

/**
 * 更新評語記錄
 */
export async function updateReview(reviewId: number, generatedReview: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(reviews)
    .set({ generatedReview, updatedAt: new Date() })
    .where(eq(reviews.id, reviewId));
}

/**
 * 刪除評語記錄
 */
export async function deleteReview(reviewId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(reviews).where(eq(reviews.id, reviewId));
}

/**
 * 取得所有預設正向特質選項
 */
export async function getDefaultPositiveTraits() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(positiveTraitOptions)
    .where(eq(positiveTraitOptions.isDefault, 1));
}

/**
 * 取得使用者的自訂正向特質選項
 */
export async function getUserPositiveTraits(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(positiveTraitOptions)
    .where(eq(positiveTraitOptions.userId, userId));
}

/**
 * 取得所有預設缺點選項
 */
export async function getDefaultWeaknesses() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(weaknessOptions)
    .where(eq(weaknessOptions.isDefault, 1));
}

/**
 * 取得使用者的自訂缺點選項
 */
export async function getUserWeaknesses(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(weaknessOptions)
    .where(eq(weaknessOptions.userId, userId));
}

/**
 * 取得所有預設建議選項
 */
export async function getDefaultSuggestions() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(suggestionOptions)
    .where(eq(suggestionOptions.isDefault, 1));
}

/**
 * 取得使用者的自訂建議選項
 */
export async function getUserSuggestions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(suggestionOptions)
    .where(eq(suggestionOptions.userId, userId));
}

/**
 * 取得所有名言佳句
 */
export async function getAllQuotes() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(quotes);
}
