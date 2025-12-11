/*
  Warnings:

  - The primary key for the `Company` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Company` table. All the data in the column will be lost.
  - The primary key for the `Persona` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Persona` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Persona` table. All the data in the column will be lost.
  - The primary key for the `Target` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Target` table. All the data in the column will be lost.
  - Added the required column `companyId` to the `Persona` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyId` to the `Target` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "WeekPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "WeekPlan_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "day" INTEGER NOT NULL,
    "title" TEXT,
    "body" TEXT,
    "subreddit" TEXT NOT NULL,
    "personaName" TEXT,
    "weekId" TEXT NOT NULL,
    "personaId" TEXT,
    "targetId" TEXT,
    CONSTRAINT "Post_weekId_fkey" FOREIGN KEY ("weekId") REFERENCES "WeekPlan" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Post_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "Persona" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Post_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Target" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT
);
INSERT INTO "new_Company" ("description", "id", "name") SELECT "description", "id", "name" FROM "Company";
DROP TABLE "Company";
ALTER TABLE "new_Company" RENAME TO "Company";
CREATE TABLE "new_Persona" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "description" TEXT,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "Persona_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Persona" ("description", "id", "username") SELECT "description", "id", "username" FROM "Persona";
DROP TABLE "Persona";
ALTER TABLE "new_Persona" RENAME TO "Persona";
CREATE TABLE "new_Target" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subreddit" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    CONSTRAINT "Target_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Target" ("id", "subreddit") SELECT "id", "subreddit" FROM "Target";
DROP TABLE "Target";
ALTER TABLE "new_Target" RENAME TO "Target";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
