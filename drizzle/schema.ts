import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 評語記錄表
 * 儲存生成的學生評語及相關信息
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentName: varchar("studentName", { length: 100 }).notNull(),
  positiveTraits: text("positiveTraits").notNull(), // JSON array
  weaknesses: text("weaknesses").notNull(), // JSON array
  impressivePoints: text("impressivePoints").notNull(),
  suggestions: text("suggestions").notNull(), // JSON array
  generatedReview: text("generatedReview").notNull(),
  usedQuotes: text("usedQuotes").notNull(), // JSON array
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * 名言佳句表
 * 儲存可用於評語中的名言佳句
 */
export const quotes = mysqlTable("quotes", {
  id: int("id").autoincrement().primaryKey(),
  text: text("text").notNull(),
  author: varchar("author", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }), // 例如：勇氣、堅持、學習等
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;

/**
 * 正向特質選項表
 * 儲存預設和自訂的正向特質選項
 */
export const positiveTraitOptions = mysqlTable("positive_trait_options", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // null 表示全局預設選項
  trait: varchar("trait", { length: 100 }).notNull(),
  isDefault: int("isDefault").default(0).notNull(), // 1 表示預設選項
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PositiveTraitOption = typeof positiveTraitOptions.$inferSelect;
export type InsertPositiveTraitOption = typeof positiveTraitOptions.$inferInsert;

/**
 * 缺點選項表
 * 儲存預設和自訂的缺點選項
 */
export const weaknessOptions = mysqlTable("weakness_options", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // null 表示全局預設選項
  weakness: varchar("weakness", { length: 100 }).notNull(),
  isDefault: int("isDefault").default(0).notNull(), // 1 表示預設選項
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WeaknessOption = typeof weaknessOptions.$inferSelect;
export type InsertWeaknessOption = typeof weaknessOptions.$inferInsert;

/**
 * 建議選項表
 * 儲存預設和自訂的建議選項
 */
export const suggestionOptions = mysqlTable("suggestion_options", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // null 表示全局預設選項
  suggestion: varchar("suggestion", { length: 200 }).notNull(),
  isDefault: int("isDefault").default(0).notNull(), // 1 表示預設選項
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SuggestionOption = typeof suggestionOptions.$inferSelect;
export type InsertSuggestionOption = typeof suggestionOptions.$inferInsert;