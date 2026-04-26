export interface AvatarDTO {
  id: string;
  name: string | null;
  url: string;
  isEnabled: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}
