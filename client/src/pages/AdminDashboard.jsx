import React, { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ServerUrl } from "../App";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import {
  FaUsers,
  FaTasks,
  FaBuilding,
  FaExclamationTriangle,
  FaSearch,
  FaFileUpload,
  FaEye,
  FaBookOpen,
  FaPlus,
  FaUserTie,
  FaComments,
  FaPaperclip,
  FaBullhorn,
  FaHeadset,
  FaChevronLeft,
  FaChevronRight,
  FaTrash,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaBrain,
  FaSlidersH,
  FaGraduationCap,
  FaLock,
} from "react-icons/fa";
import {
  BsShieldCheck,
  BsGrid3X3GapFill,
  BsFillSendFill,
  BsCircleFill,
} from "react-icons/bs";

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getAssignmentDeadlineInfo = (dueDateStr) => {
  if (!dueDateStr) {
    return {
      status: "no_limit",
      label: "No Expiration",
      badgeClass:
        "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-300 dark:border-slate-700",
      countdown: "Open Indefinitely",
      isExpired: false,
    };
  }

  const due = new Date(dueDateStr);
  if (isNaN(due.getTime())) {
    return {
      status: "invalid",
      label: "Invalid Date",
      badgeClass: "bg-slate-100 text-slate-600",
      countdown: "-",
      isExpired: false,
    };
  }

  const now = new Date();
  const diffMs = due.getTime() - now.getTime();

  if (diffMs <= 0) {
    return {
      status: "expired",
      label: "Expired / Closed",
      badgeClass:
        "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 font-black",
      countdown: `Ended on ${formatDateTime(dueDateStr)}`,
      isExpired: true,
    };
  }

  const totalSecs = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);

  if (days > 0) {
    return {
      status: "active",
      label: `⏳ ${days}d ${hours}h left`,
      badgeClass:
        "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold",
      countdown: `${days} Days ${hours} Hours Left`,
      isExpired: false,
    };
  }

  if (hours >= 6) {
    return {
      status: "active",
      label: `⏳ ${hours}h ${minutes}m left`,
      badgeClass:
        "bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800 font-bold",
      countdown: `${hours} Hours ${minutes} Mins Left`,
      isExpired: false,
    };
  }

  return {
    status: "urgent",
    label: `🔥 Due in ${hours > 0 ? `${hours}h ` : ""}${minutes}m`,
    badgeClass:
      "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-black animate-pulse",
    countdown: `${hours > 0 ? `${hours} Hours ` : ""}${minutes} Mins Left`,
    isExpired: false,
  };
};

const computeDueDateFromPreset = (presetKey) => {
  const now = new Date();
  switch (presetKey) {
    case "30m":
      return new Date(now.getTime() + 30 * 60 * 1000).toISOString();
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000).toISOString();
    case "2h":
      return new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString();
    case "6h":
      return new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();
    case "12h":
      return new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
    case "24h":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case "2d":
      return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
    case "3d":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    case "7d":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    case "none":
      return "";
    default:
      return "";
  }
};

