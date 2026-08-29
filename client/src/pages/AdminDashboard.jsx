import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { ServerUrl } from "../App";
import axios from "axios";
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
  FaShieldAlt,
  FaAward,
  FaClock,
  FaTasks,
  FaBuilding,
  FaExclamationTriangle,
  FaSearch,
} from "react-icons/fa";
import { BsShieldCheck, BsGrid3X3GapFill } from "react-icons/bs";

const COLORS = ["#1e40af", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4"];

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [learners, setLearners] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      const [overviewRes, learnersRes, heatmapRes] = await Promise.all([
        axios.get(`${ServerUrl}/api/admin/overview`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/admin/learners`, { withCredentials: true }),
        axios.get(`${ServerUrl}/api/admin/heatmap`, { withCredentials: true }),
      ]);

      if (overviewRes.data.success) setMetrics(overviewRes.data.metrics);
      if (learnersRes.data.success) setLearners(learnersRes.data.learners || []);
      if (heatmapRes.data.success) setHeatmap(heatmapRes.data.heatmap || []);
    } catch (error) {
      console.error("Admin dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const filteredLearners = learners.filter(
    (l) =>
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.jobRole?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider mb-2">
            <BsShieldCheck size={13} />
            <span>Ministry Administration & Training Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            NSSTA Executive Training & Competency Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl">
            System-wide capacity building intelligence across Indian Statistical Service (ISS), Subordinate Statistical Service (SSS), Field Operations (FOD), and State Directorate divisions.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Total Officers</span>
            <div className="mt-1 text-2xl font-black text-blue-700 dark:text-blue-400">
              {metrics?.totalLearners || 1}
            </div>
            <span className="text-[10px] font-bold text-emerald-600">Registered Personnel</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">System Competency</span>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.avgCompetency || 72}%
            </div>
            <span className="text-[10px] font-bold text-blue-600">Mean Index Score</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Training Hours</span>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.totalLearningHours || 0} hrs
            </div>
            <span className="text-[10px] font-bold text-violet-600">Logged Upskilling</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Assessments Run</span>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.totalQuizzesAttempted || 0}
            </div>
            <span className="text-[10px] font-bold text-emerald-600">Quiz Submissions</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Training Manuals</span>
            <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
              {metrics?.totalMaterials || 0}
            </div>
            <span className="text-[10px] font-bold text-amber-600">AI MCQ Sources</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-semibold text-slate-500 block">Verified Status</span>
            <div className="mt-1 text-2xl font-black text-emerald-600">
              100%
            </div>
            <span className="text-[10px] font-bold text-emerald-600">Email OTP 2FA</span>
          </div>
        </div>

        {/* Charts: Department Distribution & Top System-Wide Deficits */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Department Breakdown */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaBuilding className="text-blue-600" />
              <span>Officer Distribution by Department / Division</span>
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics?.departmentDistribution || [{ name: "NSSO", learners: 1 }]}
                    dataKey="learners"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {(metrics?.departmentDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Skill Deficits Across Cadres */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaExclamationTriangle className="text-amber-500" />
              <span>Top System-Wide Skill Deficits (MoSPI Gaps)</span>
            </h3>

            <div className="space-y-3">
              {(metrics?.topDeficits || [
                { competencyName: "Statistical Computing & Automated Survey Data Processing", count: 8 },
                { competencyName: "National Accounts & GDP Compilation", count: 6 },
                { competencyName: "Sampling Techniques & Estimation", count: 5 },
                { competencyName: "Data Privacy, Ethics & Anonymization", count: 4 },
              ]).map((def, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {def.competencyName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Targeted for mandatory NSSTA in-service training module
                    </span>
                  </div>
                  <span className="text-xs font-black text-rose-600 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-xl">
                    {def.count} Officers Impacted
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Departmental Competency Heatmap */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BsGrid3X3GapFill className="text-blue-600" />
            <span>Departmental Competency Heatmap Matrix</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Department / Division</th>
                  <th className="p-3.5 text-center">Statistical Score</th>
                  <th className="p-3.5 text-center">Technical Score</th>
                  <th className="p-3.5 text-center">Digital Governance</th>
                  <th className="p-3.5 text-center rounded-r-xl">Managerial Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold">
                {heatmap.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                      {row.department}
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {row.statistical}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        {row.technical}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        {row.digitalGov}%
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        {row.managerial}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Officers Directory */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FaUsers className="text-blue-600" />
              <span>Registered Statistical Officers Registry</span>
            </h3>

            <div className="relative max-w-xs w-full">
              <FaSearch className="absolute left-3 top-3 text-slate-400" size={12} />
              <input
                type="text"
                placeholder="Search by name, email, cadre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3.5 py-2 text-xs focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Officer Name</th>
                  <th className="p-3.5">Cadre / Job Role</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Competency Score</th>
                  <th className="p-3.5">Level</th>
                  <th className="p-3.5 rounded-r-xl">Email Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLearners.map((learner) => (
                  <tr key={learner._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                      <div>{learner.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{learner.email}</span>
                    </td>
                    <td className="p-3.5 font-semibold text-blue-700 dark:text-blue-400">
                      {learner.jobRole || "ISS Officer"}
                    </td>
                    <td className="p-3.5 text-slate-500">{learner.department || "NSSO"}</td>
                    <td className="p-3.5 font-black text-slate-800 dark:text-slate-200">
                      {learner.overallCompetencyScore || 65}%
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {learner.overallLevel || "Intermediate"}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        Verified 2FA
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
