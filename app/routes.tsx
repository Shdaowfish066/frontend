import { createBrowserRouter, redirect } from 'react-router';
import { RootLayout } from './components/layout/RootLayout';
import AuthPage from './pages/AuthPage';
import FeedPage from './pages/FeedPage';
import SinglePostPage from './pages/SinglePostPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import ReportsPage from './pages/ReportsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: FeedPage },
      { path: 'auth', Component: AuthPage },
      { path: 'post/:id', Component: SinglePostPage },
      { path: 'communities', Component: CommunitiesPage },
      { path: 'communities/:id', Component: CommunityDetailPage },
      { path: 'messages', Component: MessagesPage },
      { path: 'profile', Component: ProfilePage },
      { path: 'reports', Component: ReportsPage },
    ],
  },
]);
