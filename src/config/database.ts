
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Variável de ambiente ausente: ${key}`);
  }
}

export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
