import { useState, useCallback } from 'react';
import { getErrorMessage } from '../utils/errorHandler';

export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = useCallback((error) => {
    const message = getErrorMessage(error);
    setError(message);
    console.error('Error:', error);

    // 3秒后自动清除错误
    setTimeout(() => {
      setError(null);
    }, 3000);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}

