import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { sql } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// WebhookEventの型定義
interface UserWebhookEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted';
  data: {
    id: string;
    primary_email: string;
    display_name: string;
    // ... その他のデータ
  };
}

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('WEBHOOK_SECRET is not set in .env file');
    return NextResponse.json({ message: 'Webhook secret is not configured' }, { status: 500 });
  }

  const headerPayload = req.headers;
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json({ message: 'Error: Missing Svix headers' }, { status: 400 });
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

  // ユーザーが新規作成された場合の処理
  if (eventType === 'user.created') {
    const { id, primary_email, display_name } = evt.data;
    const email = primary_email;
    const name = display_name;

    if (!id || !email) {
      return NextResponse.json({ message: 'Error: Missing user ID or email in webhook payload' }, { status: 400 });
    }

    const query = `
      INSERT INTO "User" (id, email, name)
      VALUES ($1, $2, $3);
    `;

    try {
      await sql(query, [id, email, name]);
      console.log(`User ${id} successfully inserted into the database.`);
    } catch (dbError) {
      console.error('Error inserting user into DB:', dbError);
      return NextResponse.json({ message: 'Database error while creating user' }, { status: 500 });
    }
  }

  return NextResponse.json({ message: 'Webhook processed successfully' }, { status: 200 });
}