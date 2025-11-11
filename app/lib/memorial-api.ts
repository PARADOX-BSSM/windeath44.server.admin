import {
  MemorialApplication,
  MemorialApplicationResponse,
  MemorialApplicationListResponse,
  MemorialApplicationsPagedResponse,
  MemorialApplicationUpdateRequest,
  MemorialApplicationFilters,
  ApiResponse
} from '../types/memorial';

class MemorialApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  // Get single memorial application by ID
  async getMemorialApplication(
    memorialApplicationId: number,
    userId?: string
  ): Promise<MemorialApplicationResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userId) {
      headers['user-id'] = userId;
    }

    const response = await fetch(
      `${this.baseUrl}/applications/${memorialApplicationId}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch memorial application: ${response.statusText}`);
    }

    const result: ApiResponse<MemorialApplicationResponse> = await response.json();
    return result.data;
  }

  // Get memorial applications with cursor-based pagination
  async getMemorialApplications(
    filters: MemorialApplicationFilters = {}
  ): Promise<MemorialApplicationsPagedResponse> {
    const params = new URLSearchParams();
    
    if (filters.cursorId !== undefined) params.set('cursorId', filters.cursorId.toString());
    if (filters.size !== undefined) params.set('size', filters.size.toString());
    if (filters.memorizingCode !== undefined) params.set('memorizingCode', filters.memorizingCode.toString());

    const response = await fetch(
      `${this.baseUrl}/applications?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch memorial applications: ${response.statusText}`);
    }

    const result: ApiResponse<MemorialApplicationsPagedResponse> = await response.json();
    return result.data;
  }

  // Get user's memorial applications
  async getMyMemorialApplications(
    userId: string,
    filters: MemorialApplicationFilters = {}
  ): Promise<MemorialApplicationsPagedResponse> {
    const params = new URLSearchParams();
    
    if (filters.cursorId !== undefined) params.set('cursorId', filters.cursorId.toString());
    if (filters.size !== undefined) params.set('size', filters.size.toString());

    const response = await fetch(
      `${this.baseUrl}/applications/my?${params}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch user memorial applications: ${response.statusText}`);
    }

    const result: ApiResponse<MemorialApplicationsPagedResponse> = await response.json();
    return result.data;
  }

  // Search memorial applications by character ID
  async searchMemorialApplications(
    characterId: number,
    filters: MemorialApplicationFilters = {},
    userId?: string
  ): Promise<MemorialApplicationsPagedResponse> {
    const params = new URLSearchParams({
      characterId: characterId.toString(),
    });
    
    if (filters.cursorId !== undefined) params.set('cursorId', filters.cursorId.toString());
    if (filters.size !== undefined) params.set('size', filters.size.toString());

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (userId) {
      headers['user-id'] = userId;
    }

    const response = await fetch(
      `${this.baseUrl}/applications/search?${params}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Failed to search memorial applications: ${response.statusText}`);
    }

    const result: ApiResponse<MemorialApplicationsPagedResponse> = await response.json();
    return result.data;
  }

  // Update memorial application
  async updateMemorialApplication(
    memorialApplicationId: number,
    updateData: MemorialApplicationUpdateRequest
  ): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/applications/${memorialApplicationId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update memorial application: ${response.statusText}`);
    }
  }

  // Delete memorial application
  async deleteMemorialApplication(memorialApplicationId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/applications/${memorialApplicationId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete memorial application: ${response.statusText}`);
    }
  }

  // Approve memorial application (Admin only)
  async approveMemorialApplication(
    memorialApplicationId: number,
    authorization?: string
  ): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authorization) {
      headers['Authorization'] = authorization;
    }

    const response = await fetch(
      `${this.baseUrl}/applications/approve/${memorialApplicationId}`,
      {
        method: 'PATCH',
        headers,
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to approve memorial application: ${response.statusText}`);
    }
  }

  // Reject memorial application (Admin only)
  async rejectMemorialApplication(memorialApplicationId: number): Promise<void> {
    const response = await fetch(
      `${this.baseUrl}/applications/cancel/${memorialApplicationId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to reject memorial application: ${response.statusText}`);
    }
  }
}

export const memorialApiClient = new MemorialApiClient();
export { MemorialApiClient };