import type { Character, CharacterRelation, CharacterRole, Gender } from '@/api/models';

// CharacterDraft + step definitions + option constants ported from
// CharacterWizardSheet.swift (wizard internals).

export interface CharacterDraft {
  name: string;
  relation: CharacterRelation | null;
  customRelation: string;
  age: number;
  gender: Gender;
  iconName: string;
  hairColor: string | null;
  eyeColor: string | null;
  hairstyle: string | null;
  interests: string[];
  extraInterestNote: string;
}

export function initDraft(editing?: Character | null): CharacterDraft {
  if (!editing) {
    return {
      name: '',
      relation: null,
      customRelation: '',
      age: 6,
      gender: 'na',
      iconName: 'person.fill',
      hairColor: null,
      eyeColor: null,
      hairstyle: null,
      interests: [],
      extraInterestNote: '',
    };
  }
  const relationDisplay = editing.relation
    ? editing.relation.charAt(0).toUpperCase() + editing.relation.slice(1)
    : null;
  return {
    name: editing.name,
    relation: editing.relation ?? null,
    customRelation: editing.tagline === relationDisplay ? '' : editing.tagline,
    age: editing.age ?? 6,
    gender: editing.gender ?? 'na',
    iconName: editing.symbolName,
    hairColor: editing.hairColor ?? null,
    eyeColor: editing.eyeColor ?? null,
    hairstyle: editing.hairstyle ?? null,
    interests: editing.interests ?? [],
    extraInterestNote: editing.extraInterestNote ?? '',
  };
}

// Steps — main: basicInfo → icon → appearance → interests;
// side: basicInfo → relation → icon.
export const mainSteps = ['basicInfo', 'icon', 'appearance', 'interests'] as const;
export const sideSteps = ['basicInfo', 'relation', 'icon'] as const;
export type WizardStep = (typeof mainSteps)[number] | (typeof sideSteps)[number];

export const stepTitles: Record<WizardStep, string> = {
  basicInfo: 'Basic Info',
  icon: 'Choose an Icon',
  relation: 'Relationship',
  appearance: 'Appearance',
  interests: 'Interests',
};

export function stepsFor(role: CharacterRole): readonly WizardStep[] {
  return role === 'main' ? mainSteps : sideSteps;
}

export function addPromptTitle(role: CharacterRole): string {
  return role === 'main' ? 'New Main Character' : 'New Side Character';
}

// Option constants (hex values follow the ColorPalette dark-appearance
// system colors in src/api/models.ts).
export const hairColorOptions: { name: string; color: string }[] = [
  { name: 'Black', color: '#000000' },
  { name: 'Brown', color: '#AC8E68' },
  { name: 'Blonde', color: '#FFD60A' },
  { name: 'Red', color: '#FF453A' },
  { name: 'Gray', color: '#8E8E93' },
  { name: 'White', color: '#FFFFFF' },
  { name: 'Blue', color: '#0A84FF' },
  { name: 'Pink', color: '#FF375F' },
];

export const eyeColorOptions: { name: string; color: string }[] = [
  { name: 'Brown', color: '#AC8E68' },
  { name: 'Blue', color: '#0A84FF' },
  { name: 'Green', color: '#30D158' },
  { name: 'Hazel', color: '#FF9F0A' },
  { name: 'Gray', color: '#8E8E93' },
];

export const hairstyleOptions = [
  'Short',
  'Long',
  'Curly',
  'Straight',
  'Ponytail',
  'Braids',
  'Bald',
];

export const interestOptions = [
  'Sports',
  'Music',
  'Reading',
  'Art',
  'Science',
  'Animals',
  'Dance',
  'Cooking',
  'Gaming',
  'Nature',
  'Magic',
  'Space',
];
