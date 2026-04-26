import type { FileRefDTO } from "./file";

export interface AvatarDTO {
  id: string;
  name: string | null;
  image: FileRefDTO;
  isEnabled: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface AvatarEventDTO {
  id: string;
  avatarId: string;
  name: string | null;
  setting: string | null;
  action: string | null;
  tags: string[];
  image: FileRefDTO;
  isEnabled: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}
