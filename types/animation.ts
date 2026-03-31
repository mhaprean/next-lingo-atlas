export interface TranslationGroup {
  groupId: string;
  family: string;
  color: string;
  entries: { country: string; translation: string }[];
}

export interface Word {
  name: string;
  groups: TranslationGroup[];
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface Delays {
  entryDelay: number;
  wordDelay: number;
  groupDelay: number;
}

export const DEFAULT_DELAYS: Delays = {
  entryDelay: 250,
  wordDelay: 3000,
  groupDelay: 3000,
};
