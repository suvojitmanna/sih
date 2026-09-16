import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { ServerUrl } from "../App";
import toast from "react-hot-toast";

const DiagnosticContext = createContext();

export const DiagnosticProvider = ({ children }) => {
  const { userData } = useSelector((state) => state.user);
  const [diagnosticStatus, setDiagnosticStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchDiagnosticStatus = useCallback(async () => {
    if (!userData || !userData.isProfileCompleted) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${ServerUrl}/api/competencies/diagnostic-status`,
        {
          withCredentials: true,
        }
      );
      if (res.data?.success) {
        setDiagnosticStatus(res.data);
      }
    } catch (err) {
      console.warn("Failed to fetch diagnostic status:", err.message);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchDiagnosticStatus();
  }, [fetchDiagnosticStatus]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchDiagnosticStatus();
    };
    window.addEventListener("diagnostic-updated", handleUpdate);
    window.addEventListener("assessmentCompleted", handleUpdate);
    window.addEventListener("focus", handleUpdate);
    return () => {
      window.removeEventListener("diagnostic-updated", handleUpdate);
      window.removeEventListener("assessmentCompleted", handleUpdate);
      window.removeEventListener("focus", handleUpdate);
    };
  }, [fetchDiagnosticStatus]);

  const isIntakeComplete = Boolean(
    !userData ||
    userData.role === "admin" ||
    userData.role === "trainer" ||
    (diagnosticStatus?.isDiagnosticFullyCompleted ??
      (diagnosticStatus?.isQuizCompleted &&
        diagnosticStatus?.isInterviewCompleted))
  );

  const isIntakePending = Boolean(
    userData &&
    userData.isProfileCompleted &&
    userData.role !== "admin" &&
    userData.role !== "trainer" &&
    !isIntakeComplete
  );

  const isPathLocked = (path) => {
    if (!isIntakePending) return false;
    if (!path || path === "/" || path === "" || path === "/auth" || path === "/terms" || path === "/privacy") {
      return false;
    }
    if (path === "/settings") return false;
    return true;
  };

  const isAssessmentAllowed = (pathname) => {
    if (!isIntakePending) return true;
    if (!pathname || pathname === "/" || pathname === "" || pathname === "/auth" || pathname === "/terms" || pathname === "/privacy" || pathname === "/settings") {
      return true;
    }
    if (pathname === "/interview") {
      return true;
    }
    if (pathname.startsWith("/quiz/")) {
      const diagQuizId = diagnosticStatus?.diagnosticQuiz?._id;
      if (!diagQuizId || pathname.includes(diagQuizId)) {
        return true;
      }
    }
    return false;
  };

  const triggerLockedError = (featureName = "") => {
    const msg = featureName
      ? `Access Restricted: ${featureName} is locked! Please complete both the Mandatory Intake Viva and Diagnostic Quiz from the Home page.`
      : "Access Restricted: Mandatory Intake Viva and Diagnostic Quiz must be completed first! Complete them from the Home page.";

    toast.error(msg, {
      id: "intake-lock-error",
      duration: 5000,
      icon: "🔒",
    });
  };

  return (
    <DiagnosticContext.Provider
      value={{
        diagnosticStatus,
        loadingDiagnostic: loading,
        fetchDiagnosticStatus,
        isIntakeComplete,
        isIntakePending,
        isPathLocked,
        isAssessmentAllowed,
        triggerLockedError,
      }}
    >
      {children}
    </DiagnosticContext.Provider>
  );
};

export const useDiagnostic = () => {
  const context = useContext(DiagnosticContext);
  if (!context) {
    throw new Error("useDiagnostic must be used within a DiagnosticProvider");
  }
  return context;
};
