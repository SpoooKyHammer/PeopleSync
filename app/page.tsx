"use client";

import { useAuth } from '@/hooks/useAuth';
import Spinner from './components/Spinner';

export default function Home() {
  const { loading } = useAuth();

  if (loading) {
    return <Spinner />
  }

  return null;
}
