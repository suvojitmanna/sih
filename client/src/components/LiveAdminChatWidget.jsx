import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ServerUrl } from "../App";
import toast from "react-hot-toast";
import {
  FaComments,
  FaPaperPlane,
  FaTimes,
  FaMinus,
  FaFileImage,
  FaFilePdf,
  FaDownload,
  FaBullhorn,
  FaUserTie,
  FaHeadset,
  FaPaperclip,
} from "react-icons/fa";
import { BsShieldCheck, BsFillSendFill, BsCircleFill } from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";

const LiveAdminChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Poll messages every 2.5 seconds for real-time synchronization
  const fetchMessages = async (isBackground = false) => {
    try {
      const { data } = await axios.get(`${ServerUrl}/api/support/officer/messages`, {
        withCredentials: true,
      });

      if (data.success) {
        const msgs = data.messages || [];
        setMessages(msgs);

        // Check for new incoming admin messages
        if (msgs.length > lastMessageCount) {
          if (!isOpen && lastMessageCount > 0) {
            const newAdminMsgs = msgs.slice(lastMessageCount).filter((m) => m.senderRole === "admin");
            if (newAdminMsgs.length > 0) {
              setUnreadCount((prev) => prev + newAdminMsgs.length);
              toast("💬 New reply from NSSTA Faculty Desk!", {
                icon: "🏛️",
                style: { borderRadius: "12px", background: "#0f172a", color: "#fff" },
              });
            }
          }
          setLastMessageCount(msgs.length);
        }
      }
    } catch (error) {
      // Ignore background poll errors if unauthenticated
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 2500);
    return () => clearInterval(interval);
  }, [lastMessageCount, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      scrollToBottom();
    }
  }, [isOpen, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedFile) return;

    const messageText = inputText.trim();
    setInputText("");
    const fileToSend = selectedFile;
    setSelectedFile(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("message", messageText || "Attached file for review.");
      if (fileToSend) {
        formData.append("file", fileToSend);
      }

      const { data } = await axios.post(`${ServerUrl}/api/support/officer/send`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (data.success) {
        fetchMessages();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to deliver message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-4 rounded-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 cursor-pointer border-2 border-blue-400/30"
          title="Live Helpdesk & NSSTA Faculty Direct Chat"
        >
          <div className="relative">
            <FaComments size={22} className="text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>

          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-[11px] font-black tracking-wide uppercase text-blue-200">
              Live Helpdesk
            </span>
            <span className="text-xs font-bold text-white">
              NSSTA Faculty Chat
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Real-Time Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-300">
                <FaHeadset size={18} />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <h3 className="font-black text-sm text-white flex items-center gap-1.5">
                  <span>NSSTA Secretariat & Faculty</span>
                  <BsShieldCheck size={13} className="text-blue-400" />
                </h3>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <BsCircleFill size={6} />
                  <span>Real-Time Support Online</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <FaMinus size={11} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <FaTimes size={13} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-slate-50/50 dark:bg-slate-950/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                <FaComments size={32} className="opacity-30 text-blue-500" />
                <p className="font-bold text-slate-600 dark:text-slate-300 text-xs">
                  Welcome to NSSTA Officer Helpdesk
                </p>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Direct communication channel with Academy faculty for study materials, survey guidance, or technical assistance.
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isOfficer = msg.senderRole === "learner";
                const isBroadcast = msg.isBroadcast;

                if (isBroadcast) {
                  return (
                    <div
                      key={msg._id || index}
                      className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-400/40 text-slate-800 dark:text-slate-100 text-xs space-y-1 my-2"
                    >
                      <div className="flex items-center gap-1.5 font-black text-[11px] text-amber-700 dark:text-amber-400">
                        <FaBullhorn size={11} />
                        <span>{msg.senderName}</span>
                      </div>
                      <p className="leading-relaxed text-[11px]">{msg.message}</p>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg._id || index}
                    className={`flex flex-col ${isOfficer ? "items-end" : "items-start"}`}
                  >
                    <span className="text-[9px] font-bold text-slate-400 px-1 mb-0.5">
                      {isOfficer ? "You" : msg.senderName} •{" "}
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <div
                      className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed space-y-1.5 ${
                        isOfficer
                          ? "bg-blue-600 text-white rounded-br-xs shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700 shadow-xs"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.message}</p>

                      {msg.attachmentData && (
                        <div className="pt-1">
                          {msg.attachmentData.startsWith("data:image/") ? (
                            <img
                              src={msg.attachmentData}
                              alt="Attachment"
                              className="max-h-36 rounded-xl border border-white/20 object-cover"
                            />
                          ) : (
                            <a
                              href={msg.attachmentData}
                              download={msg.attachmentName || "attachment"}
                              className={`p-2 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition ${
                                isOfficer
                                  ? "bg-blue-700 text-white hover:bg-blue-800"
                                  : "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                              }`}
                            >
                              <FaDownload size={10} />
                              <span className="truncate">{msg.attachmentName || "Attached File"}</span>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Selected File Preview Banner */}
          {selectedFile && (
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 border-t border-blue-200 dark:border-blue-800 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
              <span className="truncate font-semibold text-[11px]">
                📎 {selectedFile.name}
              </span>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-rose-500 font-bold ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Input Area */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <label
              htmlFor="chat-file-input"
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-pointer transition"
              title="Attach File/Image"
            >
              <FaPaperclip size={13} />
              <input
                id="chat-file-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
                onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask faculty or request guidance..."
              className="flex-1 py-2.5 px-3.5 bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading || (!inputText.trim() && !selectedFile)}
              className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              <BsFillSendFill size={13} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveAdminChatWidget;
