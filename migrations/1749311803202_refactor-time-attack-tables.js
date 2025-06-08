exports.up = pgm => {
  // 古いテーブルを削除
  pgm.sql(`DROP TABLE "TimeAttackProblemTime";`);
  pgm.sql(`DROP TABLE "TimeAttackSession";`);

  // 自己ベストを保存する新しいテーブルを作成
  pgm.sql(`
    CREATE TABLE "TimeAttackBestTime" (
      "userId" TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
      "sessionType" TEXT NOT NULL,
      "bestTime" INTEGER NOT NULL,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
      -- userIdとsessionTypeの組み合わせで、レコードを一意にする
      PRIMARY KEY ("userId", "sessionType")
    );
  `);
};

exports.down = pgm => {
  // upとは逆の処理（このマイグレーションを取り消す場合）
  pgm.sql(`DROP TABLE "TimeAttackBestTime";`);
  // 古いテーブルを復元する処理も書けるが、今回は省略
};