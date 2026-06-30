import React from 'react';
import { Routes, Route } from 'react-router-dom';
import QuestionPaperList from './QuestionPaperList';
import QuestionPaperBuilder from './QuestionPaperBuilder';

interface QuestionPaperModuleProps {
  basePath: string;
  role: 'school' | 'teacher';
}

const QuestionPaperModule: React.FC<QuestionPaperModuleProps> = ({ basePath, role }) => (
  <Routes>
    <Route index element={<QuestionPaperList basePath={basePath} role={role} />} />
    <Route path="new" element={<QuestionPaperBuilder basePath={basePath} role={role} />} />
    <Route path=":paperId" element={<QuestionPaperBuilder basePath={basePath} role={role} />} />
  </Routes>
);

export default QuestionPaperModule;
