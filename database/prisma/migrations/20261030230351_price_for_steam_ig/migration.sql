/*
  Warnings:

  - You are about to drop the column `price` on the `Game` table. All the data in the column will be lost.
  - Added the required column `instantGamingPrice` to the `Game` table without a default value. This is not possible if the table is not empty.
  - Added the required column `steamPrice` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "steamPrice" REAL NOT NULL,
    "instantGamingPrice" REAL NOT NULL,
    "steam" TEXT NOT NULL,
    "instantGaming" TEXT NOT NULL,
    "crossplay" BOOLEAN NOT NULL,
    "steamLink" TEXT NOT NULL,
    "instantGamingLink" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Game" ("createdAt", "crossplay", "description", "id", "instantGaming", "instantGamingLink", "name", "steam", "steamLink") SELECT "createdAt", "crossplay", "description", "id", "instantGaming", "instantGamingLink", "name", "steam", "steamLink" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
