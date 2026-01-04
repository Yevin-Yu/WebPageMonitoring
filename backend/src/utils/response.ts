export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const successResponse = <T>(data: T, message: string = 'Success'): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
  };
};

export const errorResponse = (error: string, message: string = 'Error'): ApiResponse => {
  return {
    success: false,
    message,
    error,
  };
};
