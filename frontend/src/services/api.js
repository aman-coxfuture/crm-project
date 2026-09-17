import { API_CONFIG } from "../config/apiConfig";

/**
 * Generic HTTP client wrapper for API requests.
 *
 * Supports JWT authentication header injection, consistent error formatting,
 * and seamless fallback handling for future backend connection.
 */

class ApiClient {
  constructor(config = API_CONFIG) {
    this.baseUrl = config.BASE_URL;
    this.defaultHeaders = config.HEADERS;
  }

  getAuthHeader() {
    const token = localStorage.getItem("educrm_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request(endpoint, options = {}) {
    let url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    if (options.params) {
      const queryParams = new URLSearchParams();

      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const queryString = queryParams.toString();

      if (queryString) {
        url += `?${queryString}`;
      }
    }
    const headers = {
      ...this.defaultHeaders,
      ...this.getAuthHeader(),
      ...options.headers,
    };

    try {
      const { params, ...fetchOptions } = options;

      const response = await fetch(url, {
        ...fetchOptions,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
        );
      }

      return await response.json();
    } catch (error) {
      // In development or when backend is offline, propagate error for service mock fallback
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: "GET", ...options });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data),
      ...options,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: "DELETE", ...options });
  }
}

export const api = new ApiClient();
export default api;
