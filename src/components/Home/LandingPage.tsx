import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';
import schoolAdminScreen from '../../assets/appScreenshorts/schoolAdminHomeScreen.jpg';
import teacherAdminScreen from '../../assets/appScreenshorts/teacherAdminHomeScreen.jpg';
import studentAdminScreen from '../../assets/appScreenshorts/studentAdminHomeScreen.jpg';

// Small utility hook to reveal sections on scroll without extra dependencies
function useReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const elementRef = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!elementRef.current || revealed) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      options || { rootMargin: '0px 0px -10% 0px', threshold: 0.12 }
    );
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [revealed, options]);

  return { elementRef, revealed } as const;
}

const LandingPage: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [contactForm, setContactForm] = useState({
    schoolName: '',
    schoolEmail: '',
    message: ''
  });
  const [showThankYou, setShowThankYou] = useState(false);

  // Enforce smooth scrolling for anchor navigation
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value
    });
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can add API call to send the form data
    console.log('Contact form submitted:', contactForm);
    setShowThankYou(true);
    setContactForm({
      schoolName: '',
      schoolEmail: '',
      message: ''
    });
    
    // Hide thank you message after 5 seconds
    setTimeout(() => {
      setShowThankYou(false);
    }, 5000);
  };

  const schoolAdminFeatures = [
    'Manage teacher records: add, edit, delete',
    'Maintain student and non-teaching staff records',
    'Academics management: classes, subjects, exam timetables',
    'Announcements and notices to teachers, students, or specific classes',
    'Attendance management for teachers and non-teaching staff with reports and summaries',
    'Student fees management with options to add, edit, delete and generate reports',
    'Event management',
    'Approve and track teacher leave requests',
    'Access Vedant Education books'
  ];

  const teacherAdminFeatures = [
    'Manage student records',
    'Mark and view student attendance',
    'Manage student results',
    'Homework management',
    'View class and exam schedules',
    'Access event details',
    'View own attendance records',
    'Apply for leave and manage student leave requests',
    'View announcements and notices'
  ];

  const heroReveal = useReveal<HTMLDivElement>();
  const appsReveal = useReveal<HTMLDivElement>();
  const featuresReveal = useReveal<HTMLDivElement>();
  const ctaReveal = useReveal<HTMLDivElement>();

  return (
    <div className={`min-h-screen scroll-smooth relative ${isDarkMode ? 'dark bg-[#0A0E27]' : 'bg-gradient-to-b from-blue-50 via-white to-purple-50'}`}>
      {/* Animated Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className={`absolute -top-40 -left-40 h-80 w-80 rounded-full ${isDarkMode ? 'bg-blue-600/20' : 'bg-blue-400/30'} blur-3xl animate-pulse`} />
        <div className={`absolute top-1/4 -right-40 h-96 w-96 rounded-full ${isDarkMode ? 'bg-purple-600/20' : 'bg-purple-400/30'} blur-3xl animate-pulse`} style={{ animationDelay: '1s' }} />
        <div className={`absolute bottom-0 left-1/3 h-80 w-80 rounded-full ${isDarkMode ? 'bg-pink-600/20' : 'bg-pink-400/30'} blur-3xl animate-pulse`} style={{ animationDelay: '2s' }} />
        
        {/* Mesh Pattern */}
        <div className={`absolute inset-0 ${isDarkMode ? 'opacity-5' : 'opacity-10'}`} style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'} 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-[#0A0E27]/80 border-white/10' : 'bg-white/80 border-gray-200'} border-b sticky top-0 z-50 backdrop-blur-xl`}> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'} shadow-lg flex items-center justify-center`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className={`text-lg sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className={`${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent`}>VedanTech</span>
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#apps" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors font-medium`}>Our Apps</a>
              <a href="#features" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors font-medium`}>Features</a>
              <a href="#cta" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors font-medium`}>Contact</a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-white/10 text-yellow-400 hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {isDarkMode ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <Link to="/login" className={`inline-flex items-center ${isDarkMode ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700'} text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base`}>
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroReveal.elementRef} className="py-12 sm:py-16 md:py-20 px-4 relative overflow-hidden">
        <div className={`max-w-7xl mx-auto text-center transform-gpu transition-all duration-1000 ${heroReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 sm:mb-8 ${isDarkMode ? 'bg-white/10 text-blue-300 ring-1 ring-white/20' : 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'} backdrop-blur-xl animate-bounce-slow`}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-semibold">Trusted by Schools Nationwide</span>
          </div>

          {/* Main Heading */}
          <h1 className={`text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold leading-[1.1] mb-6 sm:mb-8 tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <span className="block mb-2 sm:mb-3">Transform Your</span>
            <span className={`block ${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent animate-gradient`}>
              School Management
            </span>
          </h1>

          {/* Subtitle */}
          <p className={`text-base sm:text-xl md:text-2xl mb-10 sm:mb-12 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto leading-relaxed px-4`}>
            Complete ERP solution for modern education. Streamline admissions, academics, attendance, and communication—all in one powerful platform.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 sm:mb-16">
            <Link to="/login" className={`group inline-flex items-center justify-center gap-2 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500' : 'bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500'} text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto`}>
              Get Started Free
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a href="#demo" className={`inline-flex items-center justify-center gap-2 border-2 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 w-full sm:w-auto ${isDarkMode ? 'text-white border-white/30 hover:bg-white/10 hover:border-white/50' : 'text-gray-900 border-gray-300 hover:bg-gray-100 hover:border-gray-400'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Demo
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto">
            {[
              { value: '500+', label: 'Schools' },
              { value: '50K+', label: 'Students' },
              { value: '5K+', label: 'Teachers' },
              { value: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <div key={index} className={`p-4 sm:p-6 rounded-2xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white/80 border border-gray-200'} backdrop-blur-xl transform hover:scale-105 transition-all duration-300`}>
                <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-blue-400 to-purple-400' : 'bg-gradient-to-r from-blue-600 to-purple-600'} bg-clip-text text-transparent mb-1 sm:mb-2`}>
                  {stat.value}
                </div>
                <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apps Showcase */}
      <section id="apps" ref={appsReveal.elementRef} className={`py-12 sm:py-16 px-4 relative ${isDarkMode ? 'bg-gradient-to-b from-transparent via-blue-950/20 to-transparent' : 'bg-gradient-to-b from-transparent via-blue-50/50 to-transparent'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className={`text-center mb-12 sm:mb-16 transform-gpu transition-all duration-700 ${appsReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${isDarkMode ? 'bg-white/10 text-purple-300 ring-1 ring-white/20' : 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'} backdrop-blur-xl`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              <span className="font-semibold">Our Applications</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Complete Suite for{' '}
              <span className={`${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                Every Role
              </span>
            </h2>
            <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Dedicated mobile applications for administrators, teachers, and students
            </p>
          </div>

          {/* Apps Grid */}
          <div className="space-y-12 sm:space-y-20">
            {/* School Admin App */}
            <div className={`transform-gpu transition-all duration-700 delay-100 ${appsReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div className="order-2 lg:order-1">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${isDarkMode ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    FOR ADMINISTRATORS
                  </div>
                  <h3 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    TeachoVE
                    <span className={`block text-xl sm:text-2xl mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-normal`}>
                      School Admin Dashboard
                    </span>
                  </h3>
                  <p className={`text-base sm:text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Complete control over your school's operations. Manage teachers, students, staff, academics, and finances from one powerful dashboard.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {schoolAdminFeatures.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-100'} flex items-center justify-center flex-shrink-0`}>
                          <svg className={`w-3 h-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="https://play.google.com/store/apps/details?id=com.sms.my_school&hl=en_IN" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'} px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5l10 7-10 7V5z"/>
                    </svg>
                    Download on Google Play
                  </a>
                </div>
                <div className="order-1 lg:order-2 flex justify-center">
                  <div className="relative group">
                    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-blue-400 to-purple-400'} rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                    <img 
                      src={schoolAdminScreen} 
                      alt="School Admin Dashboard" 
                      className="relative w-64 sm:w-72 md:w-80 lg:w-96 h-auto rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Teacher App */}
            <div className={`transform-gpu transition-all duration-700 delay-200 ${appsReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-purple-400 to-pink-400'} rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                    <img 
                      src={teacherAdminScreen} 
                      alt="Teacher Dashboard" 
                      className="relative w-64 sm:w-72 md:w-80 lg:w-96 h-auto rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div>
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${isDarkMode ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'}`}>
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                    FOR TEACHERS
                  </div>
                  <h3 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    TeachoVE
                    <span className={`block text-xl sm:text-2xl mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-normal`}>
                      Teacher Portal
                    </span>
                  </h3>
                  <p className={`text-base sm:text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Empower teachers with tools to manage classrooms, track attendance, assign homework, and monitor student progress seamlessly.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {teacherAdminFeatures.slice(0, 6).map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-100'} flex items-center justify-center flex-shrink-0`}>
                          <svg className={`w-3 h-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <a href="https://play.google.com/store/apps/details?id=com.sms.my_school&hl=en_IN" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'} px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105`}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5l10 7-10 7V5z"/>
                      </svg>
                      Download App
                    </a>
                    <a href="https://youtu.be/BADVwshwaJE?si=BC0q-CyGickiX1mz" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 border-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 8l6 4-6 4V8z"/>
                      </svg>
                      Watch Demo
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Student App */}
            <div className={`transform-gpu transition-all duration-700 delay-300 ${appsReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                <div className="order-2 lg:order-1">
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${isDarkMode ? 'bg-pink-500/20 text-pink-300' : 'bg-pink-100 text-pink-700'}`}>
                    <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
                    FOR STUDENTS
                  </div>
                  <h3 className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    StudoVE
                    <span className={`block text-xl sm:text-2xl mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} font-normal`}>
                      Student Learning Hub
                    </span>
                  </h3>
                  <p className={`text-base sm:text-lg mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Everything students need in one place. Access homework, check attendance, view timetables, and stay connected with teachers and announcements.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      'View homework and assignments',
                      'Check attendance records',
                      'Access exam timetables',
                      'View class schedules',
                      'Track academic results',
                      'Receive announcements and notices'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full ${isDarkMode ? 'bg-pink-500/20' : 'bg-pink-100'} flex items-center justify-center flex-shrink-0`}>
                          <svg className={`w-3 h-3 ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <a href="https://play.google.com/store/apps/details?id=com.my_student&hl=en_IN" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'} px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105`}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5l10 7-10 7V5z"/>
                      </svg>
                      Download App
                    </a>
                    <a href="https://youtu.be/_UCVXDf-4d4?si=EdwOyNLuZhIKt6Sz" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-2 border-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${isDarkMode ? 'border-white/20 text-white hover:bg-white/10' : 'border-gray-300 text-gray-900 hover:bg-gray-100'}`}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M10 8l6 4-6 4V8z"/>
                      </svg>
                      Watch Demo
                    </a>
                  </div>
                </div>
                <div className="order-1 lg:order-2 flex justify-center">
                  <div className="relative group">
                    <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-r from-pink-500 to-blue-500' : 'bg-gradient-to-r from-pink-400 to-blue-400'} rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                    <img 
                      src={studentAdminScreen} 
                      alt="Student Dashboard" 
                      className="relative w-64 sm:w-72 md:w-80 lg:w-96 h-auto rounded-3xl shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" ref={featuresReveal.elementRef} className={`py-12 sm:py-16 px-4 relative ${isDarkMode ? 'bg-gradient-to-b from-transparent via-purple-950/20 to-transparent' : 'bg-gradient-to-b from-transparent via-purple-50/50 to-transparent'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className={`text-center mb-12 sm:mb-16 transform-gpu transition-all duration-700 ${featuresReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${isDarkMode ? 'bg-white/10 text-pink-300 ring-1 ring-white/20' : 'bg-pink-100 text-pink-700 ring-1 ring-pink-200'} backdrop-blur-xl`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
              </svg>
              <span className="font-semibold">Powerful Features</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Everything You Need to{' '}
              <span className={`${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                Run Your School
              </span>
            </h2>
            <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Comprehensive tools designed to simplify school management and enhance educational excellence
            </p>
          </div>

          {/* Features Grid */}
          <div className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 transform-gpu transition-all duration-700 ${featuresReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {[
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                title: 'Teacher Management', 
                desc: 'Complete teacher records and performance tracking',
                color: 'blue'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: 'Student Records', 
                desc: 'Comprehensive student information management',
                color: 'purple'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                title: 'Attendance Tracking', 
                desc: 'Automated attendance with detailed reports',
                color: 'pink'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Fee Management', 
                desc: 'Streamlined fee collection and tracking',
                color: 'blue'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
                title: 'Academic Management', 
                desc: 'Classes, subjects, and exam timetables',
                color: 'purple'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                ),
                title: 'Announcements', 
                desc: 'Real-time communication with staff and students',
                color: 'pink'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Event Management', 
                desc: 'Organize and track school events',
                color: 'blue'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: 'Leave Management', 
                desc: 'Approve and track leave requests',
                color: 'purple'
              },
              { 
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                title: 'Digital Library', 
                desc: 'Access to Vedant Education books',
                color: 'pink'
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`group relative rounded-2xl p-6 sm:p-8 border transition-all duration-500 hover:-translate-y-2 ${
                  isDarkMode 
                    ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20' 
                    : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-2xl'
                } backdrop-blur-xl`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl mb-4 ${
                  feature.color === 'blue' 
                    ? isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                    : feature.color === 'purple'
                    ? isDarkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                    : isDarkMode ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-100 text-pink-600'
                } transition-transform duration-300 group-hover:scale-110`}>
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className={`text-xl sm:text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>

                {/* Description */}
                <p className={`text-sm sm:text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                  {feature.desc}
                </p>

                {/* Gradient Border Bottom */}
                <div className={`absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent ${
                  feature.color === 'blue' 
                    ? 'via-blue-500' 
                    : feature.color === 'purple'
                    ? 'via-purple-500'
                    : 'via-pink-500'
                } to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps to Get Access Section */}
      <section className={`py-12 sm:py-16 px-4 ${isDarkMode ? 'bg-gradient-to-b from-transparent via-green-950/20 to-transparent' : 'bg-gradient-to-b from-transparent via-green-50/50 to-transparent'}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${isDarkMode ? 'bg-white/10 text-green-300 ring-1 ring-white/20' : 'bg-green-100 text-green-700 ring-1 ring-green-200'} backdrop-blur-xl`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Getting Started</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              How to Get{' '}
              <span className={`${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                Access
              </span>
            </h2>
            <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Start using VedanTech in three simple steps
            </p>
          </div>

          {/* Stepper */}
          <div className="relative max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-8 relative">
              {/* Connecting Line - Desktop (positioned between circles) */}
              <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 px-[16.66%]">
                <div className={`h-full w-full ${isDarkMode ? 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500' : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400'} opacity-40`}></div>
              </div>

              {/* Step 1: Contact Sales */}
              <div className="relative flex flex-col items-center text-center">
                {/* Circle with solid background */}
                <div className="relative z-20 mb-8">
                  <div className={`w-48 h-48 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'} shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300`}>
                    <div className="text-center">
                      <svg className="w-16 h-16 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div className="text-white text-xl font-bold">Step 1</div>
                    </div>
                  </div>
                </div>
                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-sm`}>
                  <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Contact Sales
                  </h3>
                  <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Reach out to our sales team through the contact form or call us directly
                  </p>
                </div>
              </div>

              {/* Step 2: Fill Details */}
              <div className="relative flex flex-col items-center text-center">
                {/* Circle with solid background */}
                <div className="relative z-20 mb-8">
                  <div className={`w-48 h-48 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'} shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300`}>
                    <div className="text-center">
                      <svg className="w-16 h-16 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div className="text-white text-xl font-bold">Step 2</div>
                    </div>
                  </div>
                </div>
                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-sm`}>
                  <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Fill Details
                  </h3>
                  <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Provide your school name, phone number, and email address for verification
                  </p>
                </div>
              </div>

              {/* Step 3: Get Access */}
              <div className="relative flex flex-col items-center text-center">
                {/* Circle with solid background */}
                <div className="relative z-20 mb-8">
                  <div className={`w-48 h-48 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-pink-500 to-pink-600' : 'bg-gradient-to-br from-pink-500 to-pink-600'} shadow-2xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300`}>
                    <div className="text-center">
                      <svg className="w-16 h-16 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div className="text-white text-xl font-bold">Step 3</div>
                    </div>
                  </div>
                </div>
                <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'} backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow duration-300 w-full max-w-sm`}>
                  <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Get Access
                  </h3>
                  <p className={`text-base ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Receive credentials for mobile apps and web portal to start managing your school
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12">
              <a href="#contact" className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500' : 'bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500'} text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}>
                Get Started Now
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Videos Section */}
      <section id="demo" className={`py-12 sm:py-16 px-4 ${isDarkMode ? 'bg-gradient-to-b from-transparent via-pink-950/20 to-transparent' : 'bg-gradient-to-b from-transparent via-pink-50/50 to-transparent'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${isDarkMode ? 'bg-white/10 text-blue-300 ring-1 ring-white/20' : 'bg-blue-100 text-blue-700 ring-1 ring-blue-200'} backdrop-blur-xl`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <span className="font-semibold">Product Demo</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              See It in{' '}
              <span className={`${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                Action
              </span>
            </h2>
            <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}>
              Watch how our platform works for different user roles
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                title: 'School Admin Demo',
                videoId: 'dgPEB2b3Jr4',
                color: 'blue',
                description: 'Complete school management dashboard'
              },
              {
                title: 'Teacher Portal Demo',
                videoId: 'BADVwshwaJE',
                color: 'purple',
                description: 'Classroom and student management'
              },
              {
                title: 'Student Portal Demo',
                videoId: '_UCVXDf-4d4',
                color: 'pink',
                description: 'Learning and homework tracking'
              }
            ].map((video, index) => (
              <div
                key={video.videoId}
                className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 ${
                  isDarkMode 
                    ? 'bg-white/5 border border-white/10 hover:bg-white/10' 
                    : 'bg-white border border-gray-200 hover:shadow-xl'
                }`}
              >
                <div className="relative aspect-video overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${video.videoId}`}
                    title={video.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="p-6">
                  <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {video.title}
                  </h3>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {video.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schools Using Our Platform Section */}
      <section className={`py-12 sm:py-16 px-4 ${isDarkMode ? 'bg-gradient-to-b from-transparent via-purple-950/20 to-transparent' : 'bg-gradient-to-b from-transparent via-purple-50/50 to-transparent'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${isDarkMode ? 'bg-white/10 text-green-300 ring-1 ring-white/20' : 'bg-green-100 text-green-700 ring-1 ring-green-200'} backdrop-blur-xl`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Trusted by Leading Schools</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Schools Using{' '}
              <span className={`${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                Our Platform
              </span>
            </h2>
            <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Join hundreds of educational institutions already transforming their management
            </p>
          </div>

          {/* Auto-scrolling School Logos */}
          <div className="relative overflow-hidden">
            {/* Gradient Overlays */}
            <div className={`absolute left-0 top-0 bottom-0 w-32 z-10 ${isDarkMode ? 'bg-gradient-to-r from-[#0A0E27] to-transparent' : 'bg-gradient-to-r from-white to-transparent'}`}></div>
            <div className={`absolute right-0 top-0 bottom-0 w-32 z-10 ${isDarkMode ? 'bg-gradient-to-l from-[#0A0E27] to-transparent' : 'bg-gradient-to-l from-white to-transparent'}`}></div>
            
            {/* Scrolling Container */}
            <div className="flex animate-scroll">
              {/* First set of logos */}
              <div className="flex gap-8 px-4">
                {[...Array(10)].map((_, index) => (
                  <div
                    key={`logo-1-${index}`}
                    className={`flex-shrink-0 w-24 h-24 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200'} shadow-lg`}
                  >
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                  </div>
                ))}
              </div>
              {/* Duplicate set for seamless loop */}
              <div className="flex gap-8 px-4">
                {[...Array(10)].map((_, index) => (
                  <div
                    key={`logo-2-${index}`}
                    className={`flex-shrink-0 w-24 h-24 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-white/10 border border-white/20' : 'bg-white border border-gray-200'} shadow-lg`}
                  >
                    <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" ref={ctaReveal.elementRef} className="py-12 sm:py-16 px-4">
        <div className={`max-w-6xl mx-auto transform-gpu transition-all duration-700 ${ctaReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className={`relative rounded-3xl overflow-hidden ${isDarkMode ? 'bg-gradient-to-br from-blue-500/80 via-purple-500/80 to-pink-500/80' : 'bg-gradient-to-br from-blue-400/80 via-purple-400/80 to-pink-400/80'} p-12 sm:p-16 shadow-2xl`}>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10 text-center">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-white">
                Ready to Transform Your School?
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto leading-relaxed">
                Join hundreds of schools already using our comprehensive management system to streamline operations and enhance education.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
                <Link to="/login" className="group inline-flex items-center justify-center gap-2 bg-white/95 text-purple-600 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105">
                  Start Free Trial
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <a href="#contact" className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-300 hover:bg-white/20 hover:border-white/60 backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Us
                </a>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-semibold">Cancel anytime</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className={`py-12 sm:py-16 px-4 ${isDarkMode ? 'bg-gradient-to-b from-transparent via-blue-950/20 to-transparent' : 'bg-gradient-to-b from-transparent via-blue-50/50 to-transparent'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6 ${isDarkMode ? 'bg-white/10 text-purple-300 ring-1 ring-white/20' : 'bg-purple-100 text-purple-700 ring-1 ring-purple-200'} backdrop-blur-xl`}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="font-semibold">Get in Touch</span>
            </div>
            <h2 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Let's Talk About{' '}
              <span className={`${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent`}>
                Your School
              </span>
            </h2>
            <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
              Fill out the form below and we'll get back to you shortly
            </p>
          </div>

          {showThankYou ? (
            <div className={`p-12 sm:p-16 text-center ${isDarkMode ? 'bg-white/5 border-2 border-white/10' : 'bg-white border-2 border-gray-200'} shadow-2xl`}>
              <div className={`inline-flex h-24 w-24 rounded-full ${isDarkMode ? 'bg-gradient-to-br from-green-500/20 to-green-600/20' : 'bg-gradient-to-br from-green-50 to-green-100'} items-center justify-center mb-6 mx-auto ring-4 ${isDarkMode ? 'ring-green-500/30' : 'ring-green-200'}`}>
                <svg className={`w-12 h-12 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-3xl sm:text-4xl font-extrabold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Thank You!
              </h3>
              <p className={`text-lg sm:text-xl ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-md mx-auto`}>
                We've received your message and will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactFormSubmit} className={`p-8 sm:p-12 ${isDarkMode ? 'bg-white/5 border-2 border-white/10' : 'bg-white border-2 border-gray-200'} shadow-2xl`}>
              <div className="space-y-8">
                {/* School Name and Email in one row */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* School Name */}
                  <div>
                    <label htmlFor="schoolName" className={`block text-sm font-bold mb-3 uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      School Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        id="schoolName"
                        name="schoolName"
                        value={contactForm.schoolName}
                        onChange={handleContactFormChange}
                        required
                        className={`w-full pl-12 pr-4 py-4 border-2 focus:ring-4 transition-all duration-300 outline-none font-medium ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/20 text-white placeholder-gray-500 focus:bg-white/10 focus:border-blue-500 focus:ring-blue-500/20' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-500 focus:ring-blue-500/20'
                        }`}
                        placeholder="Your School Name"
                      />
                    </div>
                  </div>

                  {/* School Email */}
                  <div>
                    <label htmlFor="schoolEmail" className={`block text-sm font-bold mb-3 uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      School Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        id="schoolEmail"
                        name="schoolEmail"
                        value={contactForm.schoolEmail}
                        onChange={handleContactFormChange}
                        required
                        className={`w-full pl-12 pr-4 py-4 border-2 focus:ring-4 transition-all duration-300 outline-none font-medium ${
                          isDarkMode 
                            ? 'bg-white/5 border-white/20 text-white placeholder-gray-500 focus:bg-white/10 focus:border-purple-500 focus:ring-purple-500/20' 
                            : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-purple-500 focus:ring-purple-500/20'
                        }`}
                        placeholder="school@example.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className={`block text-sm font-bold mb-3 uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Message <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className={`absolute left-4 top-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <textarea
                      id="message"
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactFormChange}
                      required
                      rows={6}
                      className={`w-full pl-12 pr-4 py-4 border-2 focus:ring-4 transition-all duration-300 outline-none resize-none font-medium ${
                        isDarkMode 
                          ? 'bg-white/5 border-white/20 text-white placeholder-gray-500 focus:bg-white/10 focus:border-pink-500 focus:ring-pink-500/20' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-pink-500 focus:ring-pink-500/20'
                      }`}
                      placeholder="Tell us about your school and how we can help..."
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className={`group w-full ${isDarkMode ? 'bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500' : 'bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500'} text-white py-5 px-8 font-extrabold text-lg uppercase tracking-wider transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] flex items-center justify-center gap-3`}
                >
                  <span>Send Message</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-12 sm:py-16 px-4 ${isDarkMode ? 'bg-[#0A0E27] border-white/10' : 'bg-gray-50 border-gray-200'} border-t`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
            {/* Brand + Store Buttons */}
            <div className="sm:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-xl ${isDarkMode ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500' : 'bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600'} shadow-lg flex items-center justify-center`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className={`text-2xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600'} bg-clip-text text-transparent`}>VedanTech</span>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6 max-w-sm leading-relaxed`}>
                Comprehensive ERP solution for modern schools. Streamline administration, academics, and communication—all in one powerful platform.
              </p>
              <div className="flex flex-col gap-3 mb-6">
                <a
                  href="https://play.google.com/store/apps/details?id=com.sms.my_school&hl=en_IN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl shadow-md border transition-all duration-300 hover:scale-105 max-w-xs ${isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-900 hover:shadow-lg'}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-500"><path d="M8 5l10 7-10 7V5z"/></svg>
                  <div className="text-left leading-tight">
                    <div className="text-xs opacity-70">Download TeachoVE</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.my_student&hl=en_IN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl shadow-md border transition-all duration-300 hover:scale-105 max-w-xs ${isDarkMode ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-white border-gray-200 text-gray-900 hover:shadow-lg'}`}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-green-500"><path d="M8 5l10 7-10 7V5z"/></svg>
                  <div className="text-left leading-tight">
                    <div className="text-xs opacity-70">Download StudoVE</div>
                    <div className="text-sm font-bold">Google Play</div>
                  </div>
                </a>
              </div>
              <a href="#contact" className={`inline-flex items-center gap-2 ${isDarkMode ? 'bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500' : 'bg-gradient-to-br from-blue-500/90 via-purple-500/90 to-pink-500/90 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500'} text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}>
                Contact Us
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Quick Links</h4>
              <ul className="space-y-4">
                <li><Link to="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors inline-flex items-center gap-2 group`}>
                  <span className="group-hover:translate-x-1 transition-transform">Home</span>
                </Link></li>
                <li><a href="#apps" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors inline-flex items-center gap-2 group`}>
                  <span className="group-hover:translate-x-1 transition-transform">Our Apps</span>
                </a></li>
                <li><a href="#features" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors inline-flex items-center gap-2 group`}>
                  <span className="group-hover:translate-x-1 transition-transform">Features</span>
                </a></li>
                <li><a href="#contact" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors inline-flex items-center gap-2 group`}>
                  <span className="group-hover:translate-x-1 transition-transform">Contact</span>
                </a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors inline-flex items-center gap-2 group`}>
                  <span className="group-hover:translate-x-1 transition-transform">Privacy Policy</span>
                </a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Contact Us</h4>
              <ul className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-4 text-sm`}>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Narhe, Pune,<br />Maharashtra - 411041</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+919766117311" className="hover:underline">+91 97661 17311</a>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:vedanteducation.22@gmail.com" className="hover:underline break-all">vedanteducation.22@gmail.com</a>
                </li>
              </ul>
              <div className="mt-6 flex items-center gap-3">
                <a href="#" aria-label="Facebook" className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 ${isDarkMode ? 'border-white/10 text-gray-300 hover:bg-white/10 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" aria-label="Instagram" className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 ${isDarkMode ? 'border-white/10 text-gray-300 hover:bg-white/10 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/><path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" aria-label="LinkedIn" className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 ${isDarkMode ? 'border-white/10 text-gray-300 hover:bg-white/10 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
                <a href="#" aria-label="YouTube" className={`h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 ${isDarkMode ? 'border-white/10 text-gray-300 hover:bg-white/10 hover:text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className={`pt-8 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                © 2025 VedanTech. All Rights Reserved.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>Privacy Policy</a>
                <a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}>Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 