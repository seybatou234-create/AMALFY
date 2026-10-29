import {
  User,
  ProProfile,
  ServiceRequest,
  RealEstateListing,
  VisitRequest,
  Product,
  Order,
  Conversation,
  Message,
  Review,
  FavoriteItem,
  ReportItem,
  AppNotification,
  CyberShieldStatus,
  CyberAttackType
} from '../types/index.js';

const BASE_URL = '/api';

// In-memory cache for resilient read operations
const apiCache = new Map<string, any>();

async function fetchJSON<T>(url: string, options?: RequestInit, retries = 2): Promise<T> {
  const isGet = !options?.method || options.method.toUpperCase() === 'GET';

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options?.headers || {})
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur requête (${res.status})`);
      }

      const data = await res.json();
      if (isGet) {
        apiCache.set(url, data);
        try {
          sessionStorage.setItem('api_cache_' + url, JSON.stringify(data));
        } catch {
          // Ignore quota errors
        }
      }
      return data as T;
    } catch (err: any) {
      const isLastAttempt = attempt === retries;

      // On GET failure (e.g. server restart, proxy drop), attempt cache fallback
      if (isGet) {
        if (apiCache.has(url)) {
          return apiCache.get(url) as T;
        }
        try {
          const stored = sessionStorage.getItem('api_cache_' + url);
          if (stored) {
            const parsed = JSON.parse(stored);
            apiCache.set(url, parsed);
            return parsed as T;
          }
        } catch {
          // Ignore parse errors
        }
      }

      if (isLastAttempt) {
        throw err;
      }

      // Backoff before retry (250ms, 500ms)
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
    }
  }

  throw new Error('Échec de la communication avec le serveur');
}

export const api = {
  // Auth & Profile
  async getMe(userId?: string): Promise<User> {
    const q = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return fetchJSON<User>(`${BASE_URL}/auth/me${q}`);
  },

  async login(identifier: string): Promise<User> {
    return fetchJSON<User>(`${BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  },

  async register(data: Partial<User>): Promise<User> {
    return fetchJSON<User>(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    return fetchJSON<User>(`${BASE_URL}/auth/user/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // AMALFY Services
  async getPros(params?: {
    profession?: string;
    city?: string;
    search?: string;
    isAvailable?: boolean;
  }): Promise<ProProfile[]> {
    const sp = new URLSearchParams();
    if (params?.profession) sp.set('profession', params.profession);
    if (params?.city) sp.set('city', params.city);
    if (params?.search) sp.set('search', params.search);
    if (params?.isAvailable) sp.set('isAvailable', 'true');
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return fetchJSON<ProProfile[]>(`${BASE_URL}/services/pros${qs}`);
  },

  async getProById(id: string): Promise<ProProfile & { reviews: Review[] }> {
    return fetchJSON<ProProfile & { reviews: Review[] }>(`${BASE_URL}/services/pros/${id}`);
  },

  async createProProfile(data: Partial<ProProfile>): Promise<ProProfile> {
    return fetchJSON<ProProfile>(`${BASE_URL}/services/pros`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getServiceRequests(userId: string, role: string): Promise<ServiceRequest[]> {
    return fetchJSON<ServiceRequest[]>(
      `${BASE_URL}/services/requests?userId=${encodeURIComponent(userId)}&role=${encodeURIComponent(role)}`
    );
  },

  async createServiceRequest(data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    return fetchJSON<ServiceRequest>(`${BASE_URL}/services/requests`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateServiceRequest(id: string, data: Partial<ServiceRequest>): Promise<ServiceRequest> {
    return fetchJSON<ServiceRequest>(`${BASE_URL}/services/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // AMALFY Immobilier
  async getListings(params?: {
    propertyType?: string;
    transactionType?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<RealEstateListing[]> {
    const sp = new URLSearchParams();
    if (params?.propertyType) sp.set('propertyType', params.propertyType);
    if (params?.transactionType) sp.set('transactionType', params.transactionType);
    if (params?.city) sp.set('city', params.city);
    if (params?.minPrice) sp.set('minPrice', String(params.minPrice));
    if (params?.maxPrice) sp.set('maxPrice', String(params.maxPrice));
    if (params?.search) sp.set('search', params.search);
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return fetchJSON<RealEstateListing[]>(`${BASE_URL}/real-estate${qs}`);
  },

  async getListingById(id: string): Promise<RealEstateListing> {
    return fetchJSON<RealEstateListing>(`${BASE_URL}/real-estate/${id}`);
  },

  async createListing(data: Partial<RealEstateListing>): Promise<RealEstateListing> {
    return fetchJSON<RealEstateListing>(`${BASE_URL}/real-estate`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteListing(id: string): Promise<{ success: boolean }> {
    return fetchJSON<{ success: boolean }>(`${BASE_URL}/real-estate/${id}`, {
      method: 'DELETE'
    });
  },

  async requestVisit(data: Partial<VisitRequest>): Promise<VisitRequest> {
    return fetchJSON<VisitRequest>(`${BASE_URL}/real-estate/visits`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getVisits(userId?: string): Promise<VisitRequest[]> {
    const qs = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return fetchJSON<VisitRequest[]>(`${BASE_URL}/real-estate/visits${qs}`);
  },

  async updateVisitStatus(id: string, status: string): Promise<VisitRequest> {
    return fetchJSON<VisitRequest>(`${BASE_URL}/real-estate/visits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  // AMALFY Market
  async getProducts(params?: {
    category?: string;
    condition?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Product[]> {
    const sp = new URLSearchParams();
    if (params?.category) sp.set('category', params.category);
    if (params?.condition) sp.set('condition', params.condition);
    if (params?.city) sp.set('city', params.city);
    if (params?.minPrice) sp.set('minPrice', String(params.minPrice));
    if (params?.maxPrice) sp.set('maxPrice', String(params.maxPrice));
    if (params?.search) sp.set('search', params.search);
    const qs = sp.toString() ? `?${sp.toString()}` : '';
    return fetchJSON<Product[]>(`${BASE_URL}/market/products${qs}`);
  },

  async getProductById(id: string): Promise<Product> {
    return fetchJSON<Product>(`${BASE_URL}/market/products/${id}`);
  },

  async createProduct(data: Partial<Product>): Promise<Product> {
    return fetchJSON<Product>(`${BASE_URL}/market/products`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    return fetchJSON<{ success: boolean }>(`${BASE_URL}/market/products/${id}`, {
      method: 'DELETE'
    });
  },

  // Orders
  async placeOrder(data: any): Promise<Order> {
    return fetchJSON<Order>(`${BASE_URL}/orders`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async getOrders(customerId?: string): Promise<Order[]> {
    const q = customerId ? `?customerId=${encodeURIComponent(customerId)}` : '';
    return fetchJSON<Order[]>(`${BASE_URL}/orders${q}`);
  },

  async updateOrderStatus(id: string, updates: Partial<Order>): Promise<Order> {
    return fetchJSON<Order>(`${BASE_URL}/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  // Messages & Chat
  async getConversations(userId: string): Promise<Conversation[]> {
    return fetchJSON<Conversation[]>(`${BASE_URL}/conversations?userId=${encodeURIComponent(userId)}`);
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    return fetchJSON<Message[]>(`${BASE_URL}/conversations/${conversationId}/messages`);
  },

  async startConversation(data: {
    currentUserId: string;
    targetUserId: string;
    currentUserName?: string;
    targetUserName?: string;
    itemType?: 'service' | 'immobilier' | 'produit';
    itemId?: string;
    itemTitle?: string;
  }): Promise<Conversation> {
    return fetchJSON<Conversation>(`${BASE_URL}/conversations`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async sendMessage(conversationId: string, senderId: string, senderName: string, text: string): Promise<Message> {
    return fetchJSON<Message>(`${BASE_URL}/messages`, {
      method: 'POST',
      body: JSON.stringify({ conversationId, senderId, senderName, text })
    });
  },

  // Reviews
  async getReviews(targetType: string, targetId: string): Promise<Review[]> {
    return fetchJSON<Review[]>(
      `${BASE_URL}/reviews?targetType=${encodeURIComponent(targetType)}&targetId=${encodeURIComponent(targetId)}`
    );
  },

  async submitReview(data: Partial<Review>): Promise<Review> {
    return fetchJSON<Review>(`${BASE_URL}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Favorites
  async getFavorites(userId: string): Promise<FavoriteItem[]> {
    return fetchJSON<FavoriteItem[]>(`${BASE_URL}/favorites?userId=${encodeURIComponent(userId)}`);
  },

  async toggleFavorite(userId: string, itemType: string, itemId: string): Promise<{ favorited: boolean }> {
    return fetchJSON<{ favorited: boolean }>(`${BASE_URL}/favorites/toggle`, {
      method: 'POST',
      body: JSON.stringify({ userId, itemType, itemId })
    });
  },

  // Reports
  async submitReport(data: Partial<ReportItem>): Promise<ReportItem> {
    return fetchJSON<ReportItem>(`${BASE_URL}/reports`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Admin
  async getAdminOverview(): Promise<{
    totalUsers: number;
    totalPros: number;
    totalServiceRequests: number;
    totalListings: number;
    totalProducts: number;
    totalOrders: number;
    totalReports: number;
    totalVolumeFCFA: number;
  }> {
    return fetchJSON(`${BASE_URL}/admin/overview`);
  },

  async getAdminReports(): Promise<ReportItem[]> {
    return fetchJSON<ReportItem[]>(`${BASE_URL}/admin/reports`);
  },

  async updateReportStatus(id: string, status: 'traite' | 'rejete'): Promise<ReportItem> {
    return fetchJSON<ReportItem>(`${BASE_URL}/admin/reports/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async resetSeedDatabase(): Promise<{ message: string }> {
    return fetchJSON(`${BASE_URL}/seed/reset`, { method: 'POST' });
  },

  // Notifications
  async getNotifications(userId: string): Promise<AppNotification[]> {
    const url = `${BASE_URL}/notifications?userId=${encodeURIComponent(userId)}`;
    try {
      const data = await fetchJSON<AppNotification[]>(url);
      return Array.isArray(data) ? data : [];
    } catch {
      return (apiCache.get(url) as AppNotification[]) || [];
    }
  },

  async markNotificationRead(id: string): Promise<AppNotification> {
    return fetchJSON<AppNotification>(`${BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  async markAllNotificationsRead(userId: string): Promise<{ success: boolean }> {
    return fetchJSON<{ success: boolean }>(`${BASE_URL}/notifications/mark-all-read`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  },

  // Cyber Defense & Shield
  async getSecurityStatus(): Promise<CyberShieldStatus> {
    return fetchJSON<CyberShieldStatus>(`${BASE_URL}/admin/security`);
  },

  async setDefenseMode(mode: 'standard' | 'renforce' | 'verrouille'): Promise<CyberShieldStatus> {
    return fetchJSON<CyberShieldStatus>(`${BASE_URL}/admin/security/mode`, {
      method: 'POST',
      body: JSON.stringify({ mode })
    });
  },

  async clearSecurityLogs(): Promise<CyberShieldStatus> {
    return fetchJSON<CyberShieldStatus>(`${BASE_URL}/admin/security/clear`, {
      method: 'POST'
    });
  },

  async simulateAttack(threatType: CyberAttackType): Promise<CyberShieldStatus> {
    return fetchJSON<CyberShieldStatus>(`${BASE_URL}/admin/security/simulate`, {
      method: 'POST',
      body: JSON.stringify({ threatType })
    });
  }
};
