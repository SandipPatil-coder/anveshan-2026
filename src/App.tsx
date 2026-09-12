import { useEffect } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { StartGate } from "@/components/StartGate";
import Navbar from "@/components/Navigation/Navbar";
import Footer from "@/components/Navigation/Footer";
import BackgroundFX from "@/components/ui/BackgroundFX";
import HomePage from "@/pages/HomePage";
import EventsPage from "@/pages/EventsPage";
import EventDetailsPage from "@/pages/EventDetailsPage";
import RegisterPage from "@/pages/RegisterPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import DashboardPage from "@/pages/DashboardPage";
import AdminPage from "@/pages/AdminPage";
import SchedulePage from "@/pages/SchedulePage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import NotFoundPage from "@/pages/NotFoundPage";
import { startMusic } from "@/lib/sfx";

function Layout() {
  useEffect(() => {
    // Boot flash removal is handled in main.tsx; scroll to top on route change
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    // Ambient loop needs a user gesture before browsers allow audio
    const kick = () => startMusic();
    window.addEventListener("pointerdown", kick, { once: true });
    window.addEventListener("keydown", kick, { once: true });
    return () => {
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", kick);
    };
  }, []);
  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundFX />
      <Navbar />
      <main className="relative z-10 flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:slug" element={<EventDetailsPage />} />
          <Route path="/register/:slug" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  // HashRouter: deep links work on static hosts like GitHub Pages
  return (
    <HashRouter>
      <AuthProvider>
        <StartGate>
          <Layout />
        </StartGate>
      </AuthProvider>
    </HashRouter>
  );
}
