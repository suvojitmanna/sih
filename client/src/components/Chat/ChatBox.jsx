import React, { useEffect, useRef, useState } from "react";
import ChatMessage from "./ChatMessage";
import toast from "react-hot-toast";
import {
  FaMicrophone,
  FaPaperPlane,
  FaStop,
  FaImage,
  FaCommentDots,
  FaBars,
} from "react-icons/fa";
import { BsRobot, BsStars } from "react-icons/bs";

const ChatBox = ({
  selectedChat,
  setSelectedChat,
  setChats,
  userData,
  onCreditUpdate,
  axiosInstance,
  onOpenSidebar,
}) => {
  const containerRef = useRef(null);
  const controllerRef = useRef(null);
  const recognitionRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("text");
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    containerRef.current?.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setPrompt(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => {
      setIsListening(false);
      toast.error("Microphone input error");
    };

    recognitionRef.current = recognition;
  }, []);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error("Speech Recognition not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleStop = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
      controllerRef.current = null;
      toast("Generation stopped", { icon: "🛑" });
    }
    setLoading(false);
  };

  const createChatIfNeeded = async () => {
    if (selectedChat?._id) return selectedChat._id;

    try {
      const { data } = await axiosInstance.post(
        "/api/chat/create",
        {},
        { withCredentials: true }
      );

      if (data.success) {
        setChats((prev) => [data.chat, ...prev]);
        setSelectedChat(data.chat);
        return data.chat._id;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
    return null;
  };

  const handlePublishToggle = async (message) => {
    try {
      if (!selectedChat?._id) return;
      const targetState = !message.isPublished;

      const { data } = await axiosInstance.post(
        "/api/message/publish",
        {
          chatId: selectedChat._id,
          messageId: message._id || message.content,
          isPublished: targetState,
        },
        { withCredentials: true }
      );

      if (data.success) {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === message._id || m.content === message.content
              ? { ...m, isPublished: targetState }
              : m
          )
        );
        toast.success(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading || !prompt.trim() || !userData) return;

    const requiredCredits = mode === "image" ? 2 : 1;
    if ((userData.credits || 0) < requiredCredits) {
      toast.error(`Not enough credits! Minimum ${requiredCredits} required.`);
      return;
    }

    setLoading(true);
    const promptCopy = prompt;
    setPrompt("");

    const chatId = await createChatIfNeeded();
    if (!chatId) {
      setLoading(false);
      return;
    }

    const userMessage = {
      role: "user",
      content: promptCopy,
      timestamp: new Date(),
      isImage: false,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      controllerRef.current = new AbortController();

      const endpoint = mode === "image" ? "/api/message/image" : "/api/message/text";
      const { data } = await axiosInstance.post(
        endpoint,
        { chatId, prompt: promptCopy },
        {
          withCredentials: true,
          signal: controllerRef.current.signal,
        }
      );

      if (data.success) {
        const newReply = { ...data.reply, isNew: true };
        setMessages((prev) => [...prev, newReply]);

        setSelectedChat((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: [...(prev.messages || []), userMessage, newReply],
            updatedAt: new Date(),
          };
        });
        setChats((prevChats) => {
          const existing = prevChats.find((c) => c._id === chatId);
          if (!existing) return prevChats;
          const filtered = prevChats.filter((c) => c._id !== chatId);
          return [
            {
              ...existing,
              messages: [...(existing.messages || []), userMessage, newReply],
              updatedAt: new Date(),
            },
            ...filtered,
          ];
        });

        if (onCreditUpdate) {
          onCreditUpdate(data.creditsLeft);
        }
      } else {
        toast.error(data.message || "Failed to generate response");
      }
    } catch (error) {
      if (error.name === "CanceledError" || error.code === "ERR_CANCELED") {
        return;
      }
      toast.error(error.response?.data?.message || error.message);
    } finally {
      controllerRef.current = null;
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full justify-between overflow-hidden relative">

      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 md:hidden cursor-pointer"
          >
            <FaBars size={14} />
          </button>
        </div>
        <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
          <BsRobot className="text-indigo-600 dark:text-indigo-400" />
          <span>SankhyaCopilot AI</span>
        </span>
        <div className="w-8" />
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 custom-scrollbar"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-xl mb-6">
              <BsRobot size={36} />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              How can I assist you today?
            </h2>

            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-md">
              Ask coding questions, generate realistic interview scenarios, or create high-quality AI images.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-8 max-w-xl w-full">
              {[
                {
                  icon: <BsStars className="text-amber-500" />,
                  title: "Technical Mock Interview Prep",
                  desc: "Explain the difference between SQL and NoSQL databases",
                },
                {
                  icon: <FaImage className="text-fuchsia-500" />,
                  title: "AI Image Generation",
                  desc: "Futuristic software engineer coding in a cybernetic glass workspace",
                },
                {
                  icon: <FaCommentDots className="text-indigo-500" />,
                  title: "Resume Refinement",
                  desc: "How can I improve bullet points for full-stack developer projects?",
                },
                {
                  icon: <BsStars className="text-emerald-500" />,
                  title: "System Design Concepts",
                  desc: "Design a high-availability URL shortener with rate limiting",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setPrompt(item.desc);
                    if (item.title.includes("Image")) setMode("image");
                    else setMode("text");
                  }}
                  className="p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-2 font-semibold text-xs text-slate-800 dark:text-slate-200">
                    {item.icon}
                    <span>{item.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <ChatMessage
            key={msg._id || msg.timestamp || index}
            message={msg}
            onPublishToggle={handlePublishToggle}
          />
        ))}

        {loading && (
          <div className="flex items-center gap-2 px-6 py-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-md">
              <BsRobot size={15} />
            </div>
            <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span
                className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-5 w-full bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800">
        <form
          onSubmit={onSubmit}
          className="max-w-4xl mx-auto flex items-center gap-2 p-2 sm:p-2.5 pl-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500/40 transition-all"
        >
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="text-xs sm:text-sm font-semibold bg-transparent text-slate-700 dark:text-slate-300 outline-none cursor-pointer pr-1"
          >
            <option value="text" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
              💬 Text
            </option>
            <option value="image" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-white">
              🎨 Image (2 Cr)
            </option>
          </select>

          <div className="h-5 w-px bg-slate-300 dark:bg-slate-700 shrink-0" />

          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={
              mode === "image"
                ? "Describe the image you want to generate..."
                : "Type your message or question..."
            }
            className="flex-1 text-sm bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none min-w-0 px-2"
          />

          <div className="flex items-center gap-1.5 shrink-0 pr-1">
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              title={isListening ? "Listening..." : "Speak message"}
            >
              <FaMicrophone size={13} />
            </button>

            {loading ? (
              <button
                type="button"
                onClick={handleStop}
                className="p-2.5 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all cursor-pointer"
                title="Stop generation"
              >
                <FaStop size={13} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!prompt.trim()}
                className="p-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-md cursor-pointer"
                title="Send message"
              >
                <FaPaperPlane size={13} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
