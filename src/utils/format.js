export const formatCount = (n) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${Math.round(n / 1_000)}K` : String(Math.round(n));
export const formatRuntime = (minutes) => {
    if (!minutes)
        return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h ? `${h}h ${m}min` : `${m}min`;
};
export const formatDate = (iso) => {
    if (!iso)
        return 'TBA';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};
export const detailPath = (kind, id) => (kind === 'movie' ? `/movie/${id}` : `/show/${id}`);
export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
