import { useState } from 'react';
import { toast } from 'sonner';

export const useFetch = <T>(cb: (...args: any[]) => Promise<T>) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
      toast.error(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};
