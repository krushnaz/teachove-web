import { AxiosError } from 'axios';
import { apiClient } from '../config/axios';
import { MAX_PDF_SIZE_MB } from './uploadLimits';

function extractResponseData(error: unknown): any | null {
  if (error instanceof AxiosError && error.response?.data) {
    return error.response.data;
  }
  return null;
}

function shouldReturnApiError(responseData: any): boolean {
  return responseData?.hasOwnProperty('success') && !responseData.success;
}

function throwHttpError(responseData: any, status?: number): never {
  const serverMessage =
    responseData?.message || responseData?.error || `HTTP error! status: ${status ?? 'unknown'}`;
  const error = new Error(serverMessage);
  (error as any).status = status;
  (error as any).code = responseData?.code;
  (error as any).responseData = responseData;
  throw error;
}

function rethrowApiError(error: unknown): never {
  if (error instanceof AxiosError) {
    if (error.response?.status === 413) {
      throw new Error(
        error.response.data?.message ||
          `File is too large. Maximum upload size is ${MAX_PDF_SIZE_MB}MB.`
      );
    }

    const responseData = extractResponseData(error);
    if (responseData && shouldReturnApiError(responseData)) {
      throw new Error(responseData.message || 'Request failed');
    }
    if (responseData) {
      throwHttpError(responseData, error.response?.status);
    }

    if (!error.response) {
      throw new Error(
        'Upload failed. The file may be too large for the server — try a smaller PDF or contact support.'
      );
    }
  }

  console.error('API request failed:', error);
  throw error instanceof Error ? error : new Error('Request failed');
}

async function request<T>(method: 'get' | 'post' | 'put' | 'delete' | 'patch', endpoint: string, data?: any): Promise<T> {
  try {
    const response = await apiClient.request<T>({ method, url: endpoint, data });
    return response.data;
  } catch (error) {
    const responseData = extractResponseData(error);
    if (responseData && shouldReturnApiError(responseData)) {
      return responseData as T;
    }

    if (responseData) {
      throwHttpError(responseData, (error as AxiosError).response?.status);
    }

    rethrowApiError(error);
  }
}

export const apiHelper = {
  post: <T = any>(endpoint: string, data: any) => request<T>('post', endpoint, data),
  get: <T = any>(endpoint: string) => request<T>('get', endpoint),
  put: <T = any>(endpoint: string, data: any) => request<T>('put', endpoint, data),
  delete: <T = any>(endpoint: string) => request<T>('delete', endpoint),
  patch: <T = any>(endpoint: string, data?: any) => request<T>('patch', endpoint, data),

  async postFormData<T = any>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const response = await apiClient.post<T>(endpoint, formData);
      return response.data;
    } catch (error) {
      const responseData = extractResponseData(error);
      if (responseData && shouldReturnApiError(responseData)) {
        return responseData as T;
      }
      if (responseData) {
        throwHttpError(responseData, (error as AxiosError).response?.status);
      }
      rethrowApiError(error);
    }
  },

  async putFormData<T = any>(endpoint: string, formData: FormData): Promise<T> {
    try {
      const response = await apiClient.put<T>(endpoint, formData);
      return response.data;
    } catch (error) {
      const responseData = extractResponseData(error);
      if (responseData && shouldReturnApiError(responseData)) {
        return responseData as T;
      }
      if (responseData) {
        throwHttpError(responseData, (error as AxiosError).response?.status);
      }
      rethrowApiError(error);
    }
  },
};
