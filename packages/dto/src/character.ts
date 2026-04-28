export type CharacterRole = "main" | "side";
export type Gender = "male" | "female" | "na";
export type CharacterRelation =
  | "parent"
  | "grandparent"
  | "friend"
  | "pet"
  | "sibling"
  | "other"
  | "fictional";

export interface CharacterDTO {
  id: string;
  role: CharacterRole;
  name: string;
  symbolName: string;
  tint: string;
  tagline: string | null;
  relation: CharacterRelation | null;

  age: number | null;
  gender: Gender | null;
  hairColor: string | null;
  eyeColor: string | null;
  hairstyle: string | null;

  interests: string[];
  extraInterestNote: string;

  createdAt: string;
  updatedAt: string;
}
