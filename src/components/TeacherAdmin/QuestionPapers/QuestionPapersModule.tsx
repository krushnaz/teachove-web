import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { QuestionPaperList, QuestionPaperBuilder } from '../../shared/QuestionPaper';
import QuestionPaperToastHost from '../../shared/QuestionPaper/QuestionPaperToastHost';

const BASE_PATH = '/teacher-admin/question-papers';

const TeacherQuestionPapersModule: React.FC = () => (
  <QuestionPaperToastHost>
    <Routes>
      <Route index element={<QuestionPaperList basePath={BASE_PATH} role="teacher" />} />
      <Route path="new" element={<QuestionPaperBuilder basePath={BASE_PATH} role="teacher" />} />
      <Route path=":paperId" element={<QuestionPaperBuilder basePath={BASE_PATH} role="teacher" />} />
    </Routes>
  </QuestionPaperToastHost>
);

export default TeacherQuestionPapersModule;
