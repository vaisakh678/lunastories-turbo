// Data models ported from the iOS app (Models.swift + Network/*.swift).
// Field names match the API JSON exactly so the mock layer can be swapped
// for real endpoints without touching screens.

// MARK: Characters (Models.swift)

export type CharacterRole = 'main' | 'side';

export type Gender = 'male' | 'female' | 'na';

export type CharacterRelation =
  | 'parent'
  | 'grandparent'
  | 'friend'
  | 'pet'
  | 'sibling'
  | 'teacher'
  | 'imaginary'
  | 'other';

export const relationDisplayNames: Record<CharacterRelation, string> = {
  parent: 'Parent',
  grandparent: 'Grandparent',
  friend: 'Friend',
  pet: 'Pet',
  sibling: 'Sibling',
  teacher: 'Teacher',
  imaginary: 'Imaginary',
  other: 'Other',
};

export const relationIcons: Record<CharacterRelation, string> = {
  parent: 'figure.and.child.holdinghands',
  grandparent: 'person.2.fill',
  friend: 'person.fill.checkmark',
  pet: 'pawprint.fill',
  sibling: 'person.2',
  teacher: 'pencil.and.ruler.fill',
  imaginary: 'sparkles',
  other: 'person.fill.questionmark',
};

export const genderDisplayNames: Record<Gender, string> = {
  male: 'Male',
  female: 'Female',
  na: 'N/A',
};

// ColorPalette from Models.swift — named tints to concrete colors
// (SwiftUI system colors in dark appearance).
export const palette: Record<string, string> = {
  orange: '#FF9F0A',
  yellow: '#FFD60A',
  red: '#FF453A',
  pink: '#FF375F',
  purple: '#BF5AF2',
  indigo: '#5E5CE6',
  blue: '#0A84FF',
  cyan: '#64D2FF',
  teal: '#6AC4DC',
  mint: '#63E6E2',
  green: '#30D158',
  brown: '#AC8E68',
  gray: '#8E8E93',
  black: '#000000',
  white: '#FFFFFF',
};

export function tintColor(name: string | undefined | null): string {
  if (!name) return '#F06A4A';
  return palette[name.toLowerCase()] ?? '#F06A4A';
}

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  /** Bundled avatar id (UUID) or an SF Symbol name. */
  symbolName: string;
  tintName: string;
  tagline: string;
  relation?: CharacterRelation | null;
  age?: number | null;
  gender?: Gender | null;
  hairColor?: string | null;
  eyeColor?: string | null;
  hairstyle?: string | null;
  interests?: string[];
  extraInterestNote?: string;
}

export type CreateCharacterRequest = Omit<Character, 'id'>;
export type UpdateCharacterRequest = Partial<CreateCharacterRequest>;

// MARK: Stories (Network/StoryAPI.swift)

export type StoryStatus = 'pending' | 'generating' | 'ready' | 'failed';

export interface CoverIcon {
  symbolName: string;
  tint: string;
}

export type StoryBlock =
  | { kind: 'text'; text: string }
  | { kind: 'illustration'; symbolName: string; tint: string };

export interface StoryContent {
  blocks: StoryBlock[];
}

export interface StoryResponse {
  id: string;
  status: StoryStatus;
  modeKey: string;
  title?: string | null;
  summary?: string | null;
  coverSymbol?: string | null;
  coverTint?: string | null;
  coverIcons?: CoverIcon[] | null;
  durationSeconds?: number | null;
  content?: StoryContent | null;
  moral?: string | null;
  audio?: { url: string } | null;
  createdAt?: string;
}

export interface StoryPage {
  items: StoryResponse[];
  nextCursor?: string | null;
}

export interface CreateStoryRequest {
  modeKey: string;
  characterIds: string[];
  input: unknown;
}

// MARK: Usage (Network/UsageAPI.swift)

export interface GenerationUsage {
  message: string;
  used: number;
  total: number;
  remaining: number;
  percentUsed: number;
  resetsAt: string;
}

export interface UsageSummary {
  stories: GenerationUsage;
  audio: GenerationUsage;
}

// MARK: Profile (Network/UserAPI.swift)

export interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
}

// MARK: Bundled avatars (BundledAvatars.swift)

