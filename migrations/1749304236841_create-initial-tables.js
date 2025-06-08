/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  // Userテーブルを作成
  pgm.sql(`
    CREATE TABLE "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL UNIQUE,
      "name" TEXT
    );
  `);

  // ProblemModeSessionテーブルを作成
  pgm.sql(`
    CREATE TABLE "ProblemModeSession" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // ProblemResultテーブルを作成
  pgm.sql(`
    CREATE TABLE "ProblemResult" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionId" TEXT NOT NULL REFERENCES "ProblemModeSession"(id) ON DELETE CASCADE,
      "problemNumber" INTEGER NOT NULL,
      "status" TEXT NOT NULL,
      UNIQUE ("sessionId", "problemNumber")
    );
  `);

  // TimeAttackSessionテーブルを作成
  pgm.sql(`
    CREATE TABLE "TimeAttackSession" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "totalTime" INTEGER,
      "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  // TimeAttackProblemTimeテーブルを作成
  pgm.sql(`
    CREATE TABLE "TimeAttackProblemTime" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sessionId" TEXT NOT NULL REFERENCES "TimeAttackSession"(id) ON DELETE CASCADE,
      "problemType" TEXT NOT NULL,
      "timeTaken" INTEGER NOT NULL,
      UNIQUE ("sessionId", "problemType")
    );
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  // upとは逆の順序でテーブルを削除していく
  pgm.sql(`DROP TABLE "TimeAttackProblemTime";`);
  pgm.sql(`DROP TABLE "TimeAttackSession";`);
  pgm.sql(`DROP TABLE "ProblemResult";`);
  pgm.sql(`DROP TABLE "ProblemModeSession";`);
  pgm.sql(`DROP TABLE "User";`);
};