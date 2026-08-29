import React from "react";
import femaleVideo from "../assets/Videos/female-ai.mp4";
import maleVideo from "../assets/Videos/male-ai.mp4";
import Timer from "./Timer";
import { motion } from "framer-motion";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import axios from "axios";
import { ServerUrl } from "../App";
import { BsArrowRight } from "react-icons/bs";

const Step2 = ({ interviewData, onFinish }) => {
  const {
    interviewId,
    question: questions,
    username: userName,
  } = interviewData;
  const [isIntroPhase, setIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions?.[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");

  const videoRef = useRef(null);
  const currentQuestion = questions?.[currentIndex];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female"),
      );
      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male"),
      );
      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }

      setAnswer((prev) => prev + " " + finalTranscript);
    };

    // when mic stops automatically
    recognition.onend = () => {
      console.log("Speech recognition ended");

      // restart mic automatically
      if (isMicOn && !isAIPlaying) {
        try {
          recognition.start();
        } catch (error) {
          console.log("Restart error", error);
        }
      }
    };

    // error handling
    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        alert("Please allow microphone permission");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };

  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const humanText = text.replace(/,/g, ",...").replace(/\./g, ". ...");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;

        setIsAIPlaying(false);

        setSubtitle("");
        setTimeout(() => {
          if (isMicOn) startMic();
        }, 500);
        resolve();
      };

      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };

  useEffect(() => {
    if (!selectedVoice) {
      return;
    }

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`,
        );
        await speakText(
          "I'll ask you a few questions. just answer naturally, and take your time. Let's begin.",
        );

        setIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }
        await speakText(currentQuestion.question);
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (isAIPlaying) return;
    if (isSubmitting || feedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex, isAIPlaying, isSubmitting]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex, currentQuestion, isIntroPhase]);

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true },
      );
      setFeedback(result.data.feedback);
      await speakText(result.data.feedback);
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        {
          interviewId,
        },
        { withCredentials: true },
      );
      console.log(result.data);
      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 transition-colors duration-300">
      <div className="w-full max-w-7xl min-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel */}
        <div className="w-full lg:w-[35%] bg-slate-50/60 dark:bg-slate-950/50 flex flex-col items-center p-6 space-y-6 border-r border-slate-200 dark:border-slate-800">
          {/* AI Video */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full max-w-sm rounded-2xl object-cover"
            />
          </div>

          {subtitle && (
            <div className="w-full max-w-md bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-xs">
              <p className="text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}

          {/* Status Card */}
          <div className="w-full max-w-md bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm px-6 py-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                Interview Status
              </span>

              {isAIPlaying && (
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                    AI Speaking
                  </span>
                </div>
              )}
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700"></div>

            {/* Timer */}
            <div className="flex justify-center py-1">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit}
              />
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-700"></div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {currentIndex + 1}
                </span>

                <span className="text-[10px] uppercase font-bold text-slate-400">Current Question</span>
              </div>

              <div className="flex flex-col">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {questions?.length || 0}
                </span>

                <span className="text-[10px] uppercase font-bold text-slate-400">Total Questions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col p-6 sm:p-8 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              SankhyaIQ™ <span className="text-blue-600 dark:text-blue-400">Cadre Viva Simulator</span>
            </h2>
            <span className="text-xs font-bold text-slate-400">
              Official Assessment Session
            </span>
          </div>

          {/* Question Card */}
          {!isIntroPhase && (
            <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 sm:p-6 shadow-xs mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions?.length}
                </p>
                <span className="text-[11px] font-semibold text-slate-400">
                  Time Remaining: {timeLeft}s
                </span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                {currentQuestion?.question}.
              </h3>
            </div>
          )}

          {/* Answer Section */}
          <div className="flex flex-col flex-1">
            <textarea
              placeholder="Type your official answer or speak aloud using your microphone..."
              onChange={(e) => setAnswer(e.target.value)}
              value={answer}
              className="flex-1 min-h-[240px] w-full bg-slate-50 dark:bg-slate-800/80 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 resize-none outline-hidden text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm leading-relaxed"
            />
            {!feedback ? (
              <div className="flex items-center gap-4 mt-6">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMic}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-2xl transition-all shadow-md cursor-pointer ${
                    isMicOn
                      ? "bg-emerald-600 text-white shadow-emerald-500/20"
                      : "bg-slate-800 dark:bg-slate-700 text-slate-400"
                  }`}
                  title={isMicOn ? "Microphone active (listening)" : "Microphone muted"}
                >
                  {isMicOn ? (
                    <FaMicrophone size={18} />
                  ) : (
                    <FaMicrophoneSlash size={18} />
                  )}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={submitAnswer}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3.5 sm:py-4 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all font-bold text-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? "Evaluating with AI..." : "Submit Answer & Evaluate"}
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 p-5 rounded-2xl shadow-xs space-y-3"
              >
                <p className="text-emerald-800 dark:text-emerald-300 font-semibold text-xs leading-relaxed">
                  {feedback}
                </p>
                <button
                  onClick={handleNext}
                  className="group w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white py-3 rounded-xl shadow-md transition-all font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Next Question</span>
                  <BsArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step2;
