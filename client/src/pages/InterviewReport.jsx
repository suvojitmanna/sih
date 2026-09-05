import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Step3 from "../components/Step3";

const InterviewReport = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await axios.get(
          `${ServerUrl}/api/interview/report/${id}`,
          {
            withCredentials: true,
          }
        );
        setReport(result.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchReport();
  }, [id]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-19 pb-12">
        <Step3 report={report} />
      </main>
      <Footer />
    </div>
  );
};

export default InterviewReport;
