/**
 * 初始化資料庫腳本
 * 將預設選項和名言插入資料庫
 */

import mysql from "mysql2/promise";
import { POSITIVE_TRAITS, WEAKNESSES, SUGGESTIONS, FAMOUS_QUOTES } from "../shared/presets.ts";

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "localhost",
  user: process.env.DATABASE_URL?.split("://")[1]?.split(":")[0] || "root",
  password: process.env.DATABASE_URL?.split(":")[2]?.split("@")[0] || "",
  database: process.env.DATABASE_URL?.split("/").pop() || "test",
});

async function initializeDatabase() {
  const connection = await pool.getConnection();

  try {
    console.log("開始初始化資料庫...");

    // 清空現有資料
    console.log("清空現有資料...");
    await connection.query("DELETE FROM positive_trait_options WHERE isDefault = 1");
    await connection.query("DELETE FROM weakness_options WHERE isDefault = 1");
    await connection.query("DELETE FROM suggestion_options WHERE isDefault = 1");
    await connection.query("DELETE FROM quotes");

    // 插入正向特質
    console.log("插入正向特質...");
    for (const trait of POSITIVE_TRAITS) {
      await connection.query(
        "INSERT INTO positive_trait_options (trait, isDefault) VALUES (?, 1)",
        [trait]
      );
    }

    // 插入缺點
    console.log("插入缺點...");
    for (const weakness of WEAKNESSES) {
      await connection.query(
        "INSERT INTO weakness_options (weakness, isDefault) VALUES (?, 1)",
        [weakness]
      );
    }

    // 插入建議
    console.log("插入建議...");
    for (const suggestion of SUGGESTIONS) {
      await connection.query(
        "INSERT INTO suggestion_options (suggestion, isDefault) VALUES (?, 1)",
        [suggestion]
      );
    }

    // 插入名言
    console.log("插入名言...");
    for (const quote of FAMOUS_QUOTES) {
      await connection.query("INSERT INTO quotes (text, author) VALUES (?, ?)", [
        quote.text,
        quote.author,
      ]);
    }

    console.log("✅ 資料庫初始化完成！");
  } catch (error) {
    console.error("❌ 初始化失敗:", error);
    throw error;
  } finally {
    await connection.release();
    await pool.end();
  }
}

initializeDatabase();
