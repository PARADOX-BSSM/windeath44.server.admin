import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const API_BASE_URL = process.env.MEMORIAL_API_URL || 'https://prod.windeath44.wiki/api';

// JWKS 클라이언트 설정
const client = jwksClient({
  jwksUri: `${API_BASE_URL}/auth/.well-known/jwks.json`,
  requestHeaders: {}, // 필요시 헤더 추가
  timeout: 30000, // 30초 타임아웃
});

// 키 가져오기 함수
function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    console.log('Token verification request received');
    
    if (!token) {
      console.log('No token provided in request');
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    console.log('Token received, length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...');

    // JWT 토큰 검증
    const verified = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, {
        // audience는 검증하지 않음 (JWT에 aud 필드가 없음)
        issuer: process.env.JWT_ISSUER || 'windeath44',
        algorithms: ['RS256']
      }, (err, decoded) => {
        if (err) {
          console.error('JWT verification failed:', err.message);
          reject(err);
        } else {
          console.log('JWT verification successful');
          resolve(decoded);
        }
      });
    });

    console.log('Returning valid token response');
    return NextResponse.json({ 
      valid: true, 
      user: verified 
    });

  } catch (error) {
    console.error('Error verifying JWT token:', error);
    return NextResponse.json(
      { 
        valid: false,
        message: 'Invalid or expired token',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 401 }
    );
  }
}