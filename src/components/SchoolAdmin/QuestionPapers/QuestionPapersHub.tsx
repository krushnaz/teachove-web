import React from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import { QuestionPaperList } from '../../shared/QuestionPaper';

const BASE_PATH = '/school-admin/question-papers';

const QuestionPapersHub: React.FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gray-50 min-h-screen'}>
      <QuestionPaperList basePath={BASE_PATH} role="school" />
    </div>
  );
};

export default QuestionPapersHub;
