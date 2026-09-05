import React, { useState } from "react";
import { FaArrowLeft, FaCheckCircle, FaCrown, FaBolt } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import BackButton from "../components/BackButton";

const Pricing = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [selectedPlan, setSelectedPlan] = useState("basic");
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: "free",
      name: "Standard Cadre Plan",
      icon: <FaBolt />,
      price: "₹0",
      credits: 100,
      description: "Standard allocation for statistical officers and learners.",
      features: [
        "100 AI Cadre Interview Credits",
        "Official Competency Matrix Access",
        "Voice AI Viva Voce Access",
        "Standard Performance Dossier Export",
      ],
      button: "Current Plan",
      disabled: true,
      color: "from-slate-400 to-slate-600",
    },

    {
      id: "basic",
      name: "Officer Starter Pack",
      icon: <FaBolt />,
      price: "₹100",
      credits: 150,
      description:
        "Expanded capacity for comprehensive mock interview drills.",
      features: [
        "150 AI Interview Credits",
        "Detailed SankhyaIQ Diagnostic Feedback",
        "Domain-Wise Benchmark Analytics",
        "Unlimited Attempt Scorecards",
      ],
      button: "Upgrade Pack",
      color: "from-emerald-500 to-green-600",
    },

    {
      id: "pro",
      name: "Executive NSSTA Pack",
      icon: <FaCrown />,
      price: "₹500",
      credits: 650,
      badge: "RECOMMENDED",
      description: "Full capacity bundle for intensive cadre promotion and exam boards.",
      features: [
        "650 AI Viva Credits",
        "Deep Neural Model Assessment",
        "4-Domain Radar Diagnostics",
        "Priority AI Processing",
        "Official PDF Dossiers with QR Verification",
      ],
      button: "Upgrade Executive",
      color: "from-blue-600 to-indigo-600",
    },
  ];

  const handlePayment = async (plan) => {
    try {
      setLoading(plan.id);

      const amount = plan.id === "basic" ? 100 : plan.id === "pro" ? 500 : 0;

      const result = await axios.post(
        `${ServerUrl}/api/payment/order`,
        {
          planId: plan.id,
          amount,
          credits: plan.credits,
        },
        {
          withCredentials: true,
        },
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,

        amount: result.data.order.amount,
        currency: result.data.order.currency,
        order_id: result.data.order.id,

        name: "MoSPI SkillIQ",

        description: `${plan.name} - ${plan.credits} Credits`,

        handler: async (response) => {
          try {
            const verify = await axios.post(
              `${ServerUrl}/api/payment/verify`,
              response,
              {
                withCredentials: true,
              },
            );

            if (verify.data.success) {
              toast.success("Credits Added Successfully! ✨");
              if (verify.data.user) {
                dispatch(setUserData(verify.data.user));
              }

              // Return to previous page where user came from
              if (location.state?.from) {
                navigate(location.state.from);
              } else if (window.history.state && window.history.state.idx > 0) {
                navigate(-1);
              } else if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate("/dashboard");
              }
            }
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },

        theme: {
          color: "#2563eb",
        },
      };

      const razor = new window.Razorpay(options);

      razor.open();

      razor.on("payment.failed", () => {
        toast.error("Payment Failed");
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 px-4 sm:px-6 py-16 overflow-hidden transition-colors duration-300">
      <Navbar />

      {/* Top Blur Background */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl opacity-30 pointer-events-none"></div>

      {/* Header */}
      <div className="max-w-7xl mx-auto flex items-start gap-4 mb-16 relative z-10 pt-5">
        <BackButton fallbackUrl="/dashboard" label="Back" />

        <div className="w-full text-center">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white">
            Capacity Credits & Subscription
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-3 text-xs sm:text-sm max-w-2xl mx-auto">
            Choose your AI interview credits allocation for high-stakes cadre viva voce practice.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 max-w-7xl mx-auto relative z-10">
        {plans.map((plan, index) => {
          const isSelected = selectedPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{
                y: -8,
                scale: 1.02,
              }}
              onClick={() => !plan.disabled && setSelectedPlan(plan.id)}
              className={`relative rounded-[32px] p-[1px] transition-all duration-500
              ${isSelected ? `bg-gradient-to-br ${plan.color}` : "bg-slate-200 dark:bg-slate-800"}
              `}
            >
              {/* Inner Card */}
              <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 h-full shadow-xl border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  {plan.badge && (
                    <div className="absolute top-5 right-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-sm">
                      {plan.badge}
                    </div>
                  )}

                  {/* Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl bg-gradient-to-br ${plan.color} shadow-md`}
                  >
                    {plan.icon}
                  </div>

                  {/* Name */}
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-5">
                    {plan.name}
                  </h2>

                  {/* Price */}
                  <div className="mt-4">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white">
                      {plan.price}
                    </span>

                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-xs font-bold">{plan.credits} AI Viva Credits</p>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 mt-4 text-xs leading-relaxed">
                    {plan.description}
                  </p>

                  <div className="mt-6 space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs">
                        <FaCheckCircle className="text-emerald-500 shrink-0" size={13} />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  disabled={plan.disabled}
                  onClick={(e) => {
                    e.stopPropagation();

                    if (!plan.disabled) {
                      handlePayment(plan);
                    }
                  }}
                  className={`w-full mt-8 py-3.5 rounded-2xl font-bold text-xs transition-all duration-300
                  ${
                    plan.disabled
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      : `bg-gradient-to-r ${plan.color} text-white hover:scale-102 shadow-md cursor-pointer`
                  }
                  `}
                >
                  {loading === plan.id ? "Processing..." : plan.button}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="text-center mt-12 mb-12 text-slate-400 text-xs relative z-10 font-medium">
        Secure Indian Banking & UPI Payments Powered By Razorpay
      </div>

      <Footer />
    </div>
  );
};

export default Pricing;
