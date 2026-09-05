import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Step1 from '../components/Step1';
import Step2 from '../components/Step2';
import Step3 from '../components/Step3';

const InterviewPage = () => {
  const [step, setStep] = useState(1);
  const [interViewData, setInterViewData] = useState(null);

  return (
    <div className={`min-h-screen ${step === 2 ? "lg:h-screen lg:overflow-hidden" : ""} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500/20`}>
      <Navbar />
      <main className={`flex-1 ${step === 3 ? "max-w-7xl" : "max-w-6xl"} w-full mx-auto px-3 sm:px-6 lg:px-8 pt-18 sm:pt-19 pb-6 flex flex-col ${step === 2 ? "justify-center lg:overflow-hidden" : ""}`}>
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