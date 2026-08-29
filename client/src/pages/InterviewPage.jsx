import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Step1 from '../components/Step1';
import Step2 from '../components/Step2';
import Step3 from '../components/Step3';

const InterviewPage = () => {
  const [step, setStep] = useState(1);
  const [interViewData, setInterViewData] = useState(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex-1 pt-18">
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
      </div>
    </div>
  );
};

export default InterviewPage;