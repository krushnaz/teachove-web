import React, { useState } from 'react';
import { useDarkMode } from '../../../contexts/DarkModeContext';
import SchoolFeesTab from './SchoolFeesTab';
import MiscFeesTab from './MiscFeesTab';

const StudentFees: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState<'School' | 'Admission' | 'Book' | 'Uniform' | 'Bag'>('School');

  const tabs: Array<'School' | 'Admission' | 'Book' | 'Uniform' | 'Bag'> = [
    'School',
    'Admission',
    'Book',
    'Uniform',
    'Bag'
  ];

  return (
    <div className="space-y-6">
      <div className={`p-1 rounded-xl flex space-x-1 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
              activeTab === tab
                ? isDarkMode
                  ? 'bg-primary-600 text-white shadow'
                  : 'bg-white text-primary-600 shadow-sm'
                : isDarkMode
                  ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            {tab} Fees
          </button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === 'School' ? (
          <SchoolFeesTab />
        ) : (
          <MiscFeesTab feeType={activeTab} />
        )}
      </div>
    </div>
  );
};

export default StudentFees;
