import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';

const testimonials = [
  {
    name: 'Dr. Priya Sharma',
    role: 'Principal, ABC International School',
    content:
      'Vedant Education has transformed how we manage our school. The system is intuitive, and the support team is exceptional. Our administrative efficiency has increased by 60%.',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Administrator, XYZ Public School',
    content:
      'The fee management and attendance tracking features have saved us countless hours. The mobile apps make it easy for teachers and parents to stay connected.',
    rating: 5,
  },
  {
    name: 'Anita Desai',
    role: 'IT Coordinator, Modern School',
    content:
      'Implementation was smooth, and the training provided was comprehensive. Our staff adapted quickly, and we have seen significant improvements in communication.',
    rating: 5,
  },
];

const TestimonialsSection: React.FC = () => {
  const { isDarkMode } = useDarkMode();

  return (
    <section
      className={`py-16 sm:py-20 lg:py-24 ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2
            className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            What Our{' '}
            <span className="text-blue-600 dark:text-blue-500">Clients Say</span>
          </h2>
          <p
            className={`text-base sm:text-lg max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Trusted by hundreds of schools across the nation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`relative p-6 sm:p-8 rounded-xl ${
                isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <Quote className={`w-8 h-8 sm:w-10 sm:h-10 mb-4 ${isDarkMode ? 'text-blue-500/20' : 'text-blue-600/10'}`} />
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 sm:w-5 sm:h-5 fill-blue-600 text-blue-600 dark:fill-blue-500 dark:text-blue-500"
                  />
                ))}
              </div>

              <p
                className={`text-sm sm:text-base leading-relaxed mb-6 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}
              >
                "{testimonial.content}"
              </p>

              <div className={`pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
                <h4
                  className={`font-bold mb-1 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {testimonial.name}
                </h4>
                <p
                  className={`text-sm ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {testimonial.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
