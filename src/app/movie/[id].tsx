import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { TitleDetail } from '@/components/TitleDetail';
import { ErrorState, Loading } from '@/components/ui/Screen';
import { useCachedAsync } from '@/hooks/useCachedAsync';
import { getBackendTitleDetail } from '@/services/backend';

export default function MovieDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, loading, retry } = useCachedAsync(() => getBackendTitleDetail(id), `title:${id}`, [id]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Movie not found.'} onRetry={retry} />;
  return <TitleDetail detail={data} />;
}
