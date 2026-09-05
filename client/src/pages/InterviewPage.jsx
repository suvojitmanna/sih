import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Step1 from '../components/Step1';
import Step2 from '../components/Step2';
import Step3 from '../components/Step3';
import BackButton from '../components/BackButton';

const InterviewPage = () => {
  const [step, setStep] = useState(1);
  const [interViewData, setInterViewData] = useState(null);

  return (
    <div className={`min-h-screen ${step === 1 ? "h-screen overflow-hidden" : ""} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col`}>
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-22 pb-2 flex flex-col justify-center overflow-hidden">
        <div className="mb-1.5 flex items-center justify-between shrink-0">
          <BackButton fallbackUrl="/ai-models" label="Back to AI Models" />
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            Step 1 of 3: Mock Interview Setup
          </span>
        </div>
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