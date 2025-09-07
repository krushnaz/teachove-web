import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDarkMode } from '../../contexts/DarkModeContext';

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

  // Enforce smooth scrolling for anchor navigation
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'smooth';
    return () => {
      root.style.scrollBehavior = previous;
    };
  }, []);

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
    <div className={`min-h-screen scroll-smooth relative ${isDarkMode ? 'dark bg-gray-950' : 'bg-gray-50'}`}>
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-[48px] bg-gradient-to-r from-primary-500/10 via-fuchsia-500/10 to-emerald-500/10 blur-2xl" />
        <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),rgba(255,255,255,0)_60%)] ${isDarkMode ? 'opacity-20' : 'opacity-60'}`} />
      </div>

      {/* Navigation */}
      <nav className={`${isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-white/70 border-gray-200'} border-b sticky top-0 z-50 backdrop-blur-md`}> 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-fuchsia-500 shadow-md" />
              <h1 className={`text-xl sm:text-2xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                <span className="bg-gradient-to-r from-primary-500 via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent">VedanTech</span>
                <span className={`ml-2 text-xs sm:text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>ERP Suite</span>
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#apps" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:text-primary-500 transition-colors`}>Apps</a>
              <a href="#features" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:text-primary-500 transition-colors`}>Features</a>
              <a href="#cta" className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} hover:text-primary-500 transition-colors`}>Demo</a>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleDarkMode}
                aria-label="Toggle dark mode"
                className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
              <Link to="/login" className="hidden sm:inline-flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroReveal.elementRef} className="py-20 px-4 relative">
        <div className={`max-w-7xl mx-auto text-center transform-gpu transition-all duration-700 ${heroReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm mb-6 ring-1 ${isDarkMode ? 'ring-white/10 text-gray-300' : 'ring-gray-900/10 text-gray-600'} bg-white/70 dark:bg-gray-900/40 backdrop-blur`}> 
            <span>Modern • Scalable • Secure</span>
          </div>
          <h1 className={`text-5xl md:text-7xl font-extrabold leading-tight mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Run Your School On
            <span className="block bg-gradient-to-r from-primary-500 via-fuchsia-500 to-emerald-500 bg-clip-text text-transparent">One Powerful Platform</span>
          </h1>
          <p className={`text-lg md:text-2xl mb-10 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto`}> 
            Streamline admissions, academics, attendance, communication, and finances with an integrated ERP built for speed and clarity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="inline-flex items-center justify-center bg-primary-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-600 transition-colors shadow-md">
              Get Started
            </Link>
            <a href="#apps" className={`inline-flex items-center justify-center border-2 px-8 py-4 rounded-xl text-lg font-semibold transition-colors ${isDarkMode ? 'text-white border-white/30 hover:bg-white/10' : 'text-primary-600 border-primary-500 hover:bg-primary-50'}`}> 
              Explore Apps
            </a>
          </div>
        </div>
      </section>

      {/* Apps Showcase */}
      <section id="apps" ref={appsReveal.elementRef} className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl font-bold text-center mb-16 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Our Applications</h2>

          <div className={`grid md:grid-cols-2 gap-12 transform-gpu transition-all duration-700 ${appsReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {/* TeachoVE */}
            <div className={`group relative rounded-2xl p-[1px] ${isDarkMode ? 'bg-gradient-to-br from-white/10 via-primary-500/20 to-fuchsia-500/20' : 'bg-gradient-to-br from-white via-primary-500/20 to-fuchsia-500/20'} shadow-xl`}> 
              <div className={`rounded-2xl p-8 h-full ${isDarkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white/90 border-gray-200'} border backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-1`}> 
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-md">
                    T
                  </div>
                  <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>TeachoVE</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>School Administration & Teacher Management</p>
                </div>
                <div className="space-y-4">
                  <h4 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>School Admin Features</h4>
                  <ul className="space-y-3">
                    {schoolAdminFeatures.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start space-x-3"
                        style={{ transitionDelay: `${index * 35}ms` }}
                      >
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary-500/10 text-primary-600">✓</span>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* StudoVE */}
            <div className={`group relative rounded-2xl p-[1px] ${isDarkMode ? 'bg-gradient-to-br from-white/10 via-emerald-500/20 to-primary-500/20' : 'bg-gradient-to-br from-white via-emerald-500/20 to-primary-500/20'} shadow-xl`}> 
              <div className={`rounded-2xl p-8 h-full ${isDarkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white/90 border-gray-200'} border backdrop-blur-md transition-transform duration-300 group-hover:-translate-y-1`}> 
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-primary-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-md">
                    S
                  </div>
                  <h3 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>StudoVE</h3>
                  <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Student Portal & Learning Management</p>
                </div>
                <div className="space-y-4">
                  <h4 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Teacher Admin Features</h4>
                  <ul className="space-y-3">
                    {teacherAdminFeatures.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start space-x-3"
                        style={{ transitionDelay: `${index * 35}ms` }}
                      >
                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">✓</span>
                        <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" ref={featuresReveal.elementRef} className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className={`text-4xl font-bold text-center mb-16 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Key Features</h2>

          <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-8 transform-gpu transition-all duration-700 ${featuresReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            {[
              { icon: '👨‍🏫', title: 'Teacher Management', desc: 'Complete teacher records and performance tracking' },
              { icon: '👨‍🎓', title: 'Student Records', desc: 'Comprehensive student information management' },
              { icon: '📊', title: 'Attendance Tracking', desc: 'Automated attendance with detailed reports' },
              { icon: '💰', title: 'Fee Management', desc: 'Streamlined fee collection and tracking' },
              { icon: '📚', title: 'Academic Management', desc: 'Classes, subjects, and exam timetables' },
              { icon: '📢', title: 'Announcements', desc: 'Real-time communication with staff and students' },
              { icon: '📅', title: 'Event Management', desc: 'Organize and track school events' },
              { icon: '📝', title: 'Leave Management', desc: 'Approve and track leave requests' },
              { icon: '📖', title: 'Digital Library', desc: 'Access to Vedant Education books' }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`relative rounded-xl p-6 border shadow-lg hover:shadow-xl transition-shadow ${isDarkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur-md`}
                style={{ transitionDelay: `${index * 40}ms` }}
              >
                <div className="text-4xl mb-4 select-none">{feature.icon}</div>
                <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{feature.desc}</p>
                <div className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" ref={ctaReveal.elementRef} className="py-20 px-4">
        <div className={`max-w-4xl mx-auto text-center transform-gpu transition-all duration-700 ${ctaReveal.revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className={`rounded-2xl p-[1px] ${isDarkMode ? 'bg-gradient-to-r from-primary-500/30 via-fuchsia-500/30 to-emerald-500/30' : 'bg-gradient-to-r from-primary-500/40 via-fuchsia-500/40 to-emerald-500/40'} shadow-2xl`}> 
            <div className={`${isDarkMode ? 'bg-gray-900/70 border-gray-800' : 'bg-white/90 border-gray-200'} border rounded-2xl px-8 py-12 backdrop-blur-md`}> 
              <h2 className={`text-4xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Ready to Transform Your School?</h2>
              <p className={`text-lg mb-8 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Join schools already using our comprehensive management system.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login" className="bg-primary-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-600 transition-colors shadow-md">
                  Start Free Trial
                </Link>
                <a href="#features" className={`border-2 px-8 py-4 rounded-lg text-lg font-semibold transition-colors ${isDarkMode ? 'text-white border-white/30 hover:bg-white/10' : 'text-primary-600 border-primary-500 hover:bg-primary-50'}`}> 
                  View Features
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-16 px-4 ${isDarkMode ? 'bg-gray-900/60 border-gray-800' : 'bg-gray-100/80 border-gray-200'} border-t backdrop-blur`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10">
            {/* Brand + Store Buttons */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary-500 to-fuchsia-500 shadow-md" />
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>VedanTech</span>
              </div>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
                Unified ERP for schools: administration, academics, finance, and communication.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://play.google.com/store/apps/details?id=com.sms.my_school&hl=en_IN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg shadow-sm border transition-colors ${isDarkMode ? 'bg-gray-900/70 border-gray-800 text-white hover:bg-gray-800' : 'bg-white/90 border-gray-200 text-gray-900 hover:bg-gray-50'}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-primary-500"><path d="M8 5l10 7-10 7V5z"/></svg>
                  <div className="text-left leading-tight">
                    <div className="text-xs opacity-70">Get it on</div>
                    <div className="text-sm font-semibold">Google Play • TeachoVE</div>
                  </div>
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.my_student&hl=en_IN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg shadow-sm border transition-colors ${isDarkMode ? 'bg-gray-900/70 border-gray-800 text-white hover:bg-gray-800' : 'bg-white/90 border-gray-200 text-gray-900 hover:bg-gray-50'}`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="text-emerald-500"><path d="M8 5l10 7-10 7V5z"/></svg>
                  <div className="text-left leading-tight">
                    <div className="text-xs opacity-70">Get it on</div>
                    <div className="text-sm font-semibold">Google Play • StudoVE</div>
                  </div>
                </a>
              </div>
              <div className="mt-4">
                <a href="#cta" className="inline-flex items-center px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors">Schedule Demo</a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Quick Links</h4>
              <ul className="space-y-3">
                <li><Link to="/" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Home</Link></li>
                <li><a href="#features" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Features</a></li>
                <li><a href="#pricing" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Pricing</a></li>
                <li><a href="#cta" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Contact Us</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Privacy Policy</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors`}>Terms & Conditions</a></li>
              </ul>
            </div>

            {/* Contact + Social */}
            <div>
              <h4 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Contact</h4>
              <ul className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} space-y-3 text-sm`}>
                <li>📍 Address: [Your School/Company Address]</li>
                <li>📞 Phone: +91-XXXXXXXXXX</li>
                <li>📧 Email: <a href="mailto:support@yourapp.com" className="underline decoration-dotted">support@yourapp.com</a></li>
              </ul>
              <div className="mt-4 flex items-center gap-3">
                <a href="#" aria-label="Facebook" className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors ${isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-white/10' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  <span className="text-sm font-semibold">f</span>
                </a>
                <a href="#" aria-label="Instagram" className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors ${isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-white/10' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  <span className="text-sm font-semibold">IG</span>
                </a>
                <a href="#" aria-label="LinkedIn" className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors ${isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-white/10' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  <span className="text-sm font-semibold">in</span>
                </a>
                <a href="#" aria-label="YouTube" className={`h-9 w-9 rounded-full border flex items-center justify-center transition-colors ${isDarkMode ? 'border-gray-800 text-gray-300 hover:bg-white/10' : 'border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 8l6 4-6 4V8z"/></svg>
                </a>
              </div>
            </div>
          </div>

          <div className={`mt-10 pt-6 border-t text-center ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>© 2025 VedanTech . All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 