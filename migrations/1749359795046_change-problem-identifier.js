exports.up = pgm => {
  // 古いテーブルを削除
  pgm.sql(`DROP TABLE "ProblemBestResult";`);

  // problemIdを文字列型にした新しいテーブルを作成
  pgm.sql(`
    CREATE TABLE "ProblemBestResult" (
      "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "problemId" TEXT NOT NULL, -- ★ problemNumberからproblemId(TEXT型)に変更
      "status" TEXT NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      -- ★ プライマリキーも新しいカラムに変更
      PRIMARY KEY ("userId", "problemId")
    );
  `);
};

exports.down = pgm => {
  // upとは逆の処理
  pgm.sql(`DROP TABLE "ProblemBestResult";`);
};