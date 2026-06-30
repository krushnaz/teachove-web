import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface QuestionPaperToastHostProps {
  children: React.ReactNode;
}

const QuestionPaperToastHost: React.FC<QuestionPaperToastHostProps> = ({ children }) => (
  <>
    {children}
    <ToastContainer
      position="bottom-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      draggable
      theme="colored"
      className="!bottom-20 sm:!bottom-4"
    />
  </>
);

export default QuestionPaperToastHost;
