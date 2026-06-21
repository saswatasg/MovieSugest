'use client';

import { OTTProvider } from '@/lib/ott-providers';

export default function OTTChip({ provider }: { provider: OTTProvider }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{
        backgroundColor: provider.bgColor,
        color: provider.color,
      }}
    >
      {provider.name}
    </span>
  );
}
