import { db } from '@/app/firebase/firebase-client';
import { exec } from 'child_process';
import { arrayUnion, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

// Define the types for our request body
interface Update {
  row: number;
  column: string;
  value: string | number;
}

interface BatchUpdateRequest {
  op: 'batch_update';
  data: {
    updates: Update[];
  };
}

type userRole = 'seller' | 'buyer' | 'admin';

async function executeBatchUpdateSeller(op: any,updatesData:any, userRole: userRole, templateId: string, sellerId: string, firebase: any) {
  if (userRole == 'seller') {
    // Run the batch update logic for sellers
    console.log('Executing batch update for seller:', op);
    console.log('executing batch', sellerId, templateId);

    const copyRef = doc(
      db,
      "sellers", sellerId,
      "copies", templateId
    );

    // 2) Define the new row object you want to push
    const newRow = {
      rowId: 'r3',
      make: 'THIS FUCKING WOKRS',
      model: 'Srp-F310II',
      config: 'SRP-F310IICOSK',
      price: '100',
      qty: '5'
    };

    // 3) Atomically add it to the `rows` array

    await updateDoc(copyRef, {
      rows: arrayUnion(newRow)
    });

    console.log("New row added!");


  updatesData.forEach(({ rowId, col, value }:any) => {
    console.log(`Updating row ${rowId}, column ${col} with value: ${value}`);
  });

  }
}


export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body: BatchUpdateRequest = await req.json();
    console.log('Received batch update request:', body.data.updates);

    // // Validate the operation type
    // if (body.op !== 'batch_update') {
    //   return NextResponse.json(
    //     { error: 'Invalid operation type' },
    //     { status: 400 }
    //   );
    // }

    // // Validate that updates exist
    // if (!body.data?.updates || !Array.isArray(body.data.updates)) {
    //   return NextResponse.json(
    //     { error: 'Updates array is required' },
    //     { status: 400 }
    //   );
    // }

    executeBatchUpdateSeller("someoperation",body.data.updates, 'seller', 'template-5e89c3c3-2dbd-4acc-9030-a367c470e19a', 'HvJluUW53gNP28vXw74nSNMzT2Y2', 'firebase');

    // Process the updates
    const { updates } = body.data;

    // TODO: Add your logic here to handle the updates
    // For example, saving to database, etc.

    // Return success response
    return NextResponse.json({
      success: true,
      updatedCount: updates.length
    });

  } catch (error) {
    console.error('Batch update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}