const COLORS = [
  "#1e40af",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

const CADRE_OPTIONS = [
  "All",
  "Indian Statistical Service (ISS) Officer",
  "Senior Statistical Officer (SSO)",
  "Junior Statistical Officer (JSO)",
  "Field Operations Officer (FOD)",
  "Directorate of Economics & Statistics (DES)",
];

const DOMAIN_OPTIONS = [
  "Statistical Competencies",
  "Technical & Computational Competencies",
  "Digital Governance & Security",
  "Behavioural & Managerial Competencies",
];

const QUICK_REPLIES = [
  "Official study material has been dispatched to your portal.",
  "Your inquiry has been reviewed by the NSSTA Subject Matter Faculty.",
  "Please review the rubric feedback and resubmit your case study analysis.",
  "Your query regarding survey frame weighting has been forwarded to SDRD.",
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState(null);
  const [learners, setLearners] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCadreFilter, setSelectedCadreFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  const tabContainerRef = useRef(null);

  const handleTabScroll = (direction) => {
    if (tabContainerRef.current) {
      const scrollAmount = direction === "left" ? -280 : 280;
      tabContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const [inspectingUser, setInspectingUser] = useState(null);
  const [userDetailedData, setUserDetailedData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectTab, setInspectTab] = useState("competencies");

  const [fulfillingRequest, setFulfillingRequest] = useState(null);
  const [fulfillForm, setFulfillForm] = useState({
    adminResponseNote: "",
    dispatchedMaterialTitle: "",
    dispatchedMaterialUrl: "",
    dispatchedMaterialText: "",
    file: null,
  });
  const [fulfillSubmitting, setFulfillSubmitting] = useState(false);

  const [showDispatchMaterialModal, setShowDispatchMaterialModal] =
    useState(false);
  const [dispatchMaterialForm, setDispatchMaterialForm] = useState({
    title: "",
    domain: "Statistical Competencies",
    topic: "Sampling & Estimation Methodologies",
    targetUserId: "",
    targetCadre: "All",
    description: "",
    materialText: "",
    file: null,
  });
  const [dispatchMaterialLoading, setDispatchMaterialLoading] = useState(false);

  const [showDispatchAssignmentModal, setShowDispatchAssignmentModal] =
    useState(false);
  const [dispatchedAssignments, setDispatchedAssignments] = useState([]);
  const [assignmentSubTab, setAssignmentSubTab] = useState("posted"); // "posted" | "submissions"
  const [timerPreset, setTimerPreset] = useState("24h");
  const [customDueDateTime, setCustomDueDateTime] = useState("");
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    domain: "Statistical Competencies",
    targetCompetency: "Sampling Techniques & Estimation",
    assignedCadre: "All",
    assignedToUserId: "",
    difficulty: "Intermediate",
    scenario: "",
    instructions:
      "1. Analyze the sampling frame and institutional constraints.\n2. Formulate the mathematical multiplier and non-response adjustment formula.\n3. Draft an executive guidance note for NSS field teams.",
    estimatedHours: 4,
    dueDate: computeDueDateFromPreset("24h"),
    adminNotes: "",
  });
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);

  const [viewingSubmission, setViewingSubmission] = useState(null);

  const [conversations, setConversations] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [commSubTab, setCommSubTab] = useState("direct");
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [adminReplyText, setAdminReplyText] = useState("");
  const [adminReplyFile, setAdminReplyFile] = useState(null);
  const [adminReplyLoading, setAdminReplyLoading] = useState(false);
  const [chatSearch, setChatSearch] = useState("");
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    message: "",
  });
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const chatContainerRef = useRef(null);
  const prevRequestsCountRef = useRef(null);
  const prevSubmissionsCountRef = useRef(null);
  const prevQuizzesCountRef = useRef(null);

  const fetchAdminData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const [
        overviewRes,
        learnersRes,
        heatmapRes,
        requestsRes,
        subsRes,
        convsRes,
        broadcastsRes,
        dispatchedRes,
      ] = await Promise.all([
        axios.get(`${ServerUrl}/api/admin/overview`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/admin/learners`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/admin/heatmap`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/admin/material-requests`, {
          withCredentials: true,
        }),
        axios.get(`${ServerUrl}/api/admin/assignment-submissions`, {
          withCredentials: true,
        }),
        axios.get(`${ServerUrl}/api/support/admin/conversations`, {
          withCredentials: true,
        }),
        axios.get(`${ServerUrl}/api/support/admin/broadcasts`, {
          withCredentials: true,
        }),
        axios.get(`${ServerUrl}/api/admin/dispatched-assignments`, {
          withCredentials: true,
        }),
      ]);

      if (overviewRes.data.success) {
        const m = overviewRes.data.metrics;
        setMetrics(m);
        if (
          isBackground &&
          prevQuizzesCountRef.current !== null &&
          m?.totalQuizzesAttempted > prevQuizzesCountRef.current
        ) {
          toast("📊 Officer completed a new statistical competency quiz!", {
            icon: "📊",
            duration: 5000,
          });
        }
        prevQuizzesCountRef.current = m?.totalQuizzesAttempted;
      }
      const fetchedLearners = learnersRes.data.learners || [];
      if (learnersRes.data.success) setLearners(fetchedLearners);
      if (heatmapRes.data.success) setHeatmap(heatmapRes.data.heatmap || []);
      if (broadcastsRes.data.success) setBroadcasts(broadcastsRes.data.broadcasts || []);

      if (dispatchedRes?.data?.success) {
        setDispatchedAssignments(dispatchedRes.data.assignments || []);
      }

      if (requestsRes.data.success) {
        const reqs = requestsRes.data.requests || [];
        setMaterialRequests(reqs);
        if (
          isBackground &&
          prevRequestsCountRef.current !== null &&
          reqs.length > prevRequestsCountRef.current
        ) {
          toast("📄 New study material request received from an officer!", {
            icon: "📄",
            duration: 5000,
          });
        }
        prevRequestsCountRef.current = reqs.length;
      }

      if (subsRes.data.success) {
        const subs = subsRes.data.submissions || [];
        setSubmissions(subs);
        if (
          isBackground &&
          prevSubmissionsCountRef.current !== null &&
          subs.length > prevSubmissionsCountRef.current
        ) {
          toast("📝 New assignment case study submission received!", {
            icon: "📝",
            duration: 5000,
          });
        }
        prevSubmissionsCountRef.current = subs.length;
      }

      if (convsRes.data.success) {
        const convs = convsRes.data.conversations || [];
        setConversations(
          convs.map((c) =>
            selectedOfficer?.officerId === c.officerId
              ? { ...c, unreadCount: 0 }
              : c,
          ),
        );
        if (!selectedOfficer) {
          if (convs.length > 0) {
            setSelectedOfficer(convs[0]);
          } else if (fetchedLearners.length > 0) {
            const firstL = fetchedLearners[0];
            setSelectedOfficer({
              officerId: firstL._id,
              officerName: firstL.name,
              officerEmail: firstL.email,
              officerCadre: firstL.jobRole || "Statistical Cadre",
              officerDepartment: firstL.department || "MoSPI Headquarters",
              lastMessage: "",
              lastMessageAt: new Date(),
              lastSenderRole: "learner",
              unreadCount: 0,
            });
          }
        }
      }
    } catch (error) {
      if (!isBackground) {
        console.error("Admin dashboard fetch error:", error);
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData(false);
    const interval = setInterval(() => {
      fetchAdminData(true);
    }, 3000);

    const handleRealtimeUpdate = () => {
      fetchAdminData(true);
    };

    window.addEventListener("assessmentCompleted", handleRealtimeUpdate);
    window.addEventListener("storage", handleRealtimeUpdate);
    window.addEventListener("focus", handleRealtimeUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener("assessmentCompleted", handleRealtimeUpdate);
      window.removeEventListener("storage", handleRealtimeUpdate);
      window.removeEventListener("focus", handleRealtimeUpdate);
    };
  }, [selectedOfficer?.officerId]);

  const fetchSelectedConversation = async () => {
    if (!selectedOfficer?.officerId) return;
    try {
      const { data } = await axios.get(
        `${ServerUrl}/api/support/admin/conversation/${selectedOfficer.officerId}`,
        { withCredentials: true },
      );
      if (data.success) {
        setConversationMessages(data.messages || []);
        setConversations((prev) =>
          prev.map((c) =>
            c.officerId === selectedOfficer.officerId
              ? { ...c, unreadCount: 0 }
              : c,
          ),
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSelectedConversation();
    const interval = setInterval(fetchSelectedConversation, 2500);
    return () => clearInterval(interval);
  }, [selectedOfficer?.officerId]);

  useEffect(() => {
    if (activeTab === "communications" && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationMessages, activeTab]);

  const handleInspectUser = async (user) => {
    setInspectingUser(user);
    setInspectLoading(true);
    try {
      const { data } = await axios.get(
        `${ServerUrl}/api/admin/learner-detail/${user._id}`,
        { withCredentials: true },
      );
      if (data.success) {
        setUserDetailedData(data);
      } else {
        toast.error("Failed to load officer details.");
      }
    } catch (error) {
      toast.error("Error inspecting officer performance history.");
    } finally {
      setInspectLoading(false);
    }
  };

  const handleFulfillRequestSubmit = async (e) => {
    e.preventDefault();
    if (!fulfillingRequest) return;
    setFulfillSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("adminResponseNote", fulfillForm.adminResponseNote);
      formData.append(
        "dispatchedMaterialTitle",
        fulfillForm.dispatchedMaterialTitle,
      );
      formData.append(
        "dispatchedMaterialUrl",
        fulfillForm.dispatchedMaterialUrl,
      );
      formData.append(
        "dispatchedMaterialText",
        fulfillForm.dispatchedMaterialText,
      );
      if (fulfillForm.file) {
        formData.append("file", fulfillForm.file);
      }

      const { data } = await axios.post(
        `${ServerUrl}/api/admin/material-requests/${fulfillingRequest._id}/fulfill`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );
      if (data.success) {
        toast.success(
          "Study material successfully dispatched to the officer! 📄✨",
        );
        setFulfillingRequest(null);
        setFulfillForm({
          adminResponseNote: "",
          dispatchedMaterialTitle: "",
          dispatchedMaterialUrl: "",
          dispatchedMaterialText: "",
          file: null,
        });
        fetchAdminData();
      } else {
        toast.error(data.message || "Failed to fulfill request.");
      }
    } catch (error) {
      toast.error("Error updating material request.");
    } finally {
      setFulfillSubmitting(false);
    }
  };

  const handleDirectMaterialDispatch = async (e) => {
    e.preventDefault();
    if (!dispatchMaterialForm.title || !dispatchMaterialForm.description) {
      toast.error("Please fill in title and description.");
      return;
    }
    setDispatchMaterialLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", dispatchMaterialForm.title);
      formData.append("domain", dispatchMaterialForm.domain);
      formData.append("topic", dispatchMaterialForm.topic);
      formData.append("targetUserId", dispatchMaterialForm.targetUserId);
      formData.append("targetCadre", dispatchMaterialForm.targetCadre);
      formData.append("description", dispatchMaterialForm.description);
      formData.append("materialText", dispatchMaterialForm.materialText);
      if (dispatchMaterialForm.file) {
        formData.append("file", dispatchMaterialForm.file);
      }

      const { data } = await axios.post(
        `${ServerUrl}/api/admin/dispatch-material`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );
      if (data.success) {
        toast.success(
          "Study material dispatched and archived successfully! 🚀",
        );
        setShowDispatchMaterialModal(false);
        setDispatchMaterialForm({
          title: "",
          domain: "Statistical Competencies",
          topic: "Sampling & Estimation Methodologies",
          targetUserId: "",
          targetCadre: "All",
          description: "",
          materialText: "",
          file: null,
        });
        fetchAdminData();
      } else {
        toast.error(data.message || "Failed to dispatch material.");
      }
    } catch (error) {
      toast.error("Error dispatching material.");
      console.log(error);
    } finally {
      setDispatchMaterialLoading(false);
    }
  };

  const handleDispatchAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (
      !assignmentForm.title ||
      !assignmentForm.targetCompetency ||
      !assignmentForm.scenario
    ) {
      toast.error("Please fill in all mandatory assignment fields.");
      return;
    }
    setAssignmentSubmitting(true);
    try {
      const instructionsArr = assignmentForm.instructions
        .split("\n")
        .map((i) => i.trim())
        .filter(Boolean);

      let calculatedDueDate = assignmentForm.dueDate;
      if (timerPreset === "custom" && customDueDateTime) {
        calculatedDueDate = new Date(customDueDateTime).toISOString();
      } else if (timerPreset !== "custom") {
        calculatedDueDate = computeDueDateFromPreset(timerPreset);
      }

      const payload = {
        ...assignmentForm,
        instructions: instructionsArr,
        dueDate: calculatedDueDate || null,
      };

      const { data } = await axios.post(
        `${ServerUrl}/api/admin/dispatch-assignment`,
        payload,
        { withCredentials: true },
      );
      if (data.success) {
        toast.success("Case study assignment successfully dispatched! 📋✨");
        setShowDispatchAssignmentModal(false);
        setTimerPreset("24h");
        setCustomDueDateTime("");
        setAssignmentForm({
          title: "",
          domain: "Statistical Competencies",
          targetCompetency: "Sampling Techniques & Estimation",
          assignedCadre: "All",
          assignedToUserId: "",
          difficulty: "Intermediate",
          scenario: "",
          instructions:
            "1. Analyze the sampling frame and institutional constraints.\n2. Formulate the mathematical multiplier and non-response adjustment formula.\n3. Draft an executive guidance note for NSS field teams.",
          estimatedHours: 4,
          dueDate: computeDueDateFromPreset("24h"),
          adminNotes: "",
        });
        fetchAdminData(true);
      } else {
        toast.error(data.message || "Failed to dispatch assignment.");
      }
    } catch (error) {
      toast.error("Error creating assignment.");
      console.log(error);
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  const handleDeleteDispatchedAssignment = async (assignmentId, title) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete the case study assignment:\n\n"${title}"?\n\nThis will remove it from all officers' portals and cannot be undone.`
      )
    ) {
      return;
    }
    try {
      const { data } = await axios.delete(
        `${ServerUrl}/api/admin/dispatched-assignments/${assignmentId}`,
        { withCredentials: true }
      );
      if (data.success) {
        toast.success(data.message || "Case study deleted successfully! 🗑️");
        setDispatchedAssignments((prev) =>
          prev.filter((a) => a._id !== assignmentId)
        );
        fetchAdminData(true);
      } else {
        toast.error(data.message || "Failed to delete case study.");
      }
    } catch (error) {
      console.error("Delete assignment error:", error);
      toast.error(
        error.response?.data?.message || "Error deleting case study assignment."
      );
    }
  };

  const handleAdminReplySubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedOfficer?.officerId ||
      (!adminReplyText.trim() && !adminReplyFile)
    )
      return;

    const replyMsg = adminReplyText.trim();
    setAdminReplyText("");
    const fileToSend = adminReplyFile;
    setAdminReplyFile(null);
    setAdminReplyLoading(true);

    try {
      const formData = new FormData();
      formData.append("officerId", selectedOfficer.officerId);
      formData.append("message", replyMsg || "Attached document from faculty.");
      if (fileToSend) {
        formData.append("file", fileToSend);
      }

      const { data } = await axios.post(
        `${ServerUrl}/api/support/admin/reply`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      if (data.success) {
        fetchSelectedConversation();
        fetchAdminData(true);
      }
    } catch (error) {
      toast.error("Error delivering reply.");
      console.log(error);
    } finally {
      setAdminReplyLoading(false);
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.message.trim()) return;
    setBroadcastLoading(true);
    try {
      const { data } = await axios.post(
        `${ServerUrl}/api/support/admin/broadcast`,
        broadcastForm,
        {
          withCredentials: true,
        },
      );
      if (data.success) {
        toast.success("Announcement broadcasted to all officers! 📢");
        setShowBroadcastModal(false);
        setBroadcastForm({ title: "", message: "" });
        fetchAdminData(true);
      }
    } catch (error) {
      toast.error("Failed to broadcast announcement.");
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleDeleteBroadcast = async (broadcastId) => {
    if (!window.confirm("Are you sure you want to delete this broadcast announcement?")) return;
    try {
      const { data } = await axios.delete(
        `${ServerUrl}/api/support/admin/broadcast/${broadcastId}`,
        { withCredentials: true },
      );
      if (data.success) {
        toast.success("Broadcast announcement deleted successfully.");
        setBroadcasts((prev) => prev.filter((b) => b._id !== broadcastId));
        fetchAdminData(true);
      }
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Failed to delete broadcast announcement.",
      );
    }
  };

  const filteredLearners = learners.filter((l) => {
    const matchesSearch =
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.jobRole?.toLowerCase().includes(search.toLowerCase());
    const matchesCadre =
      selectedCadreFilter === "All" ||
      l.jobRole?.toLowerCase().includes(selectedCadreFilter.toLowerCase());
    return matchesSearch && matchesCadre;
  });

  const filteredConversations = conversations.filter(
    (c) =>
      c.officerName?.toLowerCase().includes(chatSearch.toLowerCase()) ||
      c.officerCadre?.toLowerCase().includes(chatSearch.toLowerCase()),
  );

  const totalUnreadMessages = conversations.reduce(
    (acc, c) => acc + (c.unreadCount || 0),
    0,
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-6">
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider mb-2">
              <BsShieldCheck size={13} />
              <span>National Statistical Systems Training Academy (NSSTA)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Executive Academy Administration & Oversight Hub
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Monitor officers' viva experiences, respond to real-time
              inquiries, fulfill study material requests, and dispatch
              statistical case studies.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setShowBroadcastModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FaBullhorn size={12} />
              <span>Broadcast Announcement</span>
            </button>

            <button
              onClick={() => setShowDispatchMaterialModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FaFileUpload size={12} />
              <span>Dispatch Material</span>
            </button>

            <button
              onClick={() => setShowDispatchAssignmentModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <FaTasks size={12} />
              <span>Assign Case Study</span>
            </button>
          </div>
        </div>

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabScroll("left")}
            className="p-3 rounded-2xl bg-slate-200/90 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-800 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center hover:text-blue-600 dark:hover:text-blue-400"
            title="Scroll tabs left"
            aria-label="Scroll left"
          >
            <FaChevronLeft size={12} />
          </button>

          <div
            ref={tabContainerRef}
            className="flex-1 flex overflow-x-auto gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 rounded-2xl text-xs font-bold no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
          >
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === "overview"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <BsGrid3X3GapFill size={13} />
              <span>1. Cadre Overview & Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab("learners")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === "learners"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <FaUsers size={13} />
              <span>2. Officer Performance & Experience Monitor</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {learners.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("materials")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === "materials"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <FaBookOpen size={13} />
              <span>3. Study Material Requests & Dispatch Hub</span>
              {metrics?.pendingMaterialRequests > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500 text-white animate-pulse">
                  {metrics.pendingMaterialRequests} Pending
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("assignments")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === "assignments"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <FaTasks size={13} />
              <span>4. Custom Assignments & Submissions</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {submissions.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("communications")}
              className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === "communications"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
            >
              <FaComments size={13} />
              <span>5. Live Helpdesk & Real-Time Communications</span>
              {totalUnreadMessages > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 text-white animate-bounce">
                  {totalUnreadMessages} New
                </span>
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleTabScroll("right")}
            className="p-3 rounded-2xl bg-slate-200/90 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300/60 dark:border-slate-800 transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center hover:text-blue-600 dark:hover:text-blue-400"
            title="Scroll tabs right"
            aria-label="Scroll right"
          >
            <FaChevronRight size={12} />
          </button>
        </div>
        {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Total Officers
                </span>
                <div className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-400">
                  {metrics?.totalLearners || 1}
                </div>
                <span className="text-[10px] font-bold text-emerald-600">
                  Registered Personnel
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Avg Competency
                </span>
                <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {metrics?.avgCompetency || 70}%
                </div>
                <span className="text-[10px] font-bold text-blue-600">
                  System Benchmark
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  AI Viva Sessions
                </span>
                <div className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {metrics?.totalInterviews || 0}
                </div>
                <span className="text-[10px] font-bold text-indigo-500">
                  Cadre Mock Drills
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Quizzes Attempted
                </span>
                <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {metrics?.totalQuizzesAttempted || 0}
                </div>
                <span className="text-[10px] font-bold text-emerald-500">
                  Evaluations Taken
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Material Requests
                </span>
                <div className="mt-1 text-2xl font-black text-amber-500">
                  {metrics?.pendingMaterialRequests || 0}
                </div>
                <span className="text-[10px] font-bold text-amber-500">
                  Pending Response
                </span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Case Submissions
                </span>
                <div className="mt-1 text-2xl font-black text-purple-600 dark:text-purple-400">
                  {metrics?.totalSubmissions || 0}
                </div>
                <span className="text-[10px] font-bold text-purple-500">
                  Evaluated Solutions
                </span>
              </div>
            </div>

            {broadcasts.length > 0 && (
              <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs">
                    <FaBullhorn size={14} className="animate-pulse" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-700 dark:text-amber-400 uppercase text-[10px] tracking-wider block">
                      Active Broadcast: {broadcasts[0].senderName || "NSSTA Announcement"}
                    </span>
                    <p className="text-slate-800 dark:text-slate-200 font-semibold line-clamp-1">
                      {broadcasts[0].message}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("communications");
                    setCommSubTab("broadcasts");
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                >
                  Manage Broadcasts ({broadcasts.length})
                </button>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FaUserTie className="text-blue-600" />
                  <span>Cadre Distribution Across Ministry</span>
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics?.cadreDistribution || []}
                      margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#94a3b8"
                        opacity={0.2}
                      />
                      <XAxis
                        dataKey="cadre"
                        tick={{ fontSize: 10, fill: "#64748b" }}
                        interval={0}
                        angle={-15}
                        textAnchor="end"
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip
                        cursor={{ fill: "rgba(59, 130, 246, 0.08)", rx: 8, ry: 8 }}
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "14px",
                          border: "1px solid #e2e8f0",
                          color: "#0f172a",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "10px 14px",
                        }}
                        itemStyle={{ color: "#2563eb", fontWeight: "700" }}
                        labelStyle={{ color: "#0f172a", fontWeight: "800", marginBottom: "4px" }}
                      />
                      <Bar
                        dataKey="officers"
                        fill="#2563eb"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FaBuilding className="text-emerald-600" />
                  <span>Division & Directorate Breakdown</span>
                </h3>
                <div className="h-64 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metrics?.departmentDistribution || []}
                        dataKey="learners"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {(metrics?.departmentDistribution || []).map(
                          (_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#ffffff",
                          borderRadius: "14px",
                          border: "1px solid #e2e8f0",
                          color: "#0f172a",
                          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
                          fontSize: "12px",
                          fontWeight: "600",
                          padding: "10px 14px",
                        }}
                        itemStyle={{ color: "#0f172a", fontWeight: "700" }}
                        labelStyle={{ color: "#0f172a", fontWeight: "800" }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <FaExclamationTriangle className="text-amber-500" />
                    <span>Top Priority Skill Deficits Across Cadres</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400">
                    MoSPI Diagnostic
                  </span>
                </div>
                <div className="space-y-3">
                  {(metrics?.topDeficits || []).map((def, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                          {def.competencyName}
                        </span>
                      </div>
                      <span className="text-xs font-black text-amber-600 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl">
                        {def.count} Officers Impacted
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FaBuilding className="text-blue-600" />
                  <span>Division Competency Matrix</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase text-slate-400">
                        <th className="pb-2">Division</th>
                        <th className="pb-2 text-center">Statistical</th>
                        <th className="pb-2 text-center">Technical</th>
                        <th className="pb-2 text-center">Gov & Security</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {heatmap.map((h, i) => (
                        <tr
                          key={i}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        >
                          <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200 pr-2">
                            {h.department}
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600">
                              {h.statistical}%
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                              {h.technical}%
                            </span>
                          </td>
                          <td className="py-2.5 text-center">
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-purple-50 dark:bg-purple-950 text-purple-600">
                              {h.digitalGov}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "learners" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FaUsers className="text-blue-600" />
                  <span>Cadre Officer Directory & Performance Monitor</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect detailed AI viva scores, transcripts, quiz
                  evaluations, and competency diagnostics per officer.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <FaSearch
                    className="absolute left-3.5 top-3 text-slate-400"
                    size={12}
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, cadre..."
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500 w-64"
                  />
                </div>

                <select
                  value={selectedCadreFilter}
                  onChange={(e) => setSelectedCadreFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-700 dark:text-slate-200 outline-hidden"
                >
                  {CADRE_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase text-slate-400">
                    <th className="p-4">Officer Name & Cadre</th>
                    <th className="p-4">Division / Office</th>
                    <th className="p-4 text-center">Competency Score</th>
                    <th className="p-4 text-center">Proficiency Level</th>
                    <th className="p-4 text-center">Training Hours</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLearners.map((l) => (
                    <tr
                      key={l._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {l.name ? l.name.charAt(0).toUpperCase() : "O"}
                          </div>
                          <div>
                            <span className="font-black text-slate-900 dark:text-white block">
                              {l.name}
                            </span>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">
                              {l.jobRole || "Statistical Officer"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {l.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                        {l.department || "MoSPI Headquarters"}
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-3 py-1 rounded-full font-black text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {l.overallCompetencyScore || 65}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                          {l.overallLevel || "Proficient"}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700 dark:text-slate-300">
                        {l.learningHours || 0} hrs
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleInspectUser(l)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <FaEye size={11} />
                          <span>Inspect Experience</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "materials" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FaBookOpen className="text-blue-600" />
                  <span>
                    Officer Study Material Requests & Direct Dispatch Hub
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fulfill study material requests submitted by statistical
                  officers or dispatch customized guidelines.
                </p>
              </div>

              <button
                onClick={() => setShowDispatchMaterialModal(true)}
                className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer w-fit"
              >
                <FaPlus size={11} />
                <span>Dispatch New Study Material</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase text-slate-400">
                    <th className="p-4">Requester</th>
                    <th className="p-4">Requested Topic & Domain</th>
                    <th className="p-4">Detailed Requirement</th>
                    <th className="p-4">Timeline & Dates</th>
                    <th className="p-4 text-center">Urgency</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {materialRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-slate-400"
                      >
                        No pending study material requests found.
                      </td>
                    </tr>
                  ) : (
                    materialRequests.map((req) => (
                      <tr
                        key={req._id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="p-4">
                          <span className="font-black text-slate-900 dark:text-white block">
                            {req.requesterName}
                          </span>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">
                            {req.requesterCadre}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {req.requesterEmail}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900 dark:text-white block text-xs">
                            {req.topic}
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-full inline-block mt-1">
                            {req.domain}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed">
                          {req.description}
                          {req.dispatchedMaterialTitle && (
                            <div className="mt-1 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] text-emerald-800 dark:text-emerald-300">
                              <strong>Dispatched:</strong>{" "}
                              {req.dispatchedMaterialTitle}
                            </div>
                          )}
                        </td>
                        <td className="p-4 space-y-1 text-[11px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                            <FaCalendarAlt size={10} className="text-blue-500 shrink-0" />
                            <span><strong>Req:</strong> {formatDateTime(req.createdAt)}</span>
                          </div>
                          {(req.completedAt || req.fulfilledAt || req.status === "fulfilled") && (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                              <FaCheckCircle size={10} className="shrink-0" />
                              <span><strong>Done:</strong> {formatDateTime(req.completedAt || req.fulfilledAt || req.updatedAt)}</span>
                            </div>
                          )}
                          {req.status === "rejected" && (
                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                              <FaClock size={10} className="shrink-0" />
                              <span><strong>Closed:</strong> {formatDateTime(req.resolvedAt || req.updatedAt)}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${req.urgency === "Critical"
                                ? "bg-rose-50 dark:bg-rose-950 text-rose-600 border border-rose-200 dark:border-rose-800"
                                : req.urgency === "High"
                                  ? "bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-800"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                              }`}
                          >
                            {req.urgency || "Normal"}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full font-black text-[10px] ${req.status === "fulfilled"
                                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800"
                                : req.status === "rejected"
                                  ? "bg-rose-50 dark:bg-rose-950 text-rose-600"
                                  : "bg-amber-50 dark:bg-amber-950 text-amber-600 border border-amber-200 dark:border-amber-800 animate-pulse"
                              }`}
                          >
                            {req.status === "fulfilled"
                              ? "Dispatched"
                              : req.status === "rejected"
                                ? "Closed"
                                : "Pending"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => {
                              setFulfillingRequest(req);
                              setFulfillForm({
                                adminResponseNote: req.adminResponseNote || "",
                                dispatchedMaterialTitle: req.topic,
                                dispatchedMaterialUrl:
                                   req.dispatchedMaterialUrl || "",
                                dispatchedMaterialText:
                                  req.dispatchedMaterialText || "",
                                file: null,
                              });
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <BsFillSendFill size={10} />
                            <span>
                              {req.status === "fulfilled"
                                ? "Re-Dispatch"
                                : "Fulfill & Send"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FaTasks className="text-blue-600" />
                  <span>Custom Case Study Dispatcher & Oversight Hub</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Set timer limits for case studies, monitor live countdowns, delete outdated case studies, and review officer submissions.
                </p>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setAssignmentSubTab("posted")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      assignmentSubTab === "posted"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600"
                    }`}
                  >
                    <FaClock size={12} />
                    <span>📋 Posted Case Studies & Timers</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-black">
                      {dispatchedAssignments.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAssignmentSubTab("submissions")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      assignmentSubTab === "submissions"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600"
                    }`}
                  >
                    <FaCheckCircle size={12} />
                    <span>📥 Officer Submissions Review</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-black">
                      {submissions.length}
                    </span>
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setTimerPreset("24h");
                  setCustomDueDateTime("");
                  setAssignmentForm((prev) => ({
                    ...prev,
                    dueDate: computeDueDateFromPreset("24h"),
                  }));
                  setShowDispatchAssignmentModal(true);
                }}
                className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer w-fit"
              >
                <FaPlus size={11} />
                <span>Compose New Case Study (With Timer)</span>
              </button>
            </div>

            {assignmentSubTab === "posted" ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase text-slate-400">
                        <th className="p-4">Case Study Details</th>
                        <th className="p-4">Target Cadre / Officer</th>
                        <th className="p-4">Posted Date & Time</th>
                        <th className="p-4">Timer Limit & Live Status</th>
                        <th className="p-4 text-center">Submissions</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {dispatchedAssignments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-12 text-center text-slate-400"
                          >
                            <FaTasks size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                            <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                              No custom case studies posted yet.
                            </p>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                              Click "Compose New Case Study" to post a practical drill with a custom countdown timer.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        dispatchedAssignments.map((asgn) => {
                          const deadlineInfo = getAssignmentDeadlineInfo(asgn.dueDate);
                          return (
                            <tr
                              key={asgn._id}
                              className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="p-4 max-w-xs">
                                <span className="font-black text-slate-900 dark:text-white block text-xs">
                                  {asgn.title}
                                </span>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded-full">
                                    {asgn.domain}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    • {asgn.targetCompetency}
                                  </span>
                                </div>
                              </td>

                              <td className="p-4">
                                <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 block w-fit">
                                  {asgn.assignedCadre || "All Cadres"}
                                </span>
                                {asgn.assignedToUserId && (
                                  <span className="text-[10px] text-slate-400 block mt-0.5">
                                    Direct: {asgn.assignedToUserId.name}
                                  </span>
                                )}
                              </td>

                              <td className="p-4">
                                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                                  <FaCalendarAlt size={11} className="text-slate-400" />
                                  <span>{formatDateTime(asgn.createdAt)}</span>
                                </div>
                              </td>

                              <td className="p-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`px-2.5 py-1 rounded-xl text-[10px] flex items-center gap-1.5 w-fit ${deadlineInfo.badgeClass}`}
                                    >
                                      {deadlineInfo.isExpired ? (
                                        <FaLock size={10} />
                                      ) : (
                                        <FaClock size={10} />
                                      )}
                                      <span>{deadlineInfo.label}</span>
                                    </span>
                                  </div>

                                  {asgn.dueDate && (
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                                      Deadline: {formatDateTime(asgn.dueDate)}
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td className="p-4 text-center">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                  {asgn.submissionsCount || 0} Submissions
                                </span>
                              </td>

                              <td className="p-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDispatchedAssignment(asgn._id, asgn.title)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-600 dark:text-rose-300 font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 shadow-2xs"
                                  title="Permanently delete this case study assignment"
                                >
                                  <FaTrash size={11} />
                                  <span>Delete Case</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase text-slate-400">
                      <th className="p-4">Officer Details</th>
                      <th className="p-4">Case Study Assignment</th>
                      <th className="p-4 text-center">AI Grade & Score</th>
                      <th className="p-4 text-center">Submission Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {submissions.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="p-8 text-center text-slate-400"
                        >
                          No officer case study submissions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      submissions.map((sub) => (
                        <tr
                          key={sub._id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="p-4">
                            <span className="font-black text-slate-900 dark:text-white block">
                              {sub.userId?.name || "Statistical Officer"}
                            </span>
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">
                              {sub.userId?.jobRole || "Statistical Cadre"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {sub.userId?.email}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-slate-900 dark:text-white block text-xs">
                              {sub.assignmentTitle}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {sub.targetCompetency || "Statistical Analysis"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
                              <span className="font-black text-emerald-700 dark:text-emerald-300 text-xs">
                                {sub.aiEvaluation?.overallScore || 85}%
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600">
                                (Grade {sub.aiEvaluation?.grade || "A"})
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 border border-blue-200 dark:border-blue-800">
                              Evaluated (Gemini AI)
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setViewingSubmission(sub)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <FaEye size={11} />
                              <span>Review Submission</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {activeTab === "communications" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-400/30 text-[11px] font-black uppercase tracking-wider mb-1.5">
                  <FaHeadset size={12} />
                  <span>Executive Live Helpdesk Operations</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Cadre Officer Live Communications Center</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct real-time 2-way messaging channel with statistical
                  officers across all ministries, NSSO field divisions, and DES
                  directorates.
                </p>
                <div className="flex flex-wrap items-center gap-2.5 mt-4">
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setCommSubTab("direct")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${commSubTab === "direct"
                          ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                      <FaComments size={12} />
                      <span>Direct Threads</span>
                      {totalUnreadMessages > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-black">
                          {totalUnreadMessages}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommSubTab("broadcasts")}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${commSubTab === "broadcasts"
                          ? "bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                        }`}
                    >
                      <FaBullhorn size={12} />
                      <span>Broadcasts ({broadcasts.length})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setShowBroadcastModal(true)}
                    className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <FaBullhorn size={12} />
                    <span>Broadcast Announcement</span>
                  </button>
                </div>
              </div>
            </div>

            {commSubTab === "broadcasts" ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs">
                  <div className="flex items-center gap-2.5">
                    <FaBullhorn className="text-amber-600 dark:text-amber-400 text-base" />
                    <span>
                      Broadcast announcements are delivered instantly across all logged-in officers' top dashboard banners and live notification widgets in real-time.
                    </span>
                  </div>
                  <button
                    onClick={() => setShowBroadcastModal(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs shrink-0 cursor-pointer"
                  >
                    + New Broadcast
                  </button>
                </div>

                {broadcasts.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                    <FaBullhorn size={36} className="mx-auto text-amber-500/40" />
                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                      No broadcast announcements published yet.
                    </p>
                    <p className="text-slate-500 max-w-sm mx-auto">
                      Send urgent syllabus updates, mock interview schedules, or circulars to all cadre officers in one click.
                    </p>
                    <button
                      onClick={() => setShowBroadcastModal(true)}
                      className="px-5 py-2 rounded-2xl bg-amber-600 text-white font-bold text-xs shadow-md cursor-pointer hover:bg-amber-700"
                    >
                      Broadcast Your First Announcement
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {broadcasts.map((b, idx) => (
                      <div
                        key={b._id || idx}
                        className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 font-black text-[10px] uppercase tracking-wider border border-amber-500/30 inline-block">
                              Official Broadcast
                            </span>
                            <h4 className="font-black text-sm text-slate-900 dark:text-white pt-1">
                              {b.senderName || "NSSTA Secretariat"}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-bold text-slate-400">
                              {new Date(b.createdAt).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteBroadcast(b._id)}
                              className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition-all cursor-pointer border border-rose-200 dark:border-rose-900/60 shadow-2xs"
                              title="Delete Broadcast Announcement"
                            >
                              <FaTrash size={11} />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                          {b.message}
                        </p>

                        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="font-semibold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Target: All Registered Cadres
                          </span>
                          <span>Delivered Real-Time</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-0 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40 shadow-sm h-[640px]">
                <div className="lg:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full min-h-0 bg-white dark:bg-slate-900">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 shrink-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <FaComments className="text-blue-600" />
                        <span>Officer Threads ({filteredConversations.length})</span>
                      </span>
                      {totalUnreadMessages > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs animate-pulse">
                          {totalUnreadMessages} Unread
                        </span>
                      )}
                    </div>

                    {learners.length > 0 && (
                      <select
                        value={selectedOfficer?.officerId || ""}
                        onChange={(e) => {
                          const chosen = learners.find((l) => l._id === e.target.value);
                          if (chosen) {
                            setSelectedOfficer({
                              officerId: chosen._id,
                              officerName: chosen.name,
                              officerEmail: chosen.email,
                              officerCadre: chosen.jobRole || "Statistical Cadre",
                              officerDepartment: chosen.department || "MoSPI Headquarters",
                              lastMessage: "",
                              lastMessageAt: new Date(),
                              lastSenderRole: "learner",
                              unreadCount: 0,
                            });
                            setConversations((prev) =>
                              prev.map((c) =>
                                c.officerId === chosen._id
                                  ? { ...c, unreadCount: 0 }
                                  : c,
                              ),
                            );
                          }
                        }}
                        className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500 font-semibold"
                      >
                        <option value="" disabled>-- Select Officer to Message --</option>
                        {learners.map((l) => (
                          <option key={l._id} value={l._id}>
                            👤 {l.name} ({l.jobRole || "Statistical Officer"})
                          </option>
                        ))}
                      </select>
                    )}

                    <div className="relative">
                      <FaSearch
                        className="absolute left-3.5 top-3 text-slate-400"
                        size={11}
                      />
                      <input
                        type="text"
                        value={chatSearch}
                        onChange={(e) => setChatSearch(e.target.value)}
                        placeholder="Search by name or cadre..."
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredConversations.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs space-y-2">
                        <FaComments
                          size={28}
                          className="mx-auto opacity-30 text-blue-500"
                        />
                        <p className="font-bold text-slate-600 dark:text-slate-300">
                          No active conversation threads.
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Select an officer from the dropdown above to start messaging.
                        </p>
                      </div>
                    ) : (
                      filteredConversations.map((conv) => {
                        const isSelected =
                          selectedOfficer?.officerId === conv.officerId;
                        return (
                          <button
                            key={conv.officerId}
                            onClick={() => {
                              setSelectedOfficer({ ...conv, unreadCount: 0 });
                              setConversations((prev) =>
                                prev.map((c) =>
                                  c.officerId === conv.officerId
                                    ? { ...c, unreadCount: 0 }
                                    : c,
                                ),
                              );
                            }}
                            className={`w-full p-4 text-left transition flex items-start justify-between gap-3 cursor-pointer ${isSelected
                                ? "bg-blue-50/90 dark:bg-blue-950/50 border-l-4 border-blue-600 shadow-inner"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                              }`}
                          >
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                                  {conv.officerName
                                    ? conv.officerName.charAt(0).toUpperCase()
                                    : "O"}
                                </div>
                                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                              </div>

                              <div className="min-w-0">
                                <span className="font-black text-slate-900 dark:text-white text-xs block truncate">
                                  {conv.officerName}
                                </span>
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold block truncate">
                                  {conv.officerCadre}
                                </span>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                                  {conv.lastSenderRole === "admin" ? "You: " : ""}
                                  {conv.lastMessage}
                                </p>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-[10px] font-semibold text-slate-400 block">
                                {formatDateTime(conv.lastMessageAt)}
                              </span>
                              {conv.unreadCount > 0 && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white inline-block mt-1.5 shadow-xs animate-bounce">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="lg:col-span-8 flex flex-col h-full min-h-0 bg-slate-50/40 dark:bg-slate-950/40 relative overflow-hidden">
                  {selectedOfficer ? (
                    <>
                      <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                            {selectedOfficer.officerName ? selectedOfficer.officerName.charAt(0).toUpperCase() : "O"}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-sm text-slate-900 dark:text-white">
                                {selectedOfficer.officerName}
                              </h3>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                {selectedOfficer.officerCadre}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {selectedOfficer.officerDepartment} • {selectedOfficer.officerEmail}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                            <BsCircleFill
                              size={6}
                              className="text-emerald-500 animate-ping"
                            />
                            <span>Connected in Real-Time</span>
                          </span>
                        </div>
                      </div>

                      <div ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs bg-slate-50/50 dark:bg-slate-950/50">
                        {conversationMessages.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center p-8 space-y-2">
                            <FaComments
                              size={36}
                              className="opacity-30 text-blue-500"
                            />
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                              No messages in this thread yet.
                            </p>
                            <p className="text-[11px] text-slate-400 max-w-xs">
                              Type a response below to initiate direct real-time
                              assistance with {selectedOfficer.officerName}.
                            </p>
                          </div>
                        ) : (
                          conversationMessages.map((msg, index) => {
                            const isAdmin = msg.senderRole === "admin";
                            return (
                              <div
                                key={msg._id || index}
                                className={`flex flex-col ${isAdmin ? "items-end" : "items-start"}`}
                              >
                                <div className="flex items-center gap-1.5 px-1 mb-1">
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {isAdmin
                                      ? "NSSTA Secretariat & Faculty"
                                      : msg.senderName}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {formatDateTime(msg.createdAt)}
                                  </span>
                                </div>

                                <div
                                  className={`max-w-[75%] p-4 rounded-3xl text-xs leading-relaxed space-y-2 shadow-xs ${isAdmin
                                      ? "bg-gradient-to-tr from-blue-700 to-indigo-700 text-white rounded-br-xs"
                                      : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700"
                                    }`}
                                >
                                  <p className="whitespace-pre-wrap">
                                    {msg.message}
                                  </p>

                                  {msg.attachmentData && (
                                    <div className="pt-1">
                                      {msg.attachmentData.startsWith(
                                        "data:image/",
                                      ) ? (
                                        <img
                                          src={msg.attachmentData}
                                          alt={msg.attachmentName || "Attachment"}
                                          className="max-h-48 rounded-xl object-contain border border-slate-200 dark:border-slate-700"
                                        />
                                      ) : (
                                        <a
                                          href={msg.attachmentData}
                                          download={msg.attachmentName || "Attachment"}
                                          className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-semibold text-[11px]"
                                        >
                                          <FaPaperclip size={12} />
                                          <span className="truncate max-w-[200px]">
                                            {msg.attachmentName || "Download Attachment"}
                                          </span>
                                        </a>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {adminReplyFile && (
                        <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 shrink-0">
                          <span className="truncate font-semibold text-[11px]">
                            📎 {adminReplyFile.name} ({Math.round(adminReplyFile.size / 1024)} KB)
                          </span>
                          <button
                            onClick={() => setAdminReplyFile(null)}
                            className="text-slate-400 hover:text-rose-500 font-bold ml-2 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      <div className="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto shrink-0">
                        <span className="text-[10px] font-black uppercase text-slate-400 shrink-0 flex items-center pr-1">
                          ⚡ Quick Replies:
                        </span>
                        {QUICK_REPLIES.map((qr, idx) => (
                          <button
                            key={idx}
                            onClick={() => setAdminReplyText(qr)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-[10px] font-bold transition shrink-0 cursor-pointer border border-transparent hover:border-blue-300"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>

                      <form
                        onSubmit={handleAdminReplySubmit}
                        className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0 z-10"
                      >
                        <label
                          htmlFor="admin-chat-file"
                          className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer transition flex items-center justify-center shrink-0"
                          title="Attach File/Image"
                        >
                          <FaPaperclip size={13} />
                          <input
                            id="admin-chat-file"
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
                            onChange={(e) =>
                              setAdminReplyFile(e.target.files[0] || null)
                            }
                            className="hidden"
                          />
                        </label>

                        <input
                          type="text"
                          value={adminReplyText}
                          onChange={(e) => setAdminReplyText(e.target.value)}
                          placeholder={`Reply directly to ${selectedOfficer.officerName}...`}
                          className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                        />

                        <button
                          type="submit"
                          disabled={
                            adminReplyLoading ||
                            (!adminReplyText.trim() && !adminReplyFile)
                          }
                          className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer disabled:opacity-40 shadow-md shrink-0 flex items-center justify-center"
                        >
                          {adminReplyLoading ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <BsFillSendFill size={13} />
                          )}
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs space-y-3 p-8">
                      <FaComments
                        size={36}
                        className="opacity-30 text-blue-500"
                      />
                      <p className="font-bold text-slate-700 dark:text-slate-300">
                        Select an officer thread or choose from directory above to start messaging.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {inspectingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-md">
                  {inspectingUser.name
                    ? inspectingUser.name.charAt(0).toUpperCase()
                    : "O"}
                </div>
                <div>
                  <h3 className="text-lg font-black">{inspectingUser.name}</h3>
                  <p className="text-xs text-blue-300 font-semibold">
                    {inspectingUser.jobRole || "Statistical Officer"} •{" "}
                    {inspectingUser.department || "MoSPI Headquarters"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setInspectingUser(null);
                  setUserDetailedData(null);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {inspectLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-400">
                  Loading Officer Experience History...
                </span>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                <div className="grid sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60">
                    <span className="text-[10px] font-bold text-blue-600 block">
                      Overall Score
                    </span>
                    <span className="text-xl font-black text-blue-900 dark:text-blue-200">
                      {userDetailedData?.learner?.overallCompetencyScore || 65}%
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60">
                    <span className="text-[10px] font-bold text-emerald-600 block">
                      Proficiency Level
                    </span>
                    <span className="text-xl font-black text-emerald-900 dark:text-emerald-200">
                      {userDetailedData?.learner?.overallLevel || "Proficient"}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60">
                    <span className="text-[10px] font-bold text-indigo-600 block">
                      Training Hours
                    </span>
                    <span className="text-xl font-black text-indigo-900 dark:text-indigo-200">
                      {userDetailedData?.learner?.learningHours || 0} hrs
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60">
                    <span className="text-[10px] font-bold text-purple-600 block">
                      Quizzes Done
                    </span>
                    <span className="text-xl font-black text-purple-900 dark:text-purple-200">
                      {userDetailedData?.learner?.quizzesCompleted ||
                        userDetailedData?.quizAttempts?.length ||
                        0}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => setInspectTab("competencies")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${inspectTab === "competencies"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    <FaBrain size={12} />
                    <span>
                      Competencies & Skill Gaps (
                      {userDetailedData?.learner?.competencies?.length || 0})
                    </span>
                  </button>
                  <button
                    onClick={() => setInspectTab("interviews")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${inspectTab === "interviews"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    AI Viva Mock Interviews (
                    {userDetailedData?.interviews?.length || 0})
                  </button>
                  <button
                    onClick={() => setInspectTab("quizzes")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${inspectTab === "quizzes"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    Quiz Evaluations (
                    {userDetailedData?.quizAttempts?.length || 0})
                  </button>
                  <button
                    onClick={() => setInspectTab("assignments")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${inspectTab === "assignments"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    Case Study Submissions (
                    {userDetailedData?.submissions?.length || 0})
                  </button>
                  <button
                    onClick={() => setInspectTab("requests")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${inspectTab === "requests"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                  >
                    Material Requests (
                    {userDetailedData?.materialRequests?.length || 0})
                  </button>
                </div>

                {inspectTab === "competencies" && (
                  <div className="space-y-6">
                    {/* Radar & Domain Breakdown */}
                    <div className="grid md:grid-cols-12 gap-4">
                      <div className="md:col-span-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center justify-center">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                          4-Domain Competency Radar
                        </span>
                        <div className="h-56 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              data={[
                                {
                                  domain: "Statistical",
                                  score: Math.round(
                                    (userDetailedData?.learner?.competencies || [])
                                      .filter((c) => (c.domain || "").toLowerCase().includes("stat"))
                                      .reduce((acc, c) => acc + (Number(c.score) || 60), 0) /
                                    Math.max(1, (userDetailedData?.learner?.competencies || []).filter((c) => (c.domain || "").toLowerCase().includes("stat")).length)
                                  ) || 65,
                                  fullMark: 100,
                                },
                                {
                                  domain: "Technical",
                                  score: Math.round(
                                    (userDetailedData?.learner?.competencies || [])
                                      .filter((c) => (c.domain || "").toLowerCase().includes("tech"))
                                      .reduce((acc, c) => acc + (Number(c.score) || 60), 0) /
                                    Math.max(1, (userDetailedData?.learner?.competencies || []).filter((c) => (c.domain || "").toLowerCase().includes("tech")).length)
                                  ) || 65,
                                  fullMark: 100,
                                },
                                {
                                  domain: "Governance",
                                  score: Math.round(
                                    (userDetailedData?.learner?.competencies || [])
                                      .filter((c) => (c.domain || "").toLowerCase().includes("gov"))
                                      .reduce((acc, c) => acc + (Number(c.score) || 60), 0) /
                                    Math.max(1, (userDetailedData?.learner?.competencies || []).filter((c) => (c.domain || "").toLowerCase().includes("gov")).length)
                                  ) || 65,
                                  fullMark: 100,
                                },
                                {
                                  domain: "Managerial",
                                  score: Math.round(
                                    (userDetailedData?.learner?.competencies || [])
                                      .filter((c) => (c.domain || "").toLowerCase().includes("manag") || (c.domain || "").toLowerCase().includes("behav"))
                                      .reduce((acc, c) => acc + (Number(c.score) || 60), 0) /
                                    Math.max(1, (userDetailedData?.learner?.competencies || []).filter((c) => (c.domain || "").toLowerCase().includes("manag") || (c.domain || "").toLowerCase().includes("behav")).length)
                                  ) || 65,
                                  fullMark: 100,
                                },
                              ]}
                            >
                              <PolarGrid stroke="#94a3b8" opacity={0.3} />
                              <PolarAngleAxis
                                dataKey="domain"
                                tick={{ fontSize: 10, fill: "#64748b", fontWeight: 700 }}
                              />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar
                                name="Competency Score"
                                dataKey="score"
                                stroke="#2563eb"
                                fill="#3b82f6"
                                fillOpacity={0.5}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="md:col-span-7 grid grid-cols-2 gap-3 content-center">
                        <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/60">
                          <span className="text-[10px] font-bold text-blue-600 block">Statistical Domain</span>
                          <span className="text-lg font-black text-blue-900 dark:text-blue-200">
                            {Math.round(
                              (userDetailedData?.learner?.competencies || [])
                                .filter((c) => (c.domain || "").toLowerCase().includes("stat"))
                                .reduce((acc, c) => acc + (Number(c.score) || 60), 0) /
                              Math.max(1, (userDetailedData?.learner?.competencies || []).filter((c) => (c.domain || "").toLowerCase().includes("stat")).length)
                            ) || 65}%
                          </span>
                          <span className="text-[10px] text-slate-500 block">Sampling, SNA & Indices</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60">
                          <span className="text-[10px] font-bold text-emerald-600 block">Technical Domain</span>
                          <span className="text-lg font-black text-emerald-900 dark:text-emerald-200">
                            {Math.round(
                              (userDetailedData?.learner?.competencies || [])
                                .filter((c) => (c.domain || "").toLowerCase().includes("tech"))
                                .reduce((acc, c) => acc + (Number(c.score) || 60), 0) /
                              Math.max(1, (userDetailedData?.learner?.competencies || []).filter((c) => (c.domain || "").toLowerCase().includes("tech")).length)
                            ) || 65}%
                          </span>
                          <span className="text-[10px] text-slate-500 block">Processing & Microdata</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-900/60">
                          <span className="text-[10px] font-bold text-purple-600 block">Governance & Privacy</span>
                          <span className="text-lg font-black text-purple-900 dark:text-purple-200">
                            {Math.round(
                              (userDetailedData?.learner?.competencies || [])
                                .filter((c) => (c.domain || "").toLowerCase().includes("gov"))
                                .reduce((acc, c) => acc + (Number(c.score) || 60), 0) /
                              Math.max(1, (userDetailedData?.learner?.competencies || []).filter((c) => (c.domain || "").toLowerCase().includes("gov")).length)
                            ) || 65}%
                          </span>
                          <span className="text-[10px] text-slate-500 block">DPDP Act & Security</span>
                        </div>

                        <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/60">
                          <span className="text-[10px] font-bold text-amber-600 block">Managerial & Policy</span>
                          <span className="text-lg font-black text-amber-900 dark:text-amber-200">
                            {Math.round(
                              (userDetailedData?.learner?.competencies || [])
                                .filter((c) => (c.domain || "").toLowerCase().includes("manag") || (c.domain || "").toLowerCase().includes("behav"))
                                .reduce((acc, c) => acc + (Number(c.score) || 60), 0) /
                              Math.max(1, (userDetailedData?.learner?.competencies || []).filter((c) => (c.domain || "").toLowerCase().includes("manag") || (c.domain || "").toLowerCase().includes("behav")).length)
                            ) || 65}%
                          </span>
                          <span className="text-[10px] text-slate-500 block">Leadership & Briefs</span>
                        </div>
                      </div>
                    </div>

                    {/* Competency Matrix Table */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                        <FaSlidersH className="text-blue-600" />
                        <span>Assessed Competency Matrix</span>
                      </h4>
                      {(!userDetailedData?.learner?.competencies || userDetailedData.learner.competencies.length === 0) ? (
                        <p className="text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          No competency assessment performed by this officer yet.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-[11px]">
                            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold">
                              <tr>
                                <th className="p-2.5 rounded-l-xl">Competency Name</th>
                                <th className="p-2.5">Domain</th>
                                <th className="p-2.5 text-center">Score</th>
                                <th className="p-2.5 text-center">Proficiency</th>
                                <th className="p-2.5 rounded-r-xl">Assessment Source</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {userDetailedData.learner.competencies.map((c, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                                  <td className="p-2.5 font-bold text-slate-800 dark:text-slate-200">
                                    {c.competencyName}
                                  </td>
                                  <td className="p-2.5">
                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-600 text-[10px] font-bold">
                                      {c.domain || "Statistical"}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-center font-black text-blue-700 dark:text-blue-400">
                                    {c.score}%
                                  </td>
                                  <td className="p-2.5 text-center font-semibold text-slate-600 dark:text-slate-300">
                                    {c.level || "Intermediate"}
                                  </td>
                                  <td className="p-2.5 text-slate-500 text-[10px]">
                                    {c.source || "assessment-derived"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Skill Gaps Section */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                        <FaExclamationTriangle className="text-amber-500" />
                        <span>Identified Skill Gaps & Deficits ({userDetailedData?.learner?.skillGaps?.length || 0})</span>
                      </h4>
                      {(!userDetailedData?.learner?.skillGaps || userDetailedData.learner.skillGaps.length === 0) ? (
                        <p className="text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          No critical skill gaps identified.
                        </p>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-3">
                          {userDetailedData.learner.skillGaps.map((g, i) => (
                            <div
                              key={i}
                              className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/50 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white text-xs">
                                  {g.competencyName}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                    g.priority === "High"
                                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                      : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                  }`}
                                >
                                  {g.priority || "Medium"} Priority
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                                Current Level: <strong>{g.currentLevel}</strong> ➔ Target:{" "}
                                <strong>{g.requiredLevel}</strong>
                              </p>
                              {g.recommendedAction && (
                                <p className="text-[10px] text-blue-700 dark:text-blue-300 font-medium">
                                  <strong>Action:</strong> {g.recommendedAction}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Learning Pathway */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-xs">
                        <FaGraduationCap className="text-emerald-600" />
                        <span>Tailored AI Learning Pathway ({userDetailedData?.learner?.learningPath?.length || 0} Modules)</span>
                      </h4>
                      {(!userDetailedData?.learner?.learningPath || userDetailedData.learner.learningPath.length === 0) ? (
                        <p className="text-slate-400 text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          No personalized learning pathway generated yet.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {userDetailedData.learner.learningPath.map((step, i) => (
                            <div
                              key={i}
                              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                                  {step.step || i + 1}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-900 dark:text-white text-xs block">
                                    {step.title}
                                  </span>
                                  <span className="text-[10px] text-slate-400">
                                    Provider: {step.provider || "iGOT Karmayogi"} • Duration: {step.duration || "12 Hours"}
                                  </span>
                                </div>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  step.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                    : step.status === "in-progress"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                      : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                                }`}
                              >
                                {step.status || "not-started"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {inspectTab === "interviews" && (
                  <div className="space-y-4">
                    {userDetailedData?.interviews?.length === 0 ? (
                      <p className="text-slate-400 text-center py-6">
                        No viva mock interviews recorded yet.
                      </p>
                    ) : (
                      userDetailedData?.interviews?.map((iv, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-black text-slate-900 dark:text-white text-xs block">
                                {iv.role || "Official Cadre Viva"}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Mode: {iv.mode} • Experience: {iv.experience}
                              </span>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-black text-xs">
                              Score: {iv.finalScore || 80}%
                            </span>
                          </div>

                          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                            {iv.question?.map((q, qIdx) => (
                              <div
                                key={qIdx}
                                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 space-y-1"
                              >
                                <p className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                                  Q{qIdx + 1}: {q.question}
                                </p>
                                {q.answer && (
                                  <p className="text-slate-600 dark:text-slate-400 text-[10px]">
                                    <strong>Officer Response:</strong>{" "}
                                    {q.answer}
                                  </p>
                                )}
                                {q.feedback && (
                                  <p className="text-emerald-700 dark:text-emerald-400 text-[10px]">
                                    <strong>AI Feedback:</strong> {q.feedback}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Quizzes */}
                {inspectTab === "quizzes" && (
                  <div className="space-y-3">
                    {userDetailedData?.quizAttempts?.length === 0 ? (
                      <p className="text-slate-400 text-center py-6">
                        No quiz attempts recorded yet.
                      </p>
                    ) : (
                      userDetailedData?.quizAttempts?.map((qa, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-xs">
                              {qa.quizTitle ||
                                qa.topic ||
                                "Statistical Competency Quiz"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Domain: {qa.domain} • Correct: {qa.correctCount}/
                              {qa.totalQuestions} • Time: {qa.timeTakenSeconds}s
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-emerald-600 text-sm block">
                              {qa.score}%
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {qa.passed ? "Passed" : "Needs Review"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Assignments */}
                {inspectTab === "assignments" && (
                  <div className="space-y-3">
                    {userDetailedData?.submissions?.length === 0 ? (
                      <p className="text-slate-400 text-center py-6">
                        No case study assignments submitted yet.
                      </p>
                    ) : (
                      userDetailedData?.submissions?.map((sub, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white text-xs">
                              {sub.assignmentTitle}
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                              Score: {sub.aiEvaluation?.overallScore}% (Grade{" "}
                              {sub.aiEvaluation?.grade})
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed line-clamp-2">
                            {sub.submissionText}
                          </p>
                          {sub.aiEvaluation?.detailedFeedback && (
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[10px] text-blue-900 dark:text-blue-300">
                              <strong>AI Feedback:</strong>{" "}
                              {sub.aiEvaluation.detailedFeedback}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Tab: Requests */}
                {inspectTab === "requests" && (
                  <div className="space-y-3">
                    {userDetailedData?.materialRequests?.length === 0 ? (
                      <p className="text-slate-400 text-center py-6">
                        No study material requests submitted by this officer.
                      </p>
                    ) : (
                      userDetailedData?.materialRequests?.map((mr, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block text-xs">
                              {mr.topic}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {mr.description}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${mr.status === "fulfilled"
                                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-600"
                                : "bg-amber-50 dark:bg-amber-950 text-amber-600"
                              }`}
                          >
                            {mr.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {fulfillingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Fulfill Study Material Request
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  Officer: {fulfillingRequest.requesterName} (
                  {fulfillingRequest.requesterCadre})
                </p>
              </div>
              <button
                onClick={() => setFulfillingRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-1">
              <span className="font-bold block">
                Requested Area: {fulfillingRequest.topic}
              </span>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                {fulfillingRequest.description}
              </p>
            </div>

            <form
              onSubmit={handleFulfillRequestSubmit}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Dispatched Material Title
                </label>
                <input
                  type="text"
                  required
                  value={fulfillForm.dispatchedMaterialTitle}
                  onChange={(e) =>
                    setFulfillForm({
                      ...fulfillForm,
                      dispatchedMaterialTitle: e.target.value,
                    })
                  }
                  placeholder="e.g. Official NSS Survey Sampling & Imputation Guidelines (MoSPI)"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Material Document URL or Reference Link (Optional)
                </label>
                <input
                  type="url"
                  value={fulfillForm.dispatchedMaterialUrl}
                  onChange={(e) =>
                    setFulfillForm({
                      ...fulfillForm,
                      dispatchedMaterialUrl: e.target.value,
                    })
                  }
                  placeholder="https://mospi.gov.in/sites/default/files/..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Attach Official File or Image (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
                  onChange={(e) =>
                    setFulfillForm({
                      ...fulfillForm,
                      file: e.target.files[0] || null,
                    })
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Key Statistical Guidelines & Learning Notes
                </label>
                <textarea
                  rows={4}
                  value={fulfillForm.dispatchedMaterialText}
                  onChange={(e) =>
                    setFulfillForm({
                      ...fulfillForm,
                      dispatchedMaterialText: e.target.value,
                    })
                  }
                  placeholder="Insert key methodological rules, formulas, concepts, or instructions for the officer..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Official Secretariat Note
                </label>
                <input
                  type="text"
                  value={fulfillForm.adminResponseNote}
                  onChange={(e) =>
                    setFulfillForm({
                      ...fulfillForm,
                      adminResponseNote: e.target.value,
                    })
                  }
                  placeholder="e.g. Dispatched by NSSTA Faculty for Cadre Promotion Drill."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFulfillingRequest(null)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fulfillSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <BsFillSendFill size={11} />
                  <span>
                    {fulfillSubmitting
                      ? "Dispatching..."
                      : "Dispatch to Officer"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDispatchMaterialModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Direct Study Material Dispatch
                </h3>
                <p className="text-xs text-slate-500">
                  Broadcast or dispatch official statistical training materials
                  to officers.
                </p>
              </div>
              <button
                onClick={() => setShowDispatchMaterialModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleDirectMaterialDispatch}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Material Document Title *
                </label>
                <input
                  type="text"
                  required
                  value={dispatchMaterialForm.title}
                  onChange={(e) =>
                    setDispatchMaterialForm({
                      ...dispatchMaterialForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. National Accounts Statistics (NAS) Sources & Methods 2024"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Domain
                  </label>
                  <select
                    value={dispatchMaterialForm.domain}
                    onChange={(e) =>
                      setDispatchMaterialForm({
                        ...dispatchMaterialForm,
                        domain: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  >
                    {DOMAIN_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Target Cadre
                  </label>
                  <select
                    value={dispatchMaterialForm.targetCadre}
                    onChange={(e) =>
                      setDispatchMaterialForm({
                        ...dispatchMaterialForm,
                        targetCadre: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  >
                    {CADRE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Material Summary / Learning Objectives *
                </label>
                <textarea
                  rows={3}
                  required
                  value={dispatchMaterialForm.description}
                  onChange={(e) =>
                    setDispatchMaterialForm({
                      ...dispatchMaterialForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Overview of this study material and how it aligns with national statistical frameworks..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Content / Reference Text
                </label>
                <textarea
                  rows={4}
                  value={dispatchMaterialForm.materialText}
                  onChange={(e) =>
                    setDispatchMaterialForm({
                      ...dispatchMaterialForm,
                      materialText: e.target.value,
                    })
                  }
                  placeholder="Full text / guidelines for MCQ generation and self-study..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Attach Official File or Image (Optional)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
                  onChange={(e) =>
                    setDispatchMaterialForm({
                      ...dispatchMaterialForm,
                      file: e.target.files[0] || null,
                    })
                  }
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-xs"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchMaterialModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dispatchMaterialLoading}
                  className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaFileUpload size={11} />
                  <span>
                    {dispatchMaterialLoading
                      ? "Dispatching..."
                      : "Dispatch & Archive"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDispatchAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FaTasks className="text-emerald-600" />
                  <span>Compose & Dispatch Case Study with Timer Limit</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Target analytical drills directly to officers with an automatic expiration timer.
                </p>
              </div>
              <button
                onClick={() => setShowDispatchAssignmentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleDispatchAssignmentSubmit}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Case Study Title *
                </label>
                <input
                  type="text"
                  required
                  value={assignmentForm.title}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Quarterly CPI Price Deflation & Double-Deflation GVA Reconciliation"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Competency Domain
                  </label>
                  <select
                    value={assignmentForm.domain}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        domain: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  >
                    {DOMAIN_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Target Competency *
                  </label>
                  <input
                    type="text"
                    required
                    value={assignmentForm.targetCompetency}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        targetCompetency: e.target.value,
                      })
                    }
                    placeholder="e.g. Price Statistics & Index Compilation"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Target Cadre
                  </label>
                  <select
                    value={assignmentForm.assignedCadre}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        assignedCadre: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  >
                    {CADRE_OPTIONS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Difficulty Level
                  </label>
                  <select
                    value={assignmentForm.difficulty}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        difficulty: e.target.value,
                      })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Est. Hours
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={assignmentForm.estimatedHours}
                    onChange={(e) =>
                      setAssignmentForm({
                        ...assignmentForm,
                        estimatedHours: Number(e.target.value),
                      })
                    }
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden"
                  />
                </div>
              </div>

              {/* TIMER LIMIT / DUE DATE PICKER */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5 text-xs">
                    <FaClock className="text-amber-600 dark:text-amber-400" />
                    <span>Submission Timer Limit & Expiration Rule *</span>
                  </label>
                  <span className="text-[10px] text-amber-700 dark:text-amber-300 font-semibold">
                    Submissions close automatically
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: "30m", label: "30 Mins" },
                    { key: "1h", label: "1 Hour" },
                    { key: "2h", label: "2 Hours" },
                    { key: "6h", label: "6 Hours" },
                    { key: "12h", label: "12 Hours" },
                    { key: "24h", label: "24 Hours (1 Day)" },
                    { key: "3d", label: "3 Days" },
                    { key: "7d", label: "7 Days" },
                    { key: "custom", label: "Custom Date/Time" },
                    { key: "none", label: "No Limit" },
                  ].map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => {
                        setTimerPreset(p.key);
                        if (p.key !== "custom") {
                          const computed = computeDueDateFromPreset(p.key);
                          setAssignmentForm((prev) => ({
                            ...prev,
                            dueDate: computed,
                          }));
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                        timerPreset === p.key
                          ? "bg-amber-600 text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 border border-amber-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-amber-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {timerPreset === "custom" && (
                  <div className="pt-2">
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      Select Exact Expiration Date & Time:
                    </label>
                    <input
                      type="datetime-local"
                      required={timerPreset === "custom"}
                      value={customDueDateTime}
                      onChange={(e) => {
                        setCustomDueDateTime(e.target.value);
                        if (e.target.value) {
                          setAssignmentForm((prev) => ({
                            ...prev,
                            dueDate: new Date(e.target.value).toISOString(),
                          }));
                        }
                      }}
                      className="w-full p-2.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-amber-500 text-xs"
                    />
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-amber-100/70 dark:bg-amber-900/40 text-[11px] text-amber-950 dark:text-amber-200 flex items-center justify-between">
                  <span className="font-semibold">
                    {assignmentForm.dueDate
                      ? `⏳ Submissions Deadline: ${formatDateTime(assignmentForm.dueDate)}`
                      : "⚪ Open Indefinitely (No timer limit applied)"}
                  </span>
                  {assignmentForm.dueDate && (
                    <span className="font-black text-amber-800 dark:text-amber-300">
                      {getAssignmentDeadlineInfo(assignmentForm.dueDate).countdown}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Institutional Scenario & Problem Statement *
                </label>
                <textarea
                  rows={4}
                  required
                  value={assignmentForm.scenario}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      scenario: e.target.value,
                    })
                  }
                  placeholder="Describe the operational challenge, field data anomalies, or National Accounts revision scenario..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Execution Instructions (1 per line)
                </label>
                <textarea
                  rows={3}
                  value={assignmentForm.instructions}
                  onChange={(e) =>
                    setAssignmentForm({
                      ...assignmentForm,
                      instructions: e.target.value,
                    })
                  }
                  placeholder="1. Instruction one&#10;2. Instruction two&#10;3. Instruction three"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDispatchAssignmentModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignmentSubmitting}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaTasks size={11} />
                  <span>
                    {assignmentSubmitting
                      ? "Assigning with Timer..."
                      : "Post Case Study (With Timer)"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Case Study Submission Review
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  Officer: {viewingSubmission.userId?.name} (
                  {viewingSubmission.userId?.jobRole})
                </p>
              </div>
              <button
                onClick={() => setViewingSubmission(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Case Study
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {viewingSubmission.assignmentTitle}
                </h4>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Officer Submitted Solution
                </span>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 whitespace-pre-wrap leading-relaxed text-slate-800 dark:text-slate-200">
                  {viewingSubmission.submissionText}
                </div>
              </div>

              {/* AI Evaluation */}
              {viewingSubmission.aiEvaluation && (
                <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-emerald-900 dark:text-emerald-300 text-sm">
                      SankhyaIQ™ AI Neural Evaluation
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs">
                      {viewingSubmission.aiEvaluation.overallScore}% • Grade{" "}
                      {viewingSubmission.aiEvaluation.grade}
                    </span>
                  </div>

                  <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed text-xs">
                    {viewingSubmission.aiEvaluation.detailedFeedback}
                  </p>

                  {viewingSubmission.aiEvaluation.rubricScores?.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60">
                      {viewingSubmission.aiEvaluation.rubricScores.map(
                        (r, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between text-[11px]"
                          >
                            <span className="text-slate-700 dark:text-slate-300">
                              {r.criterion}
                            </span>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {r.score} / {r.maxScore || 25}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Broadcast Academy Announcement
                </h3>
                <p className="text-xs text-slate-500">
                  Broadcast real-time training alerts and updates to all
                  registered officers.
                </p>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleBroadcastSubmit}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={broadcastForm.title}
                  onChange={(e) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Schedule for 80th NSS Round Training & Competency Viva"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Announcement Message Body *
                </label>
                <textarea
                  rows={4}
                  required
                  value={broadcastForm.message}
                  onChange={(e) =>
                    setBroadcastForm({
                      ...broadcastForm,
                      message: e.target.value,
                    })
                  }
                  placeholder="Insert announcement text to be broadcasted to all cadre officers in real time..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcastLoading}
                  className="flex-1 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <FaBullhorn size={11} />
                  <span>
                    {broadcastLoading ? "Broadcasting..." : "Broadcast to All"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AdminDashboard;
