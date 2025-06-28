// app/api/sheet/batch-update/route.ts
import { db } from '@/firebase/firebase-client'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { NextRequest, NextResponse } from 'next/server'

interface Update {
  rowId: string
  col: string
  value: string | number
}

interface BatchUpdateRequest {
  op: 'batch_update'
  data: {
    updates: Update[]
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const sellerId   = url.searchParams.get('user')
    const templateId = url.searchParams.get('templateId')
    if (!sellerId || !templateId) {
      console.warn('API: missing user/templateId')
      return NextResponse.json({ error: 'Missing user or templateId' }, { status: 400 })
    }

    const body: BatchUpdateRequest = await req.json()
    const updates = Array.isArray(body.data.updates) ? body.data.updates : []
    console.log('API RECEIVED BATCH:', { sellerId, templateId, updates })

    // 1) Load current seller copy
    const sellerRef = doc(db, 'sellers', sellerId, 'copies', templateId)
    const sellerSnap = await getDoc(sellerRef)
    if (!sellerSnap.exists()) {
      console.warn('API: seller copy not found', { sellerId, templateId })
      return NextResponse.json({ error: 'Seller sheet not found' }, { status: 404 })
    }
    const data = sellerSnap.data()
    const currentRows: any[] = Array.isArray(data.rows) ? data.rows : []
    const newRows = currentRows.map(r => ({ ...r }))

    // 2) Apply each update
    const failed: Update[] = []
    for (const u of updates) {
      const idx = newRows.findIndex(r => r.rowId === u.rowId)
      if (idx === -1) {
        failed.push(u)
        continue
      }
      try {
        newRows[idx][u.col] = u.value
      } catch {
        failed.push(u)
      }
    }

    // 3) Persist if any succeeded
    const succeededCount = updates.length - failed.length
    if (succeededCount > 0) {
      await updateDoc(sellerRef, { rows: newRows })
      console.log(`API: persisted ${succeededCount}/${updates.length} updates`)
    }

    // 4) Handshake
    return NextResponse.json({
      success: true,
      updatedCount: succeededCount,
      failed       // client will retry these
    })
  } catch (err) {
    console.error('API batch-update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
