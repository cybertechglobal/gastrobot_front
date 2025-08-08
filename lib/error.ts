export class ApiError extends Error {
  public readonly status: number;
  public readonly details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  // Utility to create an ApiError from a fetch response
  static async fromResponse(response: Response): Promise<ApiError> {
    try {
      const errorBody = await response.json();
      const err = new ApiError(
        errorBody?.error || errorBody?.message || 'Request failed',
        response.status,
        errorBody?.details
      );

      // console.log('eeeeerrrrrorrrrrrr', errorBody);
      // console.log('eeeeerrrrrorrrrrrr', err);
      return err;
    } catch {
      return new ApiError('Request failed', response.status);
    }
  }

  // Utility for network or timeout errors
  static fromNetworkError(err: Error, status: number = 500): ApiError {
    return new ApiError(
      err.name === 'AbortError'
        ? 'Request timed out'
        : err.message || 'Network error',
      status
    );
  }
}


// export class ApiError extends Error {
//   public readonly status: number;
//   public readonly details?: any;
//   public readonly isApiError: boolean; // Add to identify ApiError

//   constructor(message: string, status: number, details?: any) {
//     super(message);
//     this.name = 'ApiError';
//     this.status = status;
//     this.details = details;
//     this.isApiError = true; // Set flag
//   }

//   static async fromResponse(response: Response): Promise<ApiError> {
//     try {
//       const errorBody = await response.json();
//       return new ApiError(
//         errorBody?.error || errorBody?.message || 'Request failed',
//         response.status,
//         errorBody?.details
//       );
//     } catch {
//       return new ApiError('Request failed', response.status);
//     }
//   }

//   static fromNetworkError(err: Error, status: number = 500): ApiError {
//     return new ApiError(
//       err.name === 'AbortError'
//         ? 'Request timed out'
//         : err.message || 'Network error',
//       status
//     );
//   }
// }
