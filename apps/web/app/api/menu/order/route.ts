import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/lib/menu-service';

export async function PUT(request: NextRequest) {
  try {
    const body: { updates: { id: string; orderIndex: number }[] } = await request.json();
    
    const success = await MenuService.updateMenuOrder(body.updates);
    
    return NextResponse.json({
      success,
      message: success ? 'Menu order updated successfully' : 'Failed to update menu order'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to update menu order'
    }, { status: 500 });
  }
}