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

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body: BatchUpdateRequest = await req.json();
    console.log('Received batch update request:', body.data.updates);

    // Validate the operation type
    if (body.op !== 'batch_update') {
      return NextResponse.json(
        { error: 'Invalid operation type' },
        { status: 400 }
      );
    }

    // Validate that updates exist
    if (!body.data?.updates || !Array.isArray(body.data.updates)) {
      return NextResponse.json(
        { error: 'Updates array is required' },
        { status: 400 }
      );
    }

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