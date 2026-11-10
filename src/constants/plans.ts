// Edit these to match your real pricing. Values mirror the subscription screenshots.
export const PLANS = [
  {
    id: 'basic',
    name: 'Basic Plan',
    description:
      'Enjoy an extensive library of movies and shows, featuring a range of content, including recently released titles.',
    monthly: 9.99,
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    description: 'Access to a wider selection of movies and shows, including most new releases and exclusive content',
    monthly: 12.99,
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    description: 'Access to a widest selection of movies and shows, including all new releases and Offline Viewing',
    monthly: 14.99,
  },
] as const;

export type PlanId = (typeof PLANS)[number]['id'];

export const COMPARE: Record<PlanId, { label: string; value: string }[]> = {
  basic: [
    { label: 'Price', value: '$9.99/Month' },
    { label: 'Free Trial', value: '7 Days' },
    { label: 'Content', value: 'Access to an extensive library of movies and shows, including recent titles.' },
    { label: 'Devices', value: 'Watch on One device at a time' },
    { label: 'Cancel Anytime', value: 'Yes' },
    { label: 'HDR', value: 'No' },
    { label: 'Dolby Atmos', value: 'No' },
    { label: 'Ad - Free', value: 'No' },
    { label: 'Offline Viewing', value: 'No' },
    { label: 'Family Sharing', value: '1 user' },
  ],
  standard: [
    { label: 'Price', value: '$12.99/Month' },
    { label: 'Free Trial', value: '7 Days' },
    { label: 'Content', value: 'Access to a wider selection of movies and shows, including most new releases and exclusive content' },
    { label: 'Devices', value: 'Watch on Two device simultaneously' },
    { label: 'Cancel Anytime', value: 'Yes' },
    { label: 'HDR', value: 'Yes' },
    { label: 'Dolby Atmos', value: 'Yes' },
    { label: 'Ad - Free', value: 'Yes' },
    { label: 'Offline Viewing', value: 'Yes, for select titles.' },
    { label: 'Family Sharing', value: '5 family members.' },
  ],
  premium: [
    { label: 'Price', value: '$14.99/Month' },
    { label: 'Free Trial', value: '7 Days' },
    { label: 'Content', value: 'Access to the widest selection of movies and shows, including all new releases.' },
    { label: 'Devices', value: 'Watch on Four devices simultaneously' },
    { label: 'Cancel Anytime', value: 'Yes' },
    { label: 'HDR', value: 'Yes' },
    { label: 'Dolby Atmos', value: 'Yes' },
    { label: 'Ad - Free', value: 'Yes' },
    { label: 'Offline Viewing', value: 'Yes, for all titles.' },
    { label: 'Family Sharing', value: '6 family members.' },
  ],
};
