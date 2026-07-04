import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute, AdminRoute, OrganizerRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LandingPage from './pages/LandingPage';
import RoleSelection from './pages/RoleSelection';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AttendeeDashboard from './pages/attendee/Dashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import CreateEventWizard from './pages/CreateEventWizard';
import AttendeeManagementPage from './pages/AttendeeManagementPage';
import RevenueDashboard from './pages/RevenueDashboard';
import VerificationPage from './pages/VerificationPage';
import AIAnalyticsPage from './pages/AIAnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import QRCheckinPage from './pages/QRCheckinPage';
import VendorMarketplace from './pages/VendorMarketplace';
import AIPlannerPage from './pages/AIPlannerPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import NotificationsPage from './pages/NotificationsPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import OrganizerAttendeesPage from './pages/OrganizerAttendeesPage';
import OrganizerEventsPage from './pages/OrganizerEventsPage';
import OrganizerCategoriesPage from './pages/OrganizerCategoriesPage';
import AdminSettingsPage from './pages/AdminSettingsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'roles',
        element: <RoleSelection />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'events',
        element: <EventsPage />,
      },
      {
        path: 'events/:id',
        element: <EventDetailPage />,
      },
      {
        path: 'booking/:eventId',
        element: (
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'my-bookings',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <MyBookingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'create-event',
        element: (
          <OrganizerRoute>
            <DashboardLayout>
              <CreateEventWizard />
            </DashboardLayout>
          </OrganizerRoute>
        ),
      },
      {
        path: 'events/:eventId/attendees',
        element: (
          <OrganizerRoute>
            <DashboardLayout>
              <AttendeeManagementPage />
            </DashboardLayout>
          </OrganizerRoute>
        ),
      },
      {
        path: 'organizer/events',
        element: (
          <OrganizerRoute>
            <DashboardLayout>
              <OrganizerEventsPage />
            </DashboardLayout>
          </OrganizerRoute>
        ),
      },
      {
        path: 'organizer/attendees',
        element: (
          <OrganizerRoute>
            <DashboardLayout>
              <OrganizerAttendeesPage />
            </DashboardLayout>
          </OrganizerRoute>
        ),
      },
      {
        path: 'organizer/categories',
        element: (
          <OrganizerRoute>
            <DashboardLayout>
              <OrganizerCategoriesPage />
            </DashboardLayout>
          </OrganizerRoute>
        ),
      },
      {
        path: 'organizer/revenue',
        element: (
          <OrganizerRoute>
            <DashboardLayout>
              <RevenueDashboard />
            </DashboardLayout>
          </OrganizerRoute>
        ),
      },
      {
        path: 'verification',
        element: (
          <AdminRoute>
            <DashboardLayout>
              <VerificationPage />
            </DashboardLayout>
          </AdminRoute>
        ),
      },
      {
        path: 'ai-analytics',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <AIAnalyticsPage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'calendar',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <CalendarPage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'qr-checkin',
        element: (
          <OrganizerRoute>
            <DashboardLayout>
              <QRCheckinPage />
            </DashboardLayout>
          </OrganizerRoute>
        ),
      },
      {
        path: 'vendors',
        element: <VendorMarketplace />,
      },
      {
        path: 'ai-planner',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <AIPlannerPage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <AttendeeDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'organizer/dashboard',
        element: (
          <OrganizerRoute>
            <DashboardLayout>
              <OrganizerDashboard />
            </DashboardLayout>
          </OrganizerRoute>
        ),
      },
      {
        path: 'admin/dashboard',
        element: (
          <AdminRoute>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/events',
        element: (
          <AdminRoute>
            <DashboardLayout>
              <VerificationPage />
            </DashboardLayout>
          </AdminRoute>
        ),
      },
      {
        path: 'admin/settings',
        element: (
          <AdminRoute>
            <DashboardLayout>
              <AdminSettingsPage />
            </DashboardLayout>
          </AdminRoute>
        ),
      },
      {
        path: 'notifications',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'messages',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <MessagesPage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <ProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
