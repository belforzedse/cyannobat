/**
 * Strapi API client for server-side requests
 * 
 * This module provides a type-safe interface to Strapi's REST API,
 * replacing the previous PayloadCMS integration.
 */

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: unknown;
  };
}

export interface StrapiAuthResponse {
  jwt: string;
  user: StrapiUser;
}

export interface StrapiUser {
  id: number;
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  role?: {
    id: number;
    name: string;
    type: string;
  };
  createdAt: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface StrapiQueryParams {
  populate?: string | string[] | Record<string, unknown>;
  filters?: Record<string, unknown>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
    start?: number;
    limit?: number;
  };
  fields?: string[];
  publicationState?: 'live' | 'preview';
  locale?: string;
}

/**
 * Builds a query string from Strapi query parameters
 */
function buildQueryString(params: StrapiQueryParams): string {
  const searchParams = new URLSearchParams();

  // Handle populate (can be string, array, or object)
  if (params.populate) {
    if (typeof params.populate === 'string') {
      searchParams.set('populate', params.populate);
    } else if (Array.isArray(params.populate)) {
      searchParams.set('populate', params.populate.join(','));
    } else {
      // Object format - convert to Strapi's nested format
      searchParams.set('populate', JSON.stringify(params.populate));
    }
  }

  // Handle filters
  if (params.filters) {
    searchParams.set('filters', JSON.stringify(params.filters));
  }

  // Handle sort
  if (params.sort) {
    if (typeof params.sort === 'string') {
      searchParams.set('sort', params.sort);
    } else {
      searchParams.set('sort', params.sort.join(','));
    }
  }

  // Handle pagination
  if (params.pagination) {
    if (params.pagination.page !== undefined) {
      searchParams.set('pagination[page]', String(params.pagination.page));
    }
    if (params.pagination.pageSize !== undefined) {
      searchParams.set('pagination[pageSize]', String(params.pagination.pageSize));
    }
    if (params.pagination.start !== undefined) {
      searchParams.set('pagination[start]', String(params.pagination.start));
    }
    if (params.pagination.limit !== undefined) {
      searchParams.set('pagination[limit]', String(params.pagination.limit));
    }
  }

  // Handle fields
  if (params.fields && params.fields.length > 0) {
    searchParams.set('fields', params.fields.join(','));
  }

  // Handle publication state
  if (params.publicationState) {
    searchParams.set('publicationState', params.publicationState);
  }

  // Handle locale
  if (params.locale) {
    searchParams.set('locale', params.locale);
  }

  return searchParams.toString();
}

/**
 * Makes a request to Strapi API with proper error handling
 */
