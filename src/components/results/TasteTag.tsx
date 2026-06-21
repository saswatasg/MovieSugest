'use client';

import { TasteTag as TasteTagType } from '@/lib/taste-tags';

export default function TasteTag({ tag }: { tag: TasteTagType }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-accent-light/40 text-emerald-700"
      title={tag.description}
    >
      <span>{tag.emoji}</span>
      <span>{tag.label}</span>
    </span>
  );
}
