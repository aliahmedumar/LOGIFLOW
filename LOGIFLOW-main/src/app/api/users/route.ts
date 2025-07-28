// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { createUsersTable, createUser, findUserByEmail, findUserById, updateUser, deleteUser } from '@/models/user';

// Initialize the database table when the module is loaded
createUsersTable().catch(console.error);

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json();
    
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const newUser = await createUser(email, name);
    return NextResponse.json(newUser, { status: 201 });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const id = searchParams.get('id');

    if (email) {
      const user = await findUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(user);
    }

    if (id) {
      const user = await findUserById(id);
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(user);
    }

    return NextResponse.json(
      { error: 'Email or ID parameter is required' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const updatedUser = await updateUser(id, updates);
    return NextResponse.json(updatedUser);
    
  } catch (error: any) {
    console.error('Error updating user:', error);
    const status = error.message.includes('not found') ? 404 : 500;
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const deleted = await deleteUser(id);
    if (!deleted) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return new Response(null, { status: 204 });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