async function strapiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<StrapiResponse<T> | StrapiError> {
  const url = `${STRAPI_URL}/api${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add API token if available (for server-side requests)
  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: {
          status: response.status,
          name: 'StrapiError',
          message: data.error?.message || response.statusText,
          details: data.error?.details,
        },
      } as StrapiError;
    }

    return data as StrapiResponse<T>;
  } catch (error) {
    return {
      error: {
        status: 500,
        name: 'NetworkError',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
    } as StrapiError;
  }
}

/**
 * Strapi client for server-side operations
 */
export const strapi = {
  /**
   * Find multiple documents
   */
  async find<T>(
    contentType: string,
    params: StrapiQueryParams = {},
  ): Promise<{ data: T[]; meta?: StrapiResponse<T>['meta'] }> {
    const queryString = buildQueryString(params);
    const endpoint = `/${contentType}${queryString ? `?${queryString}` : ''}`;
    
    const response = await strapiRequest<T[]>(endpoint);
    
    if ('error' in response) {
      throw new Error(`Strapi find failed: ${response.error.message}`);
    }

    // Strapi returns array directly in data field for list endpoints
    const data = Array.isArray(response.data) ? response.data : [response.data];
    
    return {
      data,
      meta: response.meta,
    };
  },

  /**
   * Find a single document by ID
   */
  async findByID<T>(
    contentType: string,
    id: string | number,
    params: Omit<StrapiQueryParams, 'pagination'> = {},
  ): Promise<T> {
    const queryString = buildQueryString(params);
    const endpoint = `/${contentType}/${id}${queryString ? `?${queryString}` : ''}`;
    
    const response = await strapiRequest<T>(endpoint);
    
    if ('error' in response) {
      throw new Error(`Strapi findByID failed: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Create a new document
   */
  async create<T>(
    contentType: string,
    data: Record<string, unknown>,
    params: Omit<StrapiQueryParams, 'pagination' | 'filters' | 'sort'> = {},
  ): Promise<T> {
    const queryString = buildQueryString(params);
    const endpoint = `/${contentType}${queryString ? `?${queryString}` : ''}`;
    
    const response = await strapiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
    
    if ('error' in response) {
      throw new Error(`Strapi create failed: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Update a document
   */
  async update<T>(
    contentType: string,
    id: string | number,
    data: Record<string, unknown>,
    params: Omit<StrapiQueryParams, 'pagination' | 'filters' | 'sort'> = {},
  ): Promise<T> {
    const queryString = buildQueryString(params);
    const endpoint = `/${contentType}/${id}${queryString ? `?${queryString}` : ''}`;
    
    const response = await strapiRequest<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ data }),
    });
    
    if ('error' in response) {
      throw new Error(`Strapi update failed: ${response.error.message}`);
    }

    return response.data;
  },

  /**
   * Delete a document
   */
  async delete(contentType: string, id: string | number): Promise<void> {
    const endpoint = `/${contentType}/${id}`;
    
    const response = await strapiRequest<unknown>(endpoint, {
      method: 'DELETE',
    });
    
    if ('error' in response) {
      throw new Error(`Strapi delete failed: ${response.error.message}`);
    }
  },

  /**
   * Authenticate with email/username and password
   */
  async login(
    identifier: string,
    password: string,
  ): Promise<StrapiAuthResponse> {
    const endpoint = '/auth/local';
    
    const response = await strapiRequest<StrapiUser>(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        identifier, // Strapi accepts email or username
        password,
      }),
    });
    
    if ('error' in response) {
      throw new Error(`Strapi login failed: ${response.error.message}`);
    }

    // Strapi auth/local returns jwt and user directly, not wrapped in data
    // We need to handle this differently
    const authResponse = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier,
        password,
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      throw new Error(`Strapi login failed: ${errorData.error?.message || authResponse.statusText}`);
    }

    return authResponse.json() as Promise<StrapiAuthResponse>;
  },

  /**
   * Register a new user
   */
  async register(
    username: string,
    email: string,
    password: string,
    additionalData?: Record<string, unknown>,
  ): Promise<StrapiAuthResponse> {
    const endpoint = '/auth/local/register';
    
    const authResponse = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        ...additionalData,
      }),
    });

    if (!authResponse.ok) {
      const errorData = await authResponse.json();
      throw new Error(`Strapi register failed: ${errorData.error?.message || authResponse.statusText}`);
    }

    return authResponse.json() as Promise<StrapiAuthResponse>;
  },

  /**
   * Get current user from JWT token
   */
  async getMe(token: string): Promise<StrapiUser> {
    const endpoint = '/users/me';
    
    const response = await strapiRequest<StrapiUser>(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if ('error' in response) {
      throw new Error(`Strapi getMe failed: ${response.error.message}`);
    }

    return response.data;
  },
};

/**
 * Extract JWT token from request headers (cookies or Authorization header)
 */
export function getStrapiTokenFromRequest(request: Request): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  // Check cookies (Strapi typically uses 'jwt' cookie name)
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c) => {
        const [key, ...rest] = c.split('=');
        return [key, rest.join('=')];
      }),
    );
    return cookies.jwt || cookies['strapi-jwt'] || null;
  }

  return null;
}
