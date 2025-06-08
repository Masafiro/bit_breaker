import { sql } from '@/lib/db';
import { stackServerApp } from "@/stack";
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  console.log('--- [API START] /api/time-attack/submit-score ---');

  try {
    const user = await stackServerApp.getUser();
    if (!user?.id) {
      console.log('[API ERROR] User not authenticated.');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;
    console.log(`[API AUTH] User authenticated. UserID: ${userId}`);

    const userInDbResult = await sql.query('SELECT id FROM "User" WHERE id = $1', [userId]);
    if (userInDbResult.rows.length === 0) {
      console.log(`[API SYNC] User not found in local DB. Creating user...`);
      const email = user.primaryEmail;
      const name = user.displayName;
      await sql.query('INSERT INTO "User" (id, email, name) VALUES ($1, $2, $3)', [userId, email, name]);
      console.log(`[API SYNC] User ${userId} created in local DB.`);
    } else {
      console.log(`[API SYNC] User ${userId} already exists in local DB.`);
    }
    
    const body = await req.json();
    const { sessionType, time } = body;
    console.log('[API BODY]', { sessionType, time });

    if (!sessionType || typeof time !== 'number') {
      console.log('[API ERROR] Invalid body payload.');
      return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
    }

    const query = `
      INSERT INTO "TimeAttackBestTime" ("userId", "sessionType", "bestTime", "updatedAt")
      VALUES ($1, $2, $3, now())
      ON CONFLICT ("userId", "sessionType") 
      DO UPDATE SET 
        "bestTime" = EXCLUDED."bestTime",
        "updatedAt" = now()
      WHERE 
        "TimeAttackBestTime"."bestTime" > EXCLUDED."bestTime";
    `;
    
    console.log('[API DB] Executing UPSERT query...');
    const result = await sql.query(query, [userId, sessionType, time]);
    console.log('[API DB] Query finished. Result:', result);

    return NextResponse.json({ message: 'Score submitted successfully' });

  } catch (error) {
    console.error('[API CATCH] An unexpected error occurred:', error);
    return NextResponse.json({ message: 'Database error' }, { status: 500 });
  }
}