export type UserRole = "user" | "admin";

export interface UserDTO {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
}

export interface AdminUserDTO extends UserDTO {
  clerkId: string;
  storyCount: number;
  characterCount: number;
}

export interface AdminStatsDTO {
  totalUsers: number;
  totalCharacters: number;
  totalStories: number;
  storiesByStatus: {
    pending: number;
    generating: number;
    ready: number;
    failed: number;
  };
  totalFeedback: number;
}

export interface PageMeta {
  total: number;
  page: number;
  perPage: number;
}

export interface PagedResponse<T> {
  items: T[];
  meta: PageMeta;
}
