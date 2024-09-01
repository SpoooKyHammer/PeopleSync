import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthToken, setAuthToken } from '@/config/api';

/**
 * Custom hook to handle authentication checks and redirection.
 * Redirects to the login page if the user is not authenticated.
 * Shows loading spinner while checking authentication.
 */
export function useAuth() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      if (token) {
        setAuthToken(token);
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  return { loading };
}
