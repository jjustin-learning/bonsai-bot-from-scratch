import path from "node:path";
import { config } from "dotenv";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../generated/prisma/client";

const databaseDir = path.join(import.meta.dir, "..");

config({ path: path.join(databaseDir, ".env"), quiet: true });

const databaseUrl = (process.env.DATABASE_URL ?? "file:./data.db").replace(
  /^file:(?!\/)/,
  `file:${databaseDir}/`,
);

const adapter = new PrismaLibSql({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

export { prisma };

export * from "./types.ts";
