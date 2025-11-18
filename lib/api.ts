import { Video, Comment, CreateVideoRequest, CreateCommentRequest, EditVideoRequest } from '@/types';
import { logger } from './logger';

// API base URL. Configure via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://take-home-assessment-423502.uc.r.appspot.com/api';

// User ID for API requests in snake_case format. Configure via environment variable
export const USER_ID = process.env.NEXT_PUBLIC_USER_ID || 'first_last';

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    queryParams?: Record<string, string>
  ): Promise<T> {
    // Build URL with query parameters
    let url = `${this.baseUrl}${endpoint}`;
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }
    
    logger.debug('API Request', {
      method: options.method || 'GET',
      url: url,
      endpoint: endpoint,
    });

    try {
      // Add Content-Type header only if request has body
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };
      
      if (options.body) {
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      logger.debug('API Response', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url,
      });

      // Read response body once
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      let responseData: any;
      try {
        if (isJson) {
          responseData = await response.json();
        } else {
          responseData = await response.text();
        }
      } catch (e) {
        logger.error('Could not read response body', e);
        responseData = null;
      }

      if (!response.ok) {
        logger.error('API Error Response', {
          status: response.status,
          statusText: response.statusText,
          url: response.url,
          body: responseData,
        });
        
        // Extract detailed error message from response
        let errorMessage = response.statusText || 'Unknown error';
        if (responseData) {
          if (typeof responseData === 'string') {
            errorMessage = responseData;
          } else if (responseData.message) {
            errorMessage = responseData.message;
          } else if (responseData.error) {
            errorMessage = responseData.error;
          } else if (Array.isArray(responseData) && responseData.length > 0) {
            errorMessage = JSON.stringify(responseData);
          } else {
            errorMessage = JSON.stringify(responseData);
          }
        }
        
        throw new Error(`API request failed (${response.status}): ${errorMessage}`);
      }

      logger.debug('API Success', { endpoint, status: response.status });
      return responseData;
    } catch (error) {
      logger.error('API Request Error', {
        message: error instanceof Error ? error.message : String(error),
        url: url,
        endpoint: endpoint,
      });
      throw error;
    }
  }

  // Video endpoints
  async getVideos(userId: string): Promise<Video[]> {
    logger.debug('Fetching videos', { userId });
    return this.request<Video[]>('/videos', {}, { user_id: userId });
  }

  async getVideo(id: string): Promise<Video> {
    logger.debug('Fetching video', { id });
    return this.request<Video>(`/videos/${id}`);
  }

  async createVideo(data: CreateVideoRequest): Promise<Video> {
    logger.debug('Creating video', { title: data.title });
    return this.request<Video>('/videos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVideo(data: EditVideoRequest): Promise<Video> {
    logger.debug('Updating video', { videoId: data.video_id, title: data.title });
    return this.request<Video>('/videos', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Comment endpoints
  async getComments(videoId: string): Promise<Comment[]> {
    logger.debug('Fetching comments', { videoId });
    return this.request<Comment[]>('/videos/comments', {}, { video_id: videoId });
  }

  async createComment(data: CreateCommentRequest): Promise<Comment> {
    logger.debug('Creating comment', { videoId: data.video_id });
    return this.request<Comment>('/videos/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    }, { video_id: data.video_id });
  }
}

export const apiService = new ApiService(API_BASE_URL);

