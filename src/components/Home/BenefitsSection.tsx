import React from 'react';
import { Cloud, Headphones, Shield, Puzzle, TrendingDown, Zap } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const benefits = [
  {
    title: 'Cloud-Based Solution',
    description: 'Access your school data from anywhere, anytime. No installation required.',
    Icon: Cloud,
  },
  {
    title: '24/7 Support',
    description: 'Our dedicated support team is always ready to help you whenever you need assistance.',
    Icon: Headphones,
  },
  {
    title: 'Secure & Reliable',
    description: 'Your data is protected with enterprise-grade security and 99.9% uptime guarantee.',
    Icon: Shield,
  },
  {
    title: 'Easy Integration',
    description: 'Seamlessly integrate with existing systems and third-party applications.',
    Icon: Puzzle,
  },
  {
    title: 'Cost Effective',
    description: 'Reduce operational costs with automated processes and efficient resource management.',
    Icon: TrendingDown,
  },
  {
    title: 'Scalable Platform',
    description: 'Grows with your institution from small schools to large educational networks.',
    Icon: Zap,
  },
];

const BenefitsSection: React.FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <section
      id="benefits"
      className={`py-16 sm:py-20 lg:py-24 ${
        isDarkMode ? 'bg-slate-950' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Why Choose{' '}
            <span className="text-blue-600 dark:text-blue-500">TeachoVE</span>
            ?
          </h2>
          <p
            className={`text-base sm:text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Experience the difference with our comprehensive school management solution
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className={`p-6 sm:p-8 rounded-xl transition-all duration-300 hover:-translate-y-2 ${
                isDarkMode ? 'bg-slate-900/50 hover:bg-slate-900' : 'bg-white hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg mb-4 sm:mb-6 flex items-center justify-center ${
                  isDarkMode ? 'bg-blue-950/50' : 'bg-blue-50'
                }`}
              >
                <benefit.Icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-500" strokeWidth={2} />
              </div>
              <h3
                className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                {benefit.title}
              </h3>
              <p
                className={`text-sm sm:text-base leading-relaxed ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
