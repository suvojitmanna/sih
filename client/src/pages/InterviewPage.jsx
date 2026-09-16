import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import Navbar from '../components/Navbar';
import Step1 from '../components/Step1';
import Step2 from '../components/Step2';
import Step3 from '../components/Step3';
import { BsShieldCheck } from 'react-icons/bs';

const InterviewPage = () => {
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(1);
  const [interViewData, setInterViewData] = useState(null);
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(true);

  const isIntakeParam =
    searchParams.get('type') === 'intake' ||
    searchParams.get('diagnostic') === 'true' ||
    searchParams.get('intake') === 'true';

  const isPracticeParam = searchParams.get('type') === 'practice';

  useEffect(() => {
    let isMounted = true;

    const initializeSession = async () => {
      // If candidate explicitly requests a custom practice session, show Step 1 setup
      if (isPracticeParam) {
        if (isMounted) {
          setLoadingDiagnostic(false);
          setStep(1);
        }
        return;
      }

      try {
        // Fetch or auto-provision cadre baseline diagnostic viva session
        const { data } = await axios.get(`${ServerUrl}/api/interview/diagnostic`, {
          withCredentials: true,
        });

        if (
          isMounted &&
          data &&
          data.success &&
          Array.isArray(data.question) &&
          data.question.length > 0
        ) {
          // Intake viva must NOT show Step 1, it directly shows Step 2
          if (isIntakeParam || data.status !== 'completed') {
            setInterViewData(data);
            setStep(2);
            setLoadingDiagnostic(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Could not auto-load diagnostic intake viva:', err.message);
      }

      // If already completed or not in intake mode, default to custom interview Step 1
      if (isMounted) {
        setLoadingDiagnostic(false);
        setStep(1);
      }
    };

    initializeSession();

    return () => {
      isMounted = false;
    };
  }, [searchParams, isIntakeParam, isPracticeParam]);

  if (loadingDiagnostic) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="flex flex-col items-center gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full text-center">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            </div>
            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                <BsShieldCheck size={12} className="text-indigo-500 animate-pulse" />
                <span>Cadre Diagnostic Baseline Intake</span>
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Preparing Oral Viva Voce
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Loading official cadre questions, speech recognition & AI avatar studio...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        step === 2 ? 'lg:h-screen lg:overflow-hidden' : ''
      } bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500/20`}
    >
      <Navbar />
      <main
        className={`flex-1 ${
          step === 3 ? 'max-w-7xl' : 'max-w-6xl'
        } w-full mx-auto px-3 sm:px-6 lg:px-8 pt-18 sm:pt-19 pb-6 flex flex-col ${
          step === 2 ? 'justify-center lg:overflow-hidden' : ''
        }`}
      >
        {step === 1 && (
          <Step1
            onStart={(data) => {
              setInterViewData(data);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <Step2
            interviewData={interViewData}
            onFinish={(report) => {
              setInterViewData(report);
              setStep(3);
            }}
          />
        )}
        {step === 3 && <Step3 report={interViewData} />}
      </main>
    </div>
  );
};

export default InterviewPage;