exports.up = pgm => {
  // 古いProblemMode関連のテーブルを削除
  pgm.sql(`DROP TABLE "ProblemResult";`);
  pgm.sql(`DROP TABLE "ProblemModeSession";`);

  // ProblemModeの自己ベストを保存する新しいテーブルを作成
  pgm.sql(`
    CREATE TABLE "ProblemBestResult" (
      "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "problemNumber" INTEGER NOT NULL,
      "status" TEXT NOT NULL, -- "SOLVED" または "SOLVED_MINIMUM"
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      -- userIdとproblemNumberの組み合わせで、レコードを一意にする
      PRIMARY KEY ("userId", "problemNumber")
    );
  `);
};

exports.down = pgm => {
  // upとは逆の処理
  pgm.sql(`DROP TABLE "ProblemBestResult";`);
  // 古いテーブルを復元する処理も書けるが、今回は省略
};