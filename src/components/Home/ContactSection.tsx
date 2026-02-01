import React, { useState } from 'react';
import { Phone, Mail, CheckCircle } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useReveal } from './utils/useReveal';

const ContactSection: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const ctaReveal = useReveal<HTMLDivElement>();
  const [contactForm, setContactForm] = useState({
    schoolName: '',
    schoolEmail: '',
    message: '',
  });
  const [showThankYou, setShowThankYou] = useState(false);

  const handleContactFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowThankYou(true);
    setContactForm({ schoolName: '', schoolEmail: '', message: '' });
    setTimeout(() => {
      setShowThankYou(false);
    }, 5000);
  };

  return (
    <section
      id="contact"
      ref={ctaReveal.elementRef}
      className={`py-16 sm:py-20 lg:py-24 ${
        isDarkMode ? 'bg-slate-900' : 'bg-white'
      }`}
    >
      <div
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-700 ${
          ctaReveal.revealed
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Info Side */}
          <div className={`lg:col-span-2 p-6 sm:p-8 lg:p-10 rounded-xl bg-blue-600 text-white`}>
            <div className="h-full flex flex-col justify-between">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-4">Get in Touch</h3>
                <p className="text-blue-100 mb-8 text-sm sm:text-base">
                  Ready to transform your school? Send us a message and we'll get back to you within 24 hours.
                </p>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-sm sm:text-base">+91 97661 17311</span>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <span className="text-sm sm:text-base break-all">
                    vedanteducation.22@gmail.com
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className={`lg:col-span-3 p-6 sm:p-8 lg:p-10 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-gray-50'}`}>
            {showThankYou ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center">
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-6 ${
                  isDarkMode ? 'bg-green-500/20' : 'bg-green-100'
                }`}>
                  <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600 dark:text-green-400" />
                </div>
                <h3
                  className={`text-xl sm:text-2xl font-bold mb-2 ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Message Sent!
                </h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
                  We will be in touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactFormSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      School Name
                    </label>
                    <input
                      name="schoolName"
                      value={contactForm.schoolName}
                      onChange={handleContactFormChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="Your school name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={`text-sm font-semibold ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Email
                    </label>
                    <input
                      name="schoolEmail"
                      type="email"
                      value={contactForm.schoolEmail}
                      onChange={handleContactFormChange}
                      required
                      className={`w-full px-4 py-3 rounded-lg border transition-all outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode
                          ? 'bg-slate-900 border-slate-700 text-white placeholder-gray-500'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                      }`}
                      placeholder="school@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label
                    className={`text-sm font-semibold ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactFormChange}
                    required
                    rows={4}
                    className={`w-full px-4 py-3 rounded-lg border transition-all outline-none resize-none focus:ring-2 focus:ring-blue-500 ${
                      isDarkMode
                        ? 'bg-slate-900 border-slate-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                    }`}
                    placeholder="Tell us about your requirements..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 sm:py-4 rounded-full font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors active:scale-95 touch-manipulation min-h-[48px]"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
