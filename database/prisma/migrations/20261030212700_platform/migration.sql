/*
  Warnings:

  - You are about to drop the column `instant_gaming` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `steam` on the `Game` table. All the data in the column will be lost.
  - Added the required column `platform` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "platform" TEXT NOT NULL,
    "crossplay" BOOLEAN NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Game" ("createdAt", "crossplay", "description", "id", "link", "name", "price") SELECT "createdAt", "crossplay", "description", "id", "link", "name", "price" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
