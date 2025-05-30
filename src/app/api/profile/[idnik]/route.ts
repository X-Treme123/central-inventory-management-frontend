// File: app/api/profile/[idnik]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Database connection interface
interface DatabaseConnection {
  query: (sql: string, params?: any[]) => Promise<any[]>;
}

// Mock database connection - replace with your actual implementation
const db: DatabaseConnection = {
  query: async (sql: string, params?: any[]) => {
    // Replace this with your actual database query implementation
    throw new Error('Database connection not implemented');
  }
};

interface UserProfileRow {
  idlogin: string;
  idnik: string;
  username: string;
  position: string;
  status_login: string;
  lokasi: string;
  last_active: string;
  date_upload: string;
  updatedAt: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { idnik: string } }
) {
  try {
    const { idnik } = params;

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication token required' },
        { status: 401 }
      );
    }

    // Verify JWT token
    let decodedToken: any;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check if user is trying to access their own profile or has admin privileges
    if (decodedToken.idnik !== idnik && !decodedToken.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized to access this profile' },
        { status: 403 }
      );
    }

    // Validate idnik parameter
    if (!idnik || typeof idnik !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Valid user ID is required' },
        { status: 400 }
      );
    }

    // Query the database view
    const query = `
      SELECT 
        idlogin,
        idnik,
        username,
        position,
        status_login,
        lokasi,
        last_active,
        date_upload,
        updatedAt
      FROM V_L_INVENTORY_USER_LOGIN 
      WHERE idnik = ? 
      AND status_login = 'Active'
      LIMIT 1
    `;

    const rows = await db.query(query, [idnik]) as UserProfileRow[];

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User profile not found or inactive' },
        { status: 404 }
      );
    }

    const userProfile = rows[0];

    // Return profile data (excluding sensitive fields)
    return NextResponse.json({
      success: true,
      data: {
        idlogin: userProfile.idlogin,
        idnik: userProfile.idnik,
        username: userProfile.username,
        position: userProfile.position,
        status_login: userProfile.status_login,
        lokasi: userProfile.lokasi,
        last_active: userProfile.last_active,
        date_upload: userProfile.date_upload,
        updatedAt: userProfile.updatedAt,
      }
    });

  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        })
      },
      { status: 500 }
    );
  }
}