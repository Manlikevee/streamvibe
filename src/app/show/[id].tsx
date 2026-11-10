import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SeasonList } from '@/components/SeasonList';
import { TitleDetail } from '@/components/TitleDetail';
import { ErrorState, Loading } from '@/components/ui/Screen';
import { useAsync } from '@/hooks/useAsync';
import { getBackendTitleDetail } from '@/services/backend';

export default function ShowDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, error, loading, retry } = useAsync(() => getBackendTitleDetail(id), [id]);

  if (loading) return <Loading />;
  if (error || !data) return <ErrorState message={error ?? 'Show not found.'} onRetry={retry} />;
  return (
    <TitleDetail detail={data}>
      <SeasonList showId={typeof data.id === 'number' ? data.id : 0} seasons={data.seasons} />
    </TitleDetail>
  );
}
