const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const fetchData = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      // Merge any headers already present in options
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};
