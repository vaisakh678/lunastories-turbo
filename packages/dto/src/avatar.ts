export interface AvatarDTO {
  id: string;
  name: string | null;
  url: string;
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
  url: string;
  isEnabled: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}
