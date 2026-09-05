import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CompetencyAssessment from "./pages/CompetencyAssessment";
import LearningPath from "./pages/LearningPath";
import Quizzes from "./pages/Quizzes";
import QuizPage from "./pages/QuizPage";
import Assignments from "./pages/Assignments";
import AssignmentDetails from "./pages/AssignmentDetails";
import MaterialsUpload from "./pages/MaterialsUpload";
import AiModelsHub from "./pages/AiModelsHub";
import AdminDashboard from "./pages/AdminDashboard";
import ChatPage from "./pages/ChatPage";
import Community from "./pages/Community";
import Home from "./pages/Home";
import PrivacyPolicy from "./pages/Privacy";
import TermsOfService from "./pages/Terms";
import InterviewPage from "./pages/InterviewPage";
import InterviewHistory from "./pages/InterviewHistory";
import Pricing from "./pages/Pricing";
import InterviewReport from "./pages/InterviewReport";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "./redux/userSlice";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";
import ScrollProgressBar from "./components/ScrollProgressBar";
import LiveAdminChatWidget from "./components/LiveAdminChatWidget";

export const ServerUrl = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

const ProtectedRoute = ({ children, loading, requireAdmin = false }) => {
  const userData = useSelector((state) => state.user.userData);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-bold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span>Authenticating Session...</span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return <Navigate to="/auth" replace />;
  }

  if (requireAdmin && userData.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user", {
          withCredentials: true,
        });
        if (result.data) {
          dispatch(setUserData(result.data));
        }
      } catch (error) {
        console.log("Current user session error:", error);
        dispatch(setUserData(null));
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [dispatch]);

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-center" reverseOrder={false} />
      <ScrollProgressBar />
      <Routes>
        {/* Public SaaS Landing Page */}
        <Route path="/" element={<Home />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute loading={loading}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/competencies"
          element={
            <ProtectedRoute loading={loading}>
              <CompetencyAssessment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/learning-path"
          element={
            <ProtectedRoute loading={loading}>
              <LearningPath />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute loading={loading}>
              <Quizzes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <ProtectedRoute loading={loading}>
              <QuizPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments"
          element={
            <ProtectedRoute loading={loading}>
              <Assignments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/assignments/:id"
          element={
            <ProtectedRoute loading={loading}>
              <AssignmentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/materials"
          element={
            <ProtectedRoute loading={loading}>
              <MaterialsUpload />
            </ProtectedRoute>
          }
        />

        {/* Administrator Executive Analytics */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute loading={loading}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* AI Models Workflow Hub */}
        <Route
          path="/ai-models"
          element={
            <ProtectedRoute loading={loading}>
              <AiModelsHub />
            </ProtectedRoute>
          }
        />

        {/* AI Copilot & Community */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute loading={loading}>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="/community" element={<Community />} />

        {/* Authentication */}
        <Route path="/auth" element={<Auth />} />

        {/* Preserved Mock Interview Features */}
        <Route
          path="/interview"
          element={
            <ProtectedRoute loading={loading}>
              <InterviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute loading={loading}>
              <InterviewHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute loading={loading}>
              <Pricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/report/:id"
          element={
            <ProtectedRoute loading={loading}>
              <InterviewReport />
            </ProtectedRoute>
          }
        />

        {/* Legal & Static Pages */}
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/welcome" element={<Home />} />
      </Routes>
      <LiveAdminChatWidget />
    </>
  );
};

export default App;
