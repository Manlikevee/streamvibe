import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { SeasonList } from '@/components/SeasonList';
import { TitleDetail } from '@/components/TitleDetail';
import { ErrorState, Loading } from '@/components/ui/Screen';
import { useCachedAsync } from '@/hooks/useCachedAsync';
import { getBackendTitleDetail } from '@/services/backend';
export default function ShowDetail() {
    const { id } = useLocalSearchParams();
    const { data, error, loading, retry } = useCachedAsync(() => getBackendTitleDetail(id), `title:${id}`, [id]);
    if (loading)
        return <Loading />;
    if (error || !data)
        return <ErrorState message={error ?? 'Show not found.'} onRetry={retry}/>;
    return (<TitleDetail detail={data}>
      <SeasonList showId={typeof data.id === 'number' ? data.id : 0} showTitle={data.title} poster={data.poster} backdrop={data.backdrop} seasons={data.seasons}/>
    </TitleDetail>);
}
