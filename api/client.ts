import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:4000/api') {
    this.baseURL = baseURL;
  }

  private async getAuthToken(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    await AsyncStorage.setItem('authToken', response.token);
    return response;
  }

  async register(name: string, email: string, password: string, role: string = 'student', branch?: string, section?: string) {
    const response = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role, branch, section }),
    });

    await AsyncStorage.setItem('authToken', response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  async logout() {
    await AsyncStorage.removeItem('authToken');
  }

  // Request methods
  async createRequest(reason: string, from: Date, to: Date, branch?: string, section?: string) {
    return this.request('/requests', {
      method: 'POST',
      body: JSON.stringify({ reason, from: from.toISOString(), to: to.toISOString(), branch, section }),
    });
  }

  async getRequests(params?: { role?: string; branch?: string; section?: string; status?: string }) {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const endpoint = queryParams ? `/requests?${queryParams}` : '/requests';
    return this.request(endpoint);
  }

  async getRequest(id: string) {
    return this.request(`/requests/${id}`);
  }

  async approveRequest(id: string, role: string, comment?: string) {
    return this.request(`/requests/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ role, comment }),
    });
  }

  async rejectRequest(id: string, role: string, comment?: string) {
    return this.request(`/requests/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ role, comment }),
    });
  }

  async cancelRequest(id: string) {
    return this.request(`/requests/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  }

  // QR methods
  async verifyQrToken(token: string) {
    return this.request('/qr/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }
}

export default new ApiClient();