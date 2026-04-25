export type CharacterRole = "main" | "side";
export type Gender = "male" | "female" | "na";

export interface CharacterDTO {
  id: string;
  role: CharacterRole;
  name: string;
  symbolName: string;
  tint: string;
  tagline: string | null;

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
