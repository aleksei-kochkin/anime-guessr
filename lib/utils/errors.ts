// Utilities for error handling

export class AnimeGuessrError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AnimeGuessrError';
  }
}

export class APIError extends AnimeGuessrError {
  constructor(message: string, statusCode: number) {
    super(message, 'API_ERROR', statusCode);
    this.name = 'APIError';
  }
}

export class RateLimitError extends AnimeGuessrError {
  constructor() {
    super('Rate limit exceeded. Please try again later.', 'RATE_LIMIT', 429);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends AnimeGuessrError {
  constructor() {
    super('Network error. Please check your connection.', 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

export function handleAPIError(error: unknown): AnimeGuessrError {
  if (error instanceof AnimeGuessrError) {
    return error;
  }

  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new NetworkError();
  }

  if (error instanceof Error) {
    return new AnimeGuessrError(error.message);
  }

  return new AnimeGuessrError('An unknown error occurred');
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AnimeGuessrError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unknown error occurred';
}
