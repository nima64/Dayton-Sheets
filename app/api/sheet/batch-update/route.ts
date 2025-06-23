// app/api/sheet/batch-update/route.ts
import { db } from '@/app/firebase/firebase-client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

interface Update {
  rowId: string;
  col: string;
  value: string | number;
}

interface BatchUpdateRequest {
  op: 'batch_update';
  data: {
    updates: Update[];
  };
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const sellerId = url.searchParams.get('user');
    const templateId = url.searchParams.get('templateId');

    if (!sellerId || !templateId) {
      console.error('batch-update missing user or templateId');
      return NextResponse.json(
        { error: 'Missing user or templateId' },
        { status: 400 }
      );
    }

    const body: BatchUpdateRequest = await req.json();
    const updates = Array.isArray(body.data?.updates)
      ? (body.data.updates as Update[])
      : [];

    console.groupCollapsed(
      `[batch-update] Received ${updates.length} updates → seller=${sellerId} template=${templateId}`
    );
    updates.forEach((u, i) =>
      console.log(
        `  [#${i}] rowId=${u.rowId} col=${u.col} value=${JSON.stringify(
          u.value
        )}`
      )
    );
    console.groupEnd();

    if (!updates.length) {
      return NextResponse.json({ success: true, failed: [] });
    }

    // Fetch existing seller copy
    const sellerDocRef = doc(db, 'sellers', sellerId, 'copies', templateId);
    const sellerSnap = await getDoc(sellerDocRef);
    if (!sellerSnap.exists()) {
      console.error('[batch-update] seller copy not found');
      return NextResponse.json(
        { error: 'Seller sheet not found', success: false, failed: updates },
        { status: 404 }
      );
    }

    const sellerData = sellerSnap.data();
    const currentRows = Array.isArray(sellerData.rows)
      ? [...sellerData.rows]
      : [];

    // Track failures
    const failed: Update[] = [];

    // Apply updates in-memory
    updates.forEach((u) => {
      const idx = currentRows.findIndex((r) => r.rowId === u.rowId);
      if (idx === -1) {
        console.warn(`[batch-update] rowId "${u.rowId}" not found`);
        failed.push(u);
      } else {
        console.log(
          `[batch-update] Applying update to row "${u.rowId}" → ${u.col} = ${JSON.stringify(
            u.value
          )}`
        );
        currentRows[idx] = {
          ...currentRows[idx],
          [u.col]: u.value,
        };
      }
    });

    // Write back once
    await updateDoc(sellerDocRef, { rows: currentRows });
    console.log('[batch-update] Database write successful');

    return NextResponse.json({
      success: true,
      failed,
    });
  } catch (error) {
    console.error('[batch-update] Internal error:', error);
    // on total failure, push back all for retry
    const body: BatchUpdateRequest = await req.json();
    return NextResponse.json(
      { success: false, failed: body.data.updates },
      { status: 500 }
    );
  }
}
