import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// Webhookで送られてくるデータの型定義
interface UserWebhookEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    primary_email?: string; // updatedイベントでは無い可能性も考慮
    display_name?: string;
    // ... その他のデータ
  };
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    console.error('WEBHOOK_SECRET is not set');
    return NextResponse.json({ message: 'Webhook secret is not configured' }, { status: 500 });
  }

  const headerPayload = req.headers;
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ message: 'Missing Svix headers' }, { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: UserWebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as UserWebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json({ message: 'Webhook verification failed' }, { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, primary_email, display_name } = evt.data;
    if (!id || !primary_email) {
      return NextResponse.json({ message: 'Missing data in user.created payload' }, { status: 400 });
    }
    // ★★★ INSERTにON CONFLICT句を追加してUPSERT処理にする ★★★
    const query = `
      INSERT INTO "User" (id, email, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) -- emailが重複した場合
      DO UPDATE SET       -- 既存のレコードを更新する
        id = EXCLUDED.id,
        name = EXCLUDED.name;
    `;
    try {
      await sql.query(query, [id, primary_email, display_name || '']);
    } catch (dbError) {
      console.error('DB error on user.created:', dbError);
      return NextResponse.json({ message: 'Database error while creating user' }, { status: 500 });
    }
  }

  // --- ユーザー情報が更新された場合の処理 (変更なし) ---
  if (eventType === 'user.updated') {
    const { id, display_name } = evt.data;
    if (!id) {
      return NextResponse.json({ message: 'Missing id in user.updated payload' }, { status: 400 });
    }
    const query = `UPDATE "User" SET "name" = $1 WHERE "id" = $2;`;
    try {
      await sql.query(query, [display_name || '', id]);
    } catch (dbError) {
      console.error('DB error on user.updated:', dbError);
      return NextResponse.json({ message: 'Database error while updating user' }, { status: 500 });
    }
  }

  // ★★★ ユーザーが削除された場合の処理を追加 ★★★
  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    if (!id) {
      return NextResponse.json({ message: 'Missing id in user.deleted payload' }, { status: 400 });
    }
    try {
      // 1. ProblemBestResultテーブルから関連データを削除
      const deleteProblemResultsQuery = `DELETE FROM "ProblemBestResult" WHERE "userId" = $1;`;
      await sql.query(deleteProblemResultsQuery, [id]);

      // 2. TimeAttackBestTimeテーブルから関連データを削除
      const deleteTimeAttackResultsQuery = `DELETE FROM "TimeAttackBestTime" WHERE "userId" = $1;`;
      await sql.query(deleteTimeAttackResultsQuery, [id]);

      // 3. 最後にUserテーブルから本体を削除
      const deleteUserQuery = `DELETE FROM "User" WHERE id = $1;`;
      await sql.query(deleteUserQuery, [id]);
    
      console.log(`Successfully deleted user ${id} and all related data.`);

    } catch (dbError) {
      console.error('DB error on user.deleted cascade:', dbError);
      return NextResponse.json({ message: 'Database error while deleting user and related data' }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
}