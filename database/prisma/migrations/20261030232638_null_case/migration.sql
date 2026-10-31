-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "steamPrice" REAL,
    "instantGamingPrice" REAL,
    "steam" TEXT NOT NULL,
    "instantGaming" TEXT NOT NULL,
    "crossplay" BOOLEAN NOT NULL,
    "steamLink" TEXT,
    "instantGamingLink" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Game" ("createdAt", "crossplay", "description", "id", "instantGaming", "instantGamingLink", "instantGamingPrice", "name", "steam", "steamLink", "steamPrice") SELECT "createdAt", "crossplay", "description", "id", "instantGaming", "instantGamingLink", "instantGamingPrice", "name", "steam", "steamLink", "steamPrice" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
