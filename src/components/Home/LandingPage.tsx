import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useDarkMode } from "../../contexts/DarkModeContext";
import schoolAdminScreen from "../../assets/appScreenshorts/schoolAdminHomeScreen.jpg";
import teacherAdminScreen from "../../assets/appScreenshorts/teacherAdminHomeScreen.jpg";
import studentAdminScreen from "../../assets/appScreenshorts/studentAdminHomeScreen.jpg";

// --- Utility Hook ---
function useReveal<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const elementRef = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!elementRef.current || revealed) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    }, options || { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    observer.observe(elementRef.current);
    return () => observer.disconnect();
  }, [revealed, options]);

  return { elementRef, revealed } as const;
}

const LandingPage: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const [contactForm, setContactForm] = useState({
    schoolName: "",
    schoolEmail: "",
    message: "",
  });
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollBehavior = "smooth";
    return () => {
      root.style.scrollBehavior = "auto";
    };
  }, []);

  const handleContactFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactForm({ ...contactForm, [e.target.name]: e.target.value });
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowThankYou(true);
    setContactForm({ schoolName: "", schoolEmail: "", message: "" });
    setTimeout(() => {
      setShowThankYou(false);
    }, 5000);
  };

  const heroReveal = useReveal<HTMLDivElement>();
  const appsReveal = useReveal<HTMLDivElement>();
  const featuresReveal = useReveal<HTMLDivElement>();
  const ctaReveal = useReveal<HTMLDivElement>();

  // Primary color
  const primaryColor = "#1a6ba8";
  const primaryColorLight = "#4a8bc2";
  const primaryColorDark = "#0d4a73";
  
  // Shared Styles - Simple box design
  const boxClass = isDarkMode
    ? "bg-[#0d4a73] border-[#1a6ba8] hover:border-[#4a8bc2] shadow-lg"
    : "bg-white border-[#1a6ba8]/20 hover:border-[#1a6ba8] shadow-lg";

  const textPrimary = "text-[#1a6ba8]";

  // Line pattern background
  const linePattern = isDarkMode 
    ? `linear-gradient(to right, ${primaryColor}15 1px, transparent 1px), linear-gradient(to bottom, ${primaryColor}15 1px, transparent 1px)`
    : `linear-gradient(to right, ${primaryColor}08 1px, transparent 1px), linear-gradient(to bottom, ${primaryColor}08 1px, transparent 1px)`;

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden selection:bg-[#1a6ba8] selection:text-white font-sans"
      style={{
        backgroundColor: isDarkMode ? "#0a1f2e" : "#f5f8fa",
        color: isDarkMode ? "#e0e8f0" : "#1a1a1a",
        backgroundImage: linePattern,
        backgroundSize: "40px 40px"
      }}
    >

      {/* --- Navigation --- */}
      <nav
        className="fixed w-full top-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: isDarkMode ? "rgba(10, 31, 46, 0.95)" : "rgba(245, 248, 250, 0.95)",
          backdropFilter: "blur(10px)"
        }}
      >
        <div className="w-full max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
              >
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ color: primaryColor }}
              >
                Vedant Education
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-10">
              {["Apps", "Features", "Demo", "Contact"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: isDarkMode ? "#cbd5e0" : "#4a5568"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? "#cbd5e0" : "#4a5568"}
                >
                  {item}
                </a>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-lg transition-all"
                style={{
                  backgroundColor: isDarkMode ? "rgba(26, 107, 168, 0.2)" : "#e2e8f0",
                  color: isDarkMode ? "#fbbf24" : "#4a5568"
                }}
              >
                {isDarkMode ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg hover:opacity-90 active:scale-95"
                style={{ backgroundColor: primaryColor }}
              >
                Login Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section
        ref={heroReveal.elementRef}
        className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 px-4 z-10 min-h-screen flex items-center"
      >
        <div
          className={`w-full max-w-full mx-auto text-center transition-all duration-1000 transform px-6 sm:px-8 lg:px-12 ${
            heroReveal.revealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          {/* Pill Badge */}
          <div 
            className="inline-flex items-center justify-center p-1 mb-8 rounded-full border"
            style={{
              backgroundColor: isDarkMode ? "rgba(26, 107, 168, 0.2)" : "rgba(26, 107, 168, 0.1)",
              borderColor: primaryColor
            }}
          >
            <div
              className="px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase"
              style={{ backgroundColor: primaryColor, color: "white" }}
            >
              New
            </div>
            <span
              className="px-4 text-sm font-medium"
              style={{ color: isDarkMode ? "#cbd5e0" : "#1a1a1a" }}
            >
              Trusted by 500+ Schools Nationwide
            </span>
          </div>

          {/* Headline */}
          <h1
            className="max-w-5xl mx-auto text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.1]"
            style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
          >
            The Future of <br className="hidden md:block" />
            <span style={{ color: primaryColor }}>
              School Management
            </span>
          </h1>

          {/* Tagline */}
          <p
            className="max-w-3xl mx-auto text-2xl sm:text-3xl font-semibold mb-10 leading-relaxed"
            style={{ color: isDarkMode ? "#ffffff" : "#000000" }}
          >
            Everything Your School Needs, in One Place — uniting administrators, teachers, and students to simplify education.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white transition-all rounded-xl hover:opacity-90 active:scale-95"
              style={{ backgroundColor: primaryColor }}
            >
              Get Started Free
            </Link>
            <a
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 text-lg font-bold transition-all border-2 rounded-xl hover:opacity-90 active:scale-95 flex items-center justify-center gap-2"
              style={{
                borderColor: primaryColor,
                color: primaryColor,
                backgroundColor: isDarkMode ? "transparent" : "transparent"
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Watch Demo
            </a>
          </div>

          {/* Stats Grid - Box Design with varied rounded corners */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { label: "Schools", value: "500+", rounded: "rounded-xl" },
              { label: "Students", value: "50K+", rounded: "rounded-2xl" },
              { label: "Teachers", value: "5K+", rounded: "rounded-xl" },
              { label: "Uptime", value: "99.9%", rounded: "rounded-2xl" },
            ].map((stat, idx) => (
              <div
                key={idx}
                className={`p-6 ${stat.rounded} border transition-all hover:scale-105 ${boxClass}`}
              >
                <div
                  className="text-3xl font-bold mb-1"
                  style={{ color: primaryColor }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-sm font-medium uppercase tracking-wide"
                  style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Premium App Suite Section --- */}
      <section
        id="apps"
        ref={appsReveal.elementRef}
        className="py-32 relative z-10 overflow-hidden w-full"
        style={{
          backgroundColor: isDarkMode ? "#0a1f2e" : "#f5f8fa"
        }}
      >

        <div className="relative w-full max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          {/* Section Header */}
          <div
            className={`text-center mb-20 transition-all duration-1000 ease-out ${
              appsReveal.revealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-6"
              style={{
                backgroundColor: isDarkMode ? "rgba(26, 107, 168, 0.2)" : "rgba(26, 107, 168, 0.1)",
                borderColor: primaryColor
              }}
            >
              <span 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: primaryColor }}
              />
              <span 
                className="text-sm font-medium"
                style={{ color: isDarkMode ? '#cbd5e0' : '#1a1a1a' }}
              >
                Complete Ecosystem
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight"
              style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
            >
              A Suite for{" "}
              <span style={{ color: primaryColor }}>
                Every Role
              </span>
            </h2>
            <p
              className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
              style={{ color: isDarkMode ? "#94a3b8" : "#4a5568" }}
            >
              Seamlessly connected applications designed to transform how schools operate
            </p>
          </div>

          {/* App Cards Grid - Single Box Container */}
          <div
            className={`relative rounded-2xl overflow-hidden ${boxClass} transition-all duration-1000 ease-out ${
              appsReveal.revealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-12"
            }`}
          >
            <div className="p-8 lg:p-12 space-y-8 lg:space-y-12">
            {[
              {
                title: "School Admin",
                subtitle: "Complete Command Center",
                desc: "Manage admissions, staff, finances, and academics from a single powerful dashboard designed for school administrators.",
                img: schoolAdminScreen,
                gradient: "from-emerald-400 to-teal-500",
                bgGradient: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
                accentColor: "emerald",
                features: ["Fee Management", "Staff Records", "Event Planning", "Reports"],
                link: "https://play.google.com/store/apps/details?id=com.sms.my_school&hl=en_IN",
                floatingCards: [
                  { type: "stat", label: "Active Users", value: "12.5K", icon: "users" },
                  { type: "notification", text: "Fee payment received ₹15,000" },
                  { type: "badge", label: "99.9% Uptime" },
                ],
              },
              {
                title: "Teacher Portal",
                subtitle: "Classroom Companion",
                desc: "Empower educators with digital attendance tracking, homework management, and comprehensive result processing tools.",
                img: teacherAdminScreen,
                gradient: "from-violet-400 to-purple-500",
                bgGradient: "from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
                accentColor: "violet",
                features: ["Attendance", "Homework", "Exam Results", "Gradebook"],
                link: "https://play.google.com/store/apps/details?id=com.sms.my_school&hl=en_IN",
                swap: true,
                floatingCards: [
                  { type: "chat", text: "Homework submitted", sender: "Class 10A" },
                  { type: "stat", label: "Attendance", value: "98%", icon: "check" },
                  { type: "notification", text: "5 assignments to review" },
                ],
              },
              {
                title: "StudoVE Learning",
                subtitle: "Student Hub",
                desc: "Keep students engaged with easy access to timetables, results, notices, and direct communication with teachers.",
                img: studentAdminScreen,
                gradient: "from-orange-400 to-rose-500",
                bgGradient: "from-orange-50 to-rose-50 dark:from-orange-950/20 dark:to-rose-950/20",
                accentColor: "orange",
                features: ["Timetables", "Notices", "Performance", "Resources"],
                link: "https://play.google.com/store/apps/details?id=com.my_student&hl=en_IN",
                floatingCards: [
                  { type: "grade", subject: "Mathematics", grade: "A+" },
                  { type: "notification", text: "New timetable available" },
                  { type: "badge", label: "Top 10%" },
                ],
              },
            ].map((app, idx) => (
              <div
                key={idx}
                className={`transition-all duration-1000 ease-out ${idx > 0 ? 'pt-8 lg:pt-12 border-t' : ''}`}
                style={{ 
                  transitionDelay: `${idx * 200}ms`,
                  borderColor: idx > 0 ? primaryColor + "20" : "transparent"
                }}
              >
                {/* App Card Content */}
                <div
                  className="relative"
                >
                  <div className={`relative grid lg:grid-cols-2 gap-8 lg:gap-16 p-8 lg:p-16 ${app.swap ? 'lg:[direction:rtl]' : ''}`}>
                    
                    {/* Content Side */}
                    <div className={`flex flex-col justify-center ${app.swap ? 'lg:[direction:ltr]' : ''}`}>
                      {/* Badge */}
                      <div 
                        className="inline-flex items-center self-start gap-2 px-4 py-2 rounded-xl text-white text-sm font-semibold mb-6"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        For {app.title.split(" ")[0]}s
                      </div>
                      
                      {/* Title */}
                      <h3 
                        className="text-3xl lg:text-4xl font-bold mb-3"
                        style={{ color: isDarkMode ? '#ffffff' : '#1a1a1a' }}
                      >
                        {app.title}
                      </h3>
                      
                      {/* Subtitle */}
                      <p 
                        className="text-xl font-medium mb-6"
                        style={{ color: primaryColor }}
                      >
                        {app.subtitle}
                      </p>
                      
                      {/* Description */}
                      <p 
                        className="text-lg leading-relaxed mb-8"
                        style={{ color: isDarkMode ? '#94a3b8' : '#4a5568' }}
                      >
                        {app.desc}
                      </p>
                      
                      {/* Features */}
                      <div className="flex flex-wrap gap-3 mb-10">
                        {app.features.map((feature, i) => (
                          <span
                            key={i}
                            className={`px-4 py-2 ${i % 2 === 0 ? 'rounded-xl' : 'rounded-lg'} text-sm font-medium transition-all duration-300 border`}
                            style={{
                              backgroundColor: isDarkMode ? "rgba(26, 107, 168, 0.2)" : "#ffffff",
                              borderColor: primaryColor,
                              color: isDarkMode ? '#cbd5e0' : '#1a1a1a'
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      
                      {/* CTA */}
                      <a
                        href={app.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 self-start"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                        Download on Play Store
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </a>
                    </div>
                    
                    {/* Phone Mockup Side */}
                    <div className={`relative flex items-center justify-center ${app.swap ? 'lg:[direction:ltr]' : ''}`}>
                      {/* Phone mockup */}
                      <div className="relative">
                        <div 
                          className="relative rounded-3xl overflow-hidden shadow-2xl border bg-slate-900"
                          style={{ 
                            borderColor: isDarkMode ? '#1a6ba8' : '#1a6ba8',
                            borderWidth: '1px'
                          }}
                        >
                          <img
                            src={app.img}
                            alt={app.title}
                            className="w-[260px] md:w-[280px] lg:w-[300px] object-cover"
                          />
                        </div>
                        
                        {/* Floating UI Cards */}
                        {app.floatingCards.map((card, cardIdx) => (
                          <div
                            key={cardIdx}
                            className={`absolute ${
                              cardIdx === 0 ? '-left-16 top-16' :
                              cardIdx === 1 ? '-right-12 top-1/3' :
                              '-left-8 bottom-24'
                            } ${cardIdx === 0 ? 'rounded-xl' : cardIdx === 1 ? 'rounded-2xl' : 'rounded-lg'} border shadow-lg px-4 py-3`}
                            style={{
                              backgroundColor: isDarkMode ? '#0d4a73' : '#ffffff',
                              borderColor: primaryColor
                            }}
                          >
                            {card.type === 'stat' && 'value' in card && (
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <div>
                                  <p 
                                    className="text-xs"
                                    style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}
                                  >
                                    {card.label}
                                  </p>
                                  <p 
                                    className="text-lg font-bold"
                                    style={{ color: isDarkMode ? '#ffffff' : '#1a1a1a' }}
                                  >
                                    {card.value}
                                  </p>
                                </div>
                              </div>
                            )}
                            {card.type === 'notification' && (
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: primaryColorLight + '40' }}
                                >
                                  <svg 
                                    className="w-4 h-4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    style={{ color: primaryColor }}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <p 
                                  className="text-sm font-medium"
                                  style={{ color: isDarkMode ? '#cbd5e0' : '#1a1a1a' }}
                                >
                                  {card.text}
                                </p>
                              </div>
                            )}
                            {card.type === 'badge' && (
                              <div 
                                className="flex items-center gap-2 px-3 py-1 rounded-lg text-white text-sm font-semibold"
                                style={{ backgroundColor: primaryColor }}
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                {card.label}
                              </div>
                            )}
                            {card.type === 'chat' && 'sender' in card && (
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: primaryColorLight + '40' }}
                                >
                                  <svg 
                                    className="w-5 h-5" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                    style={{ color: primaryColor }}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                  </svg>
                                </div>
                                <div>
                                  <p 
                                    className="text-xs"
                                    style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}
                                  >
                                    {card.sender}
                                  </p>
                                  <p 
                                    className="text-sm font-medium"
                                    style={{ color: isDarkMode ? '#cbd5e0' : '#1a1a1a' }}
                                  >
                                    {card.text}
                                  </p>
                                </div>
                              </div>
                            )}
                            {card.type === 'grade' && 'grade' in card && 'subject' in card && (
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  {card.grade}
                                </div>
                                <div>
                                  <p 
                                    className="text-xs"
                                    style={{ color: isDarkMode ? '#94a3b8' : '#64748b' }}
                                  >
                                    Latest Grade
                                  </p>
                                  <p 
                                    className="text-sm font-semibold"
                                    style={{ color: isDarkMode ? '#ffffff' : '#1a1a1a' }}
                                  >
                                    {card.subject}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      </section>


      {/* --- Features Grid --- */}
      <section
        id="features"
        ref={featuresReveal.elementRef}
        className="py-24 relative z-10 border-y w-full"
        style={{
          backgroundColor: isDarkMode ? "#0a1f2e" : "#f5f8fa",
          borderColor: primaryColor + "40"
        }}
      >
        <div className="max-w-full mx-auto px-4">
          <div
            className={`text-center mb-16 ${
              featuresReveal.revealed
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            } transition-all duration-700`}
          >
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
            >
              Powerful Capabilities
            </h2>
            <p
              className="max-w-2xl mx-auto"
              style={{ color: isDarkMode ? "#94a3b8" : "#4a5568" }}
            >
              Tools designed to handle the complexity of modern education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Teacher Management",
                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
              },
              {
                title: "Student Records",
                icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
              },
              {
                title: "Smart Attendance",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
              },
              {
                title: "Fee Management",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                title: "Exam Scheduler",
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
              },
              {
                title: "Digital Library",
                icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`group p-8 ${idx % 3 === 0 ? 'rounded-xl' : idx % 3 === 1 ? 'rounded-2xl' : 'rounded-lg'} border transition-all duration-300 hover:-translate-y-1 ${boxClass}`}
              >
                <div
                  className="w-12 h-12 rounded-lg mb-6 flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: primaryColor + "20",
                    color: primaryColor
                  }}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: isDarkMode ? "#94a3b8" : "#4a5568" }}
                >
                  Streamline your workflow with our advanced{" "}
                  {feature.title.toLowerCase()} module.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Benefits Section --- */}
      <section 
        className="py-24 relative overflow-hidden w-full"
        style={{
          backgroundColor: isDarkMode ? "#0a1f2e" : "#f5f8fa"
        }}
      >
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
            >
              Why Choose <span style={{ color: primaryColor }}>Vedant Education</span>?
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: isDarkMode ? "#94a3b8" : "#4a5568" }}
            >
              Experience the difference with our comprehensive school management solution
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Cloud-Based Solution",
                description: "Access your school data from anywhere, anytime. No installation required.",
                icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
                rounded: "rounded-2xl"
              },
              {
                title: "24/7 Support",
                description: "Our dedicated support team is always ready to help you whenever you need assistance.",
                icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z",
                rounded: "rounded-xl"
              },
              {
                title: "Secure & Reliable",
                description: "Your data is protected with enterprise-grade security and 99.9% uptime guarantee.",
                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                rounded: "rounded-3xl"
              },
              {
                title: "Easy Integration",
                description: "Seamlessly integrate with existing systems and third-party applications.",
                icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
                rounded: "rounded-xl"
              },
              {
                title: "Cost Effective",
                description: "Reduce operational costs with automated processes and efficient resource management.",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                rounded: "rounded-2xl"
              },
              {
                title: "Scalable Platform",
                description: "Grows with your institution from small schools to large educational networks.",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                rounded: "rounded-3xl"
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className={`p-8 ${benefit.rounded} border transition-all duration-300 hover:-translate-y-2 ${boxClass}`}
              >
                <div
                  className="w-14 h-14 rounded-xl mb-6 flex items-center justify-center"
                  style={{
                    backgroundColor: primaryColor + "20",
                    color: primaryColor
                  }}
                >
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={benefit.icon}
                    />
                  </svg>
                </div>
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
                >
                  {benefit.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: isDarkMode ? "#94a3b8" : "#4a5568" }}
                >
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Testimonials Section --- */}
      <section 
        className="py-24 relative overflow-hidden w-full"
        style={{
          backgroundColor: isDarkMode ? "#0a1f2e" : "#f5f8fa"
        }}
      >
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
            >
              What Our <span style={{ color: primaryColor }}>Clients Say</span>
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: isDarkMode ? "#94a3b8" : "#4a5568" }}
            >
              Trusted by hundreds of schools across the nation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Dr. Priya Sharma",
                role: "Principal, ABC International School",
                content: "Vedant Education has transformed how we manage our school. The system is intuitive, and the support team is exceptional. Our administrative efficiency has increased by 60%.",
                rating: 5,
                rounded: "rounded-2xl"
              },
              {
                name: "Rajesh Kumar",
                role: "Administrator, XYZ Public School",
                content: "The fee management and attendance tracking features have saved us countless hours. The mobile apps make it easy for teachers and parents to stay connected.",
                rating: 5,
                rounded: "rounded-xl"
              },
              {
                name: "Anita Desai",
                role: "IT Coordinator, Modern School",
                content: "Implementation was smooth, and the training provided was comprehensive. Our staff adapted quickly, and we've seen significant improvements in communication.",
                rating: 5,
                rounded: "rounded-3xl"
              },
            ].map((testimonial, idx) => (
              <div
                key={idx}
                className={`p-8 ${testimonial.rounded} border ${boxClass}`}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{ color: primaryColor }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p
                  className="text-sm leading-relaxed mb-6"
                  style={{ color: isDarkMode ? "#cbd5e0" : "#4a5568" }}
                >
                  "{testimonial.content}"
                </p>
                <div>
                  <h4
                    className="font-bold mb-1"
                    style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
                  >
                    {testimonial.name}
                  </h4>
                  <p
                    className="text-sm"
                    style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}
                  >
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Steps Section --- */}
      <section 
        className="py-24 relative overflow-hidden w-full"
        style={{
          backgroundColor: isDarkMode ? "#0a1f2e" : "#f5f8fa"
        }}
      >
        <div className="max-w-full mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2
              className="text-4xl font-bold mb-4"
              style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
            >
              Get Started in 3 Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line */}
            <div
              className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5"
              style={{ backgroundColor: primaryColor + "40" }}
            ></div>

            {[
              {
                step: "01",
                title: "Contact Sales",
                icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              },
              {
                step: "02",
                title: "Verification",
                icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                step: "03",
                title: "Go Live",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative flex flex-col items-center text-center group"
              >
                <div
                  className={`w-24 h-24 ${idx === 0 ? 'rounded-2xl' : idx === 1 ? 'rounded-xl' : 'rounded-3xl'} flex items-center justify-center mb-6 relative z-10 transition-transform duration-300 group-hover:scale-110 border-4 shadow-xl`}
                  style={{
                    backgroundColor: isDarkMode ? "#0d4a73" : "#ffffff",
                    borderColor: primaryColor
                  }}
                >
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: primaryColor }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={item.icon}
                    />
                  </svg>
                  <div
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {item.step}
                  </div>
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm max-w-[200px]"
                  style={{ color: isDarkMode ? "#94a3b8" : "#4a5568" }}
                >
                  Start your journey with Vedant Education today.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Contact Section --- */}
      <section
        id="contact"
        ref={ctaReveal.elementRef}
        className="py-24 relative z-10 w-full"
        style={{
          backgroundColor: isDarkMode ? "#0a1f2e" : "#f5f8fa"
        }}
      >
        <div
          className={`max-w-full mx-auto px-4 transition-all duration-700 ${
            ctaReveal.revealed
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <div
            className="rounded-2xl overflow-hidden shadow-2xl border"
            style={{
              backgroundColor: isDarkMode ? "#0d4a73" : "#ffffff",
              borderColor: primaryColor
            }}
          >
            <div className="grid lg:grid-cols-5">
              {/* Info Side */}
              <div
                className="lg:col-span-2 p-10 text-white relative overflow-hidden"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-3xl font-bold mb-4">Get in Touch</h3>
                    <p className="text-blue-100 mb-8">
                      Ready to transform your school? Send us a message and
                      we'll get back to you within 24 hours.
                    </p>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <span>+91 97661 17311</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm break-all">
                        vedanteducation.22@gmail.com
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Side */}
              <div className="lg:col-span-3 p-10 lg:p-16">
                {showThankYou ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6 animate-bounce-slow">
                      <svg
                        className="w-10 h-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3
                      className="text-2xl font-bold mb-2"
                      style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
                    >
                      Message Sent!
                    </h3>
                    <p style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}>
                      We will be in touch shortly.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleContactFormSubmit}
                    className="space-y-6"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          className="text-sm font-semibold"
                          style={{ color: isDarkMode ? "#cbd5e0" : "#1a1a1a" }}
                        >
                          School Name
                        </label>
                        <input
                          name="schoolName"
                          value={contactForm.schoolName}
                          onChange={handleContactFormChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border transition-all outline-none"
                          style={{
                            backgroundColor: isDarkMode ? "#0d4a73" : "#f5f8fa",
                            borderColor: primaryColor + "40",
                            color: isDarkMode ? "#ffffff" : "#1a1a1a"
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
                          onBlur={(e) => e.currentTarget.style.borderColor = primaryColor + "40"}
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          className="text-sm font-semibold"
                          style={{ color: isDarkMode ? "#cbd5e0" : "#1a1a1a" }}
                        >
                          Email
                        </label>
                        <input
                          name="schoolEmail"
                          type="email"
                          value={contactForm.schoolEmail}
                          onChange={handleContactFormChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border transition-all outline-none"
                          style={{
                            backgroundColor: isDarkMode ? "#0d4a73" : "#f5f8fa",
                            borderColor: primaryColor + "40",
                            color: isDarkMode ? "#ffffff" : "#1a1a1a"
                          }}
                          onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
                          onBlur={(e) => e.currentTarget.style.borderColor = primaryColor + "40"}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        className="text-sm font-semibold"
                        style={{ color: isDarkMode ? "#cbd5e0" : "#1a1a1a" }}
                      >
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={contactForm.message}
                        onChange={handleContactFormChange}
                        required
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg border transition-all outline-none resize-none"
                        style={{
                          backgroundColor: isDarkMode ? "#0d4a73" : "#f5f8fa",
                          borderColor: primaryColor + "40",
                          color: isDarkMode ? "#ffffff" : "#1a1a1a"
                        }}
                        onFocus={(e) => e.currentTarget.style.borderColor = primaryColor}
                        onBlur={(e) => e.currentTarget.style.borderColor = primaryColor + "40"}
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-4 rounded-lg font-bold text-white transition-colors shadow-lg hover:opacity-90"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Send Message
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer
        className="py-12 border-t w-full"
        style={{
          backgroundColor: isDarkMode ? "#0a1f2e" : "#f5f8fa",
          borderColor: primaryColor + "40"
        }}
      >
        <div className="max-w-full mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="h-8 w-8 rounded-lg"
                style={{ backgroundColor: primaryColor }}
              ></div>
              <span
                className="text-xl font-bold"
                style={{ color: isDarkMode ? "#ffffff" : "#1a1a1a" }}
              >
                Vedant Education
              </span>
            </div>
            <div
              className="text-sm"
              style={{ color: isDarkMode ? "#94a3b8" : "#64748b" }}
            >
              © 2025 Vedant Education. All rights reserved.
            </div>
            <div className="flex gap-6">
              {["Twitter", "LinkedIn", "Instagram"].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: isDarkMode ? "#94a3b8" : "#64748b"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = primaryColor}
                  onMouseLeave={(e) => e.currentTarget.style.color = isDarkMode ? "#94a3b8" : "#64748b"}
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
