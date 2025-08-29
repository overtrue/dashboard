import { NextRequest, NextResponse } from 'next/server';
import { MenuService } from '@/lib/menu-service';
import { MenuFormData, MenuUpdateData } from '@/types/menu';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    const isAdmin = searchParams.get('isAdmin') === 'true';
    
    const config = await MenuService.getSidebarConfig(userId, isAdmin);
    
    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch menu config'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: MenuFormData = await request.json();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'default-user';
    
    const newItem = await MenuService.createMenuItem({
      ...body,
      userId,
      isVisible: true
    });
    
    return NextResponse.json({
      success: true,
      data: newItem
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to create menu item'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: MenuUpdateData = await request.json();
    
    const updatedItem = await MenuService.updateMenuItem(body.id, body);
    
    if (!updatedItem) {
      return NextResponse.json({
        success: false,
        message: 'Menu item not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      data: updatedItem
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to update menu item'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Menu item ID is required'
      }, { status: 400 });
    }
    
    const deleted = await MenuService.deleteMenuItem(id);
    
    if (!deleted) {
      return NextResponse.json({
        success: false,
        message: 'Menu item not found'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to delete menu item'
    }, { status: 500 });
  }
}