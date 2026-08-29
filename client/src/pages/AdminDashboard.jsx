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
  FaDownload,
  FaComments,
  FaPaperclip,
  FaBullhorn,
  FaHeadset,
  FaCheckDouble,
  FaFilePdf,
} from "react-icons/fa";
import {
  BsShieldCheck,
  BsGrid3X3GapFill,
  BsFillSendFill,
  BsCircleFill,
} from "react-icons/bs";

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

  // Inspector Modal state
  const [inspectingUser, setInspectingUser] = useState(null);
  const [userDetailedData, setUserDetailedData] = useState(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [inspectTab, setInspectTab] = useState("interviews");

  // Material Fulfill Modal state
  const [fulfillingRequest, setFulfillingRequest] = useState(null);
  const [fulfillForm, setFulfillForm] = useState({
    adminResponseNote: "",
    dispatchedMaterialTitle: "",
    dispatchedMaterialUrl: "",
    dispatchedMaterialText: "",
    file: null,
  });
  const [fulfillSubmitting, setFulfillSubmitting] = useState(false);

  // Direct Material Dispatch Modal state
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

  // Assignment Dispatch Modal state
  const [showDispatchAssignmentModal, setShowDispatchAssignmentModal] =
    useState(false);
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
    dueDate: "",
    adminNotes: "",
  });
  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false);

  // View Submission Detail Modal state
  const [viewingSubmission, setViewingSubmission] = useState(null);

  // Real-Time Communications State
  const [conversations, setConversations] = useState([]);
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

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [
        overviewRes,
        learnersRes,
        heatmapRes,
        requestsRes,
        subsRes,
        convsRes,
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
      ]);

      if (overviewRes.data.success) setMetrics(overviewRes.data.metrics);
      const fetchedLearners = learnersRes.data.learners || [];
      if (learnersRes.data.success) setLearners(fetchedLearners);
      if (heatmapRes.data.success) setHeatmap(heatmapRes.data.heatmap || []);
      if (requestsRes.data.success)
        setMaterialRequests(requestsRes.data.requests || []);
      if (subsRes.data.success) setSubmissions(subsRes.data.submissions || []);
      if (convsRes.data.success) {
        const convs = convsRes.data.conversations || [];
        setConversations(convs);
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
      console.error("Admin dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Poll conversation messages when an officer is selected
  const fetchSelectedConversation = async () => {
    if (!selectedOfficer?.officerId) return;
    try {
      const { data } = await axios.get(
        `${ServerUrl}/api/support/admin/conversation/${selectedOfficer.officerId}`,
        { withCredentials: true },
      );
      if (data.success) {
        setConversationMessages(data.messages || []);
      }
    } catch (error) {
      // Ignore background poll errors
    }
  };

  useEffect(() => {
    fetchSelectedConversation();
    const interval = setInterval(fetchSelectedConversation, 2500);
    return () => clearInterval(interval);
  }, [selectedOfficer?.officerId]);

  // Auto-scroll ONLY the inner chat box container without scrolling the browser window
  useEffect(() => {
    if (activeTab === "communications" && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversationMessages, activeTab]);

  // Inspect User Performance History
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

  // Submit Material Fulfillment
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

  // Submit Direct Material Dispatch
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
    } finally {
      setDispatchMaterialLoading(false);
    }
  };

  // Submit Custom Assignment Dispatch
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

      const payload = {
        ...assignmentForm,
        instructions: instructionsArr,
      };

      const { data } = await axios.post(
        `${ServerUrl}/api/admin/dispatch-assignment`,
        payload,
        { withCredentials: true },
      );
      if (data.success) {
        toast.success("Case study assignment successfully dispatched! 📋✨");
        setShowDispatchAssignmentModal(false);
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
          dueDate: "",
          adminNotes: "",
        });
        fetchAdminData();
      } else {
        toast.error(data.message || "Failed to dispatch assignment.");
      }
    } catch (error) {
      toast.error("Error creating assignment.");
    } finally {
      setAssignmentSubmitting(false);
    }
  };

  // Admin sends reply to selected officer
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
      }
    } catch (error) {
      toast.error("Error delivering reply.");
    } finally {
      setAdminReplyLoading(false);
    }
  };

  // Admin broadcasts announcement
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
      }
    } catch (error) {
      toast.error("Failed to broadcast announcement.");
    } finally {
      setBroadcastLoading(false);
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Top Header */}
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

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-900 border border-slate-300/60 dark:border-slate-800 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BsGrid3X3GapFill size={13} />
            <span>1. Cadre Overview & Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab("learners")}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "learners"
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
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "materials"
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
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "assignments"
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
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "communications"
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

        {/* ========================================================== */}
        {/* TAB 1: OVERVIEW & CADRE ANALYTICS */}
        {/* ========================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Cards Grid */}
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

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Cadre Distribution Bar Chart */}
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
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderRadius: "12px",
                          border: "1px solid #334155",
                          color: "#fff",
                          fontSize: "12px",
                        }}
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

              {/* Department Distribution Pie Chart */}
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
                          backgroundColor: "#0f172a",
                          borderRadius: "12px",
                          border: "1px solid #334155",
                          color: "#fff",
                          fontSize: "12px",
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Deficits & Heatmap */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* System Skill Deficits */}
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

              {/* Department Competency Heatmap */}
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

        {/* ========================================================== */}
        {/* TAB 2: OFFICER PERFORMANCE & EXPERIENCE MONITOR */}
        {/* ========================================================== */}
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

              {/* Filters */}
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

            {/* Officers Table */}
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

        {/* ========================================================== */}
        {/* TAB 3: STUDY MATERIAL REQUESTS & DISPATCH HUB */}
        {/* ========================================================== */}
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

            {/* Requests Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase text-slate-400">
                    <th className="p-4">Requester</th>
                    <th className="p-4">Requested Topic & Domain</th>
                    <th className="p-4">Detailed Requirement</th>
                    <th className="p-4 text-center">Urgency</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {materialRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
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
                        <td className="p-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              req.urgency === "Critical"
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
                            className={`px-2.5 py-1 rounded-full font-black text-[10px] ${
                              req.status === "fulfilled"
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

        {/* ========================================================== */}
        {/* TAB 4: CUSTOM ASSIGNMENTS & SUBMISSIONS REVIEW */}
        {/* ========================================================== */}
        {activeTab === "assignments" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FaTasks className="text-blue-600" />
                  <span>Custom Case Study Dispatcher & Submissions Review</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign statistical case studies to specific officers/cadres
                  and inspect submitted solutions and AI evaluations.
                </p>
              </div>

              <button
                onClick={() => setShowDispatchAssignmentModal(true)}
                className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer w-fit"
              >
                <FaPlus size={11} />
                <span>Compose New Case Study</span>
              </button>
            </div>

            {/* Submissions Table */}
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
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB 5: REAL-TIME HELPDESK & COMMUNICATIONS CENTER */}
        {/* ========================================================== */}
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
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowBroadcastModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <FaBullhorn size={12} />
                  <span>Broadcast Announcement</span>
                </button>
              </div>
            </div>

            {/* 2-Column Live Helpdesk Interface */}
            <div className="grid lg:grid-cols-12 gap-0 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/40 shadow-sm h-[640px]">
              {/* Left Column: Officer Conversations List */}
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

                  {/* Officer Directory Quick Selector */}
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
                          onClick={() => setSelectedOfficer(conv)}
                          className={`w-full p-4 text-left transition flex items-start justify-between gap-3 cursor-pointer ${
                            isSelected
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
                            <span className="text-[9px] font-semibold text-slate-400 block">
                              {new Date(conv.lastMessageAt).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
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

              {/* Right Column: Live Chat Room */}
              <div className="lg:col-span-8 flex flex-col h-full min-h-0 bg-slate-50/40 dark:bg-slate-950/40 relative overflow-hidden">
                {selectedOfficer ? (
                  <>
                    {/* Chat Header with Officer Profile Bar */}
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

                    {/* Messages Area */}
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
                                <span className="text-[9px] text-slate-400">
                                  {new Date(msg.createdAt).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              </div>

                              <div
                                className={`max-w-[75%] p-4 rounded-3xl text-xs leading-relaxed space-y-2 shadow-xs ${
                                  isAdmin
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
                                        alt="Attachment"
                                        className="max-h-48 rounded-2xl border border-white/20 object-cover w-full cursor-pointer hover:opacity-95 transition"
                                      />
                                    ) : (
                                      <a
                                        href={msg.attachmentData}
                                        download={
                                          msg.attachmentName || "attachment"
                                        }
                                        className={`p-2.5 rounded-2xl text-[11px] font-bold flex items-center justify-between gap-2 transition ${
                                          isAdmin
                                            ? "bg-blue-800 text-white hover:bg-blue-900"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <FaFilePdf
                                            className="text-rose-400 shrink-0"
                                            size={14}
                                          />
                                          <span className="truncate">
                                            {msg.attachmentName ||
                                              "Attached File"}
                                          </span>
                                        </div>
                                        <FaDownload
                                          size={11}
                                          className="shrink-0"
                                        />
                                      </a>
                                    )}
                                  </div>
                                )}

                                {isAdmin && (
                                  <div className="flex items-center justify-end text-[10px] text-blue-200 gap-1 pt-0.5">
                                    <FaCheckDouble
                                      size={10}
                                      className="text-blue-300"
                                    />
                                    <span>Sent to Officer</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Selected File Preview Banner */}
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

                    {/* Quick Canned Replies Chips */}
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

                    {/* Admin Reply Input - ALWAYS VISIBLE */}
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
          </div>
        )}
      </main>

      {/* ========================================================== */}
      {/* MODAL 1: INSPECT OFFICER PERFORMANCE & EXPERIENCE */}
      {/* ========================================================== */}
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

            {/* Inspector Body */}
            {inspectLoading ? (
              <div className="p-16 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-bold text-slate-400">
                  Loading Officer Experience History...
                </span>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* 4-Domain Radar Summary */}
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

                {/* Subtabs for Inspector */}
                <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <button
                    onClick={() => setInspectTab("interviews")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      inspectTab === "interviews"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    AI Viva Mock Interviews (
                    {userDetailedData?.interviews?.length || 0})
                  </button>
                  <button
                    onClick={() => setInspectTab("quizzes")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      inspectTab === "quizzes"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Quiz Evaluations (
                    {userDetailedData?.quizAttempts?.length || 0})
                  </button>
                  <button
                    onClick={() => setInspectTab("assignments")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      inspectTab === "assignments"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Case Study Submissions (
                    {userDetailedData?.submissions?.length || 0})
                  </button>
                  <button
                    onClick={() => setInspectTab("requests")}
                    className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                      inspectTab === "requests"
                        ? "bg-blue-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    Material Requests (
                    {userDetailedData?.materialRequests?.length || 0})
                  </button>
                </div>

                {/* Tab: Mock Interviews */}
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

                          {/* Questions Breakdown */}
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
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              mr.status === "fulfilled"
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

      {/* ========================================================== */}
      {/* MODAL 2: FULFILL STUDY MATERIAL REQUEST */}
      {/* ========================================================== */}
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

      {/* ========================================================== */}
      {/* MODAL 3: DIRECT STUDY MATERIAL DISPATCH MODAL */}
      {/* ========================================================== */}
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

      {/* ========================================================== */}
      {/* MODAL 4: DISPATCH CUSTOM ASSIGNMENT / CASE STUDY */}
      {/* ========================================================== */}
      {showDispatchAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Compose & Assign Statistical Case Study
                </h3>
                <p className="text-xs text-slate-500">
                  Target custom analytical drills directly to officers or
                  cadres.
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
                    {assignmentSubmitting ? "Assigning..." : "Assign to Cadre"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 5: VIEW SUBMISSION & AI EVALUATION */}
      {/* ========================================================== */}
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