export const bundledAvatarIds = [
  '095ad436-8ab2-4ac9-be7a-29023a53caad',
  '0bbf5f92-1508-4acf-9e86-04ec514ea89d',
  '14f140b3-c060-43f7-832c-29f5911df06a',
  '14f54b8b-361d-421d-80bb-2426a8050802',
  '19e0ae1c-c729-4908-9b06-400731e03e09',
  '30209cc6-332f-4f5d-b1ae-00187624a7fc',
  '358c1986-7011-4996-8281-8b69ca19d4eb',
  '49dd0861-174d-4238-8191-8a361baea242',
  '599703be-e224-460f-bc0b-5c4823c0b15a',
  '61f012c9-81fc-4ece-884d-6170607cbd83',
  '62d19538-45ba-4f95-8f0a-9061c585db4e',
  '853564a9-f551-439d-9251-3105ddb370fe',
  '8f705056-5458-4ef9-9bf0-1c90156b0208',
  '98fadca3-1955-4d88-9fac-476070660c2b',
  'a1008c9e-4044-4006-9864-c01934abfa2e',
  'a141c9f5-304f-4f64-a638-ad4150cc4673',
  'c9fcb976-b370-441b-a2ed-bb46b7c5d3d8',
  'cdf2a552-aa51-4685-880e-a4e14b98b09d',
  'd0e005a7-cc3e-44bc-be88-1a67a9f3f094',
  'd1dafc21-484d-4597-a216-ff20ac1bf22e',
  'd6a49df0-a441-4536-bf5d-f4865ec0e4e4',
] as const;

// Metro needs static require() calls, so the map is spelled out.
export const avatarSources: Record<string, number> = {
  '095ad436-8ab2-4ac9-be7a-29023a53caad': require('../../assets/avatars/095ad436-8ab2-4ac9-be7a-29023a53caad.heic'),
  '0bbf5f92-1508-4acf-9e86-04ec514ea89d': require('../../assets/avatars/0bbf5f92-1508-4acf-9e86-04ec514ea89d.heic'),
  '14f140b3-c060-43f7-832c-29f5911df06a': require('../../assets/avatars/14f140b3-c060-43f7-832c-29f5911df06a.heic'),
  '14f54b8b-361d-421d-80bb-2426a8050802': require('../../assets/avatars/14f54b8b-361d-421d-80bb-2426a8050802.heic'),
  '19e0ae1c-c729-4908-9b06-400731e03e09': require('../../assets/avatars/19e0ae1c-c729-4908-9b06-400731e03e09.heic'),
  '30209cc6-332f-4f5d-b1ae-00187624a7fc': require('../../assets/avatars/30209cc6-332f-4f5d-b1ae-00187624a7fc.heic'),
  '358c1986-7011-4996-8281-8b69ca19d4eb': require('../../assets/avatars/358c1986-7011-4996-8281-8b69ca19d4eb.heic'),
  '49dd0861-174d-4238-8191-8a361baea242': require('../../assets/avatars/49dd0861-174d-4238-8191-8a361baea242.heic'),
  '599703be-e224-460f-bc0b-5c4823c0b15a': require('../../assets/avatars/599703be-e224-460f-bc0b-5c4823c0b15a.heic'),
  '61f012c9-81fc-4ece-884d-6170607cbd83': require('../../assets/avatars/61f012c9-81fc-4ece-884d-6170607cbd83.heic'),
  '62d19538-45ba-4f95-8f0a-9061c585db4e': require('../../assets/avatars/62d19538-45ba-4f95-8f0a-9061c585db4e.heic'),
  '853564a9-f551-439d-9251-3105ddb370fe': require('../../assets/avatars/853564a9-f551-439d-9251-3105ddb370fe.heic'),
  '8f705056-5458-4ef9-9bf0-1c90156b0208': require('../../assets/avatars/8f705056-5458-4ef9-9bf0-1c90156b0208.heic'),
  '98fadca3-1955-4d88-9fac-476070660c2b': require('../../assets/avatars/98fadca3-1955-4d88-9fac-476070660c2b.heic'),
  'a1008c9e-4044-4006-9864-c01934abfa2e': require('../../assets/avatars/a1008c9e-4044-4006-9864-c01934abfa2e.heic'),
  'a141c9f5-304f-4f64-a638-ad4150cc4673': require('../../assets/avatars/a141c9f5-304f-4f64-a638-ad4150cc4673.heic'),
  'c9fcb976-b370-441b-a2ed-bb46b7c5d3d8': require('../../assets/avatars/c9fcb976-b370-441b-a2ed-bb46b7c5d3d8.heic'),
  'cdf2a552-aa51-4685-880e-a4e14b98b09d': require('../../assets/avatars/cdf2a552-aa51-4685-880e-a4e14b98b09d.heic'),
  'd0e005a7-cc3e-44bc-be88-1a67a9f3f094': require('../../assets/avatars/d0e005a7-cc3e-44bc-be88-1a67a9f3f094.heic'),
  'd1dafc21-484d-4597-a216-ff20ac1bf22e': require('../../assets/avatars/d1dafc21-484d-4597-a216-ff20ac1bf22e.heic'),
  'd6a49df0-a441-4536-bf5d-f4865ec0e4e4': require('../../assets/avatars/d6a49df0-a441-4536-bf5d-f4865ec0e4e4.heic'),
};

export function isAvatarId(name: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name);
}
