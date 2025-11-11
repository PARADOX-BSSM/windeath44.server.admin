import { NextRequest, NextResponse } from 'next/server';
import { k8sClient } from '../../../lib/k8sClient';

export async function GET(request: NextRequest) {
  try {
    // Get Kubernetes version information
    const version = await k8sClient.getVersion();
    
    return NextResponse.json({
      success: true,
      data: version
    });
  } catch (error) {
    console.error('Error fetching Kubernetes version:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Kubernetes version', 
        success: false 
      },
      { status: 500 }
    );
  }
}