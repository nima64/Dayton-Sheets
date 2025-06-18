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
    const sellerId = url.searchParams.get("user");
    const templateId = url.searchParams.get("templateId");

    if (!sellerId || !templateId) {
      return NextResponse.json({ error: "Missing user or templateId" }, { status: 400 });
    }

    const body: BatchUpdateRequest = await req.json();
    const updates = body.data?.updates ?? [];

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: "Invalid updates array" }, { status: 400 });
    }

    const sellerDocRef = doc(db, "sellers", sellerId, "copies", templateId);
    const sellerSnap = await getDoc(sellerDocRef);

    if (!sellerSnap.exists()) {
      return NextResponse.json({ error: "Seller sheet not found" }, { status: 404 });
    }

    const sellerData = sellerSnap.data();
    const currentRows = Array.isArray(sellerData.rows) ? [...sellerData.rows] : [];

    const updatedRows = currentRows.map((row) => {
      const updatesForRow = updates.filter((u) => u.rowId === row.rowId);
      const updated = { ...row };
      updatesForRow.forEach(({ col, value }) => {
        updated[col] = value;
      });
      return updated;
    });

    await updateDoc(sellerDocRef, { rows: updatedRows });

    return NextResponse.json({
      success: true,
      updatedCount: updates.length,
    });
  } catch (error) {
    console.error('Batch update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
