'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Palette, 
  Zap, 
  Users, 
  Github, 
  Twitter,
  ArrowRight,
  Sparkles,
  Mouse,
  Layers,
  Share2,
  Heart,
  Play,
  BookOpen,
  Code,
  LogIn,
  UserPlus
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/Theme/ThemeToggle';




export function LandingPage(){
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set());
  
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const elementId = entry.target.getAttribute('data-animate-id');
          if (elementId) {
            if (entry.isIntersecting) {
              setVisibleElements(prev => new Set([...prev, elementId]));
            } else {
              setVisibleElements(prev => {
                const newSet = new Set(prev);
                newSet.delete(elementId);
                return newSet;
              });
            }
          }
        });
      },
      { 
        threshold: 0.2, 
        rootMargin: '-50px 0px -50px 0px' 
      }
    );

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const elementsToObserve = document.querySelectorAll('[data-animate-id]');
      elementsToObserve.forEach(el => {
        if (observerRef.current) {
          observerRef.current.observe(el);
        }
      });
    }, 100);

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      clearTimeout(timer);
    };
  }, []);

  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Infinite Canvas",
      description: "Draw anything on an unlimited canvas with smooth zooming and panning",
      delay: "0ms"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description: "Work together with your team in real-time, see changes instantly",
      delay: "100ms"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Optimized performance ensures smooth drawing even with complex diagrams",
      delay: "200ms"
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Easy Sharing",
      description: "Share your creations with a simple link or export to various formats",
      delay: "300ms"
    }
  ];

  const stats = [
    { number: "10M+", label: "Active Users", id: "stat-1" },
    { number: "50M+", label: "Diagrams Created", id: "stat-2" },
    { number: "100+", label: "Countries", id: "stat-3" },
    { number: "24/7", label: "Available", id: "stat-4" }
  ];

  const isElementVisible = (id: string) => visibleElements.has(id);

  return (

    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800/30 dark:to-pink-800/30 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            left: '10%',
            top: '10%'
          }}
        />
        <div 
          className="absolute w-80 h-80 bg-gradient-to-r from-blue-200 to-cyan-200 dark:from-blue-800/30 dark:to-cyan-800/30 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * -0.01}px, ${mousePosition.y * -0.01}px)`,
            right: '10%',
            bottom: '10%',
            animationDelay: '1s'
          }}
        />
      </div>
       
      {/* Navigation */}
      <nav className={`relative z-50 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Exalidraw
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 hover:scale-105 transform">
                Features
              </a>
              <a href="#about" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 hover:scale-105 transform">
                About
              </a>
              <a href="#community" className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 hover:scale-105 transform">
                Community
              </a>
              <ThemeToggle />
              <Link 
                href="/auth/signin"
                className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300 hover:scale-105 transform flex items-center space-x-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
              <Link 
                href="/auth/signup"
                className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-1200 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient">
                Draw. Think.
              </span>
              <br />
              <span className="text-gray-800 dark:text-white">Create Together.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              The collaborative whiteboard that helps you sketch diagrams that have a hand-drawn feel. 
              <span className="text-purple-600 dark:text-purple-400 font-semibold"> Express your ideas freely.</span>
            </p>
          </div>

          <div className={`transition-all duration-1200 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-16">
              <button onClick={()=>{
                window.open('/dashboard')
              }} className="group bg-gradient-to-r from-purple-500 to-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-3">
                <span>Start Drawing</span>
                <Mouse className="w-5 h-5 group-hover:animate-bounce" />
              </button>
              
              <button className="group bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-8 py-4 rounded-full text-lg font-semibold border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-400 hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center space-x-3">
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>

          {/* Floating Demo Elements */}
          <div className="relative max-w-4xl mx-auto">
            <div className={`transition-all duration-1500 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 hover:shadow-3xl transition-shadow duration-500">
                <div className="aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {/* Demo Canvas Preview */}
                  <div className="absolute inset-4 border-2 border-dashed border-purple-300 dark:border-purple-500 rounded-xl opacity-50" />
                  
                  {/* Floating Shapes */}
                  <div className="absolute top-6 left-6 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg rotate-12 hover:rotate-0 transition-transform duration-500 animate-float" />
                  <div className="absolute top-12 right-12 w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full hover:scale-110 transition-transform duration-300 animate-float-delayed" />
                  <div className="absolute bottom-8 left-12 w-20 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full rotate-6 hover:rotate-0 transition-transform duration-500 animate-float" />
                  
                  {/* Center Icon */}
                  <div className="bg-white dark:bg-gray-700 rounded-full p-6 shadow-lg hover:scale-110 transition-transform duration-300">
                    <Layers className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                data-animate-id={stat.id}
                className={`text-center transition-all duration-700 transform ${
                  isElementVisible(stat.id) 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-10 opacity-0 scale-90'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            data-animate-id="features-header"
            className={`text-center mb-20 transition-all duration-1000 transform ${
              isElementVisible('features-header') 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-20 opacity-0'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Exalidraw?</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to bring your ideas to life with beautiful, hand-drawn style diagrams
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                data-animate-id={`feature-${index}`}
                className={`group p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-400 transform ${
                  isElementVisible(`feature-${index}`) 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-20 opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div 
              data-animate-id="about-content"
              className={`transition-all duration-1000 transform ${
                isElementVisible('about-content') 
                  ? 'translate-x-0 opacity-100' 
                  : '-translate-x-20 opacity-0'
              }`}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-8">
                Built for <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Everyone</span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                From quick sketches to complex diagrams, Exalidraw adapts to your workflow. 
                {"Whether you're brainstorming ideas, creating flowcharts, or collaborating with your team, "}
                our intuitive interface makes it effortless.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">No account required to start</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Works entirely in your browser</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">Open source and privacy-focused</span>
                </div>
              </div>
            </div>
            
            <div 
              data-animate-id="about-visual"
              className={`transition-all duration-1000 transform ${
                isElementVisible('about-visual') 
                  ? 'translate-x-0 opacity-100' 
                  : 'translate-x-20 opacity-0'
              }`}
            >
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 hover:shadow-3xl transition-shadow duration-500 border border-gray-100 dark:border-gray-700">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200/20 to-blue-200/20 dark:from-purple-800/20 dark:to-blue-800/20" />
                  <div className="relative z-10 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
                      <Code className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Open Source</h3>
                    <p className="text-gray-600 dark:text-gray-300">Built by the community, for the community</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div 
            data-animate-id="community-header"
            className={`transition-all duration-1000 transform ${
              isElementVisible('community-header') 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-20 opacity-0'
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-8">
              Join Our <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Community</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
              Connect with thousands of creators, developers, and designers who use Exalidraw every day
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: <Github className="w-8 h-8" />, title: "GitHub", desc: "Contribute to the project", id: "github-card" },
              { icon: <BookOpen className="w-8 h-8" />, title: "Documentation", desc: "Learn how to use Exalidraw", id: "docs-card" },
              { icon: <Users className="w-8 h-8" />, title: "Discord", desc: "Chat with the community", id: "discord-card" }
            ].map((item, index) => (
              <div
                key={index}
                data-animate-id={item.id}
                className={`group p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-700 transform ${
                  isElementVisible(item.id) 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-20 opacity-0 scale-95'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div 
          data-animate-id="cta-section"
          className={`relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 transition-all duration-1000 transform ${
            isElementVisible('cta-section') 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-20 opacity-0'
          }`}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto">
           {"Join millions of users who love sketching with Exalidraw. "}
           {" It's free, open-source, and works right in your browser."}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button onClick={()=>{
              window.open('/dashboard', '_blank')
            }} className="group bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-3">
              <span>Launch Exalidraw</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
            
            <button onClick={()=>{
                window.open('https://github.com/SmartSood/Draw_App', '_blank');
              }} className="group text-white px-8 py-4 rounded-full text-lg font-semibold border-2 border-white/30 hover:bg-white/10 hover:scale-105 transition-all duration-300 flex items-center space-x-3">
              <Github className="w-5 h-5" />
              <span >View Source</span>
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-8 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">Exalidraw</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 transform">
                <Github className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300 hover:scale-110 transform">
                <Twitter className="w-6 h-6" />
              </a>
              <span className="text-gray-500 flex items-center space-x-2">
                <span>Made with</span>
                <Heart className="w-4 h-4 text-red-500 animate-pulse" />
                <span>Smarth Sood</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>

  );
}