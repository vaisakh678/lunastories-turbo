import { Route, Routes } from "react-router-dom";

import { AdminGuard } from "@/components/admin-guard";
import { DashboardLayout } from "@/components/dashboard-layout";
import { AuthPage } from "@/pages/auth";
import { AvatarsPage } from "@/pages/avatars";
import { CharactersPage } from "@/pages/characters";
import { DashboardPage } from "@/pages/dashboard";
import { FeedbackPage } from "@/pages/feedback";
import { SsoCallbackPage } from "@/pages/sso-callback";
import { StoryDetailPage } from "@/pages/stories-detail";
import { StoriesPage } from "@/pages/stories";
import { UserDetailPage } from "@/pages/users-detail";
import { UsersPage } from "@/pages/users";

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/sso-callback" element={<SsoCallbackPage />} />
      <Route
        element={
          <AdminGuard>
            <DashboardLayout />
          </AdminGuard>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id" element={<UserDetailPage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/stories/:id" element={<StoryDetailPage />} />
        <Route path="/characters" element={<CharactersPage />} />
        <Route path="/avatars" element={<AvatarsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Route>
    </Routes>
  );
}
