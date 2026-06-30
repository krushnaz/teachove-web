import React from 'react';
import { Routes, Route } from 'react-router-dom';
import QuestionPapersHub from './QuestionPapersHub';
import { QuestionPaperBuilder } from '../../shared/QuestionPaper';
import QuestionPaperToastHost from '../../shared/QuestionPaper/QuestionPaperToastHost';

const BASE_PATH = '/school-admin/question-papers';

const QuestionPapersModule: React.FC = () => (
  <QuestionPaperToastHost>
    <Routes>
      <Route index element={<QuestionPapersHub />} />
      <Route path="new" element={<QuestionPaperBuilder basePath={BASE_PATH} role="school" />} />
      <Route path=":paperId" element={<QuestionPaperBuilder basePath={BASE_PATH} role="school" />} />
    </Routes>
  </QuestionPaperToastHost>
);

export default QuestionPapersModule;
