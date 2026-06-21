export interface OTTProvider {
  id: number;
  name: string;
  color: string;
  bgColor: string;
}

export const OTT_PROVIDERS_IN: Record<string, OTTProvider> = {
  netflix: { id: 8, name: 'Netflix', color: '#E50914', bgColor: '#FFF0F0' },
  prime: { id: 9, name: 'Prime Video', color: '#00A8E1', bgColor: '#F0F9FF' },
  hotstar: { id: 342, name: 'Hotstar', color: '#1E80F0', bgColor: '#F0F7FF' },
  zee5: { id: 350, name: 'ZEE5', color: '#FF5722', bgColor: '#FFF5F0' },
  sonyliv: { id: 385, name: 'Sony LIV', color: '#1A1A2E', bgColor: '#F0F0F5' },
  jiocinema: { id: 220, name: 'JioCinema', color: '#E50914', bgColor: '#FFF0F0' },
};

export const PROVIDER_ID_MAP = Object.fromEntries(
  Object.values(OTT_PROVIDERS_IN).map((p) => [p.id, p])
);

export function getProviderById(id: number): OTTProvider | undefined {
  return PROVIDER_ID_MAP[id];
}

export const PROVIDER_IDS = Object.values(OTT_PROVIDERS_IN)
  .map((p) => p.id)
  .join('|');
