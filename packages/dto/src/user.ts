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

export interface UsagePeriodDTO {
  storiesCount: number;
  textInputTokens: number;
  textOutputTokens: number;
  audioInputChars: number;
  audioDurationSeconds: number;
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
  usage: {
    today: UsagePeriodDTO;
    last7Days: UsagePeriodDTO;
    last30Days: UsagePeriodDTO;
    allTime: UsagePeriodDTO;
  };
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
