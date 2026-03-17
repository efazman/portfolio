import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, Menu, X, Github, Linkedin, Mail, ExternalLink, Microchip } from 'lucide-react';

// Add CSS animations
const styles = `
  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeInDown {
    animation: fadeInDown 0.6s ease-out;
  }
`;

// Animated background component
const AnimatedBackground = ({ darkMode }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const waves = [];
    const waveCount = 5;
    let time = 0;

    class Wave {
      constructor(index) {
        this.index = index;
        this.amplitude = 50 + index * 20;
        this.frequency = 0.002 + index * 0.0005;
        this.speed = 0.01 + index * 0.005;
        this.yOffset = canvas.height * 0.6 + index * 40;
        this.opacity = 0.08 - index * 0.01;
      }

      draw(time) {
        ctx.beginPath();

        for (let x = 0; x <= canvas.width; x += 5) {
          const y = Math.sin(x * this.frequency + time * this.speed) * this.amplitude + this.yOffset;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Complete the shape
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        // Create gradient based on dark mode and Michigan colors
        const gradient = ctx.createLinearGradient(0, this.yOffset - this.amplitude, 0, canvas.height);

        if (darkMode) {
          // Maize to Blue aurora for dark mode
          gradient.addColorStop(0, `rgba(255, 203, 5, ${this.opacity + 0.05})`);
          gradient.addColorStop(0.5, `rgba(0, 39, 76, ${this.opacity + 0.03})`);
          gradient.addColorStop(1, `rgba(0, 39, 76, 0)`);
        } else {
          // Softer, lighter version for light mode
          gradient.addColorStop(0, `rgba(255, 203, 5, ${this.opacity * 0.5})`);
          gradient.addColorStop(0.5, `rgba(100, 150, 200, ${this.opacity * 0.4})`);
          gradient.addColorStop(1, `rgba(100, 150, 200, 0)`);
        }

        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Create multiple wave layers
    for (let i = 0; i < waveCount; i++) {
      waves.push(new Wave(i));
    }

    // Add some floating particles for extra aurora effect
    const particles = [];
    const particleCount = 50;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height * 0.6 + Math.random() * canvas.height * 0.4;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.3 - 0.15;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.color = Math.random() > 0.5 ? [255, 203, 5] : [0, 39, 76];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = canvas.height * 0.6;
        if (this.y < canvas.height * 0.6) this.y = canvas.height;
      }

      draw() {
        const alpha = darkMode ? this.opacity : this.opacity * 0.6;
        ctx.fillStyle = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${alpha})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      // Clear canvas completely for clean theme switching
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      time += 0.5;

      // Draw waves from back to front
      waves.forEach(wave => {
        wave.draw(time);
      });

      // Draw and update particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      waves.forEach((wave, index) => {
        wave.yOffset = canvas.height * 0.6 + index * 40;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [darkMode]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default function Portfolio() {
  const [darkMode, setDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const [activeProjectIndex, setActiveProjectIndex] = useState(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveProjectIndex(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const sections = document.querySelectorAll('[data-reveal]');
    sections.forEach((section) => observer.observe(section));

    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  const projects = [
    {
      title: "CacheLens",
      description: "CacheLens automatically finds the lines of code in a program that cause the most CPU cache misses — one of the hardest performance problems to diagnose by hand. It combines Linux kernel profiling infrastructure with debug symbol resolution and an LLM reasoning layer to produce actionable, source-level explanations and fix suggestions from raw hardware counter data.",
      tech: ["Python", "C++", "OpenAI API"],
      image: "/images/CacheLens.png",
      github: "https://github.com/efazman/CacheLens"
    },
    {
      title: "IceScope GL",
      description: "An Ice Forecast Map created for the Michigan Office of Defense and Aerospace Innovation (ODAI). Using Linear Regression, performs predictions of ice thickness in the Great Lakes based on historical data. Features include an interactive map with time-stepping and ship routing.",
      tech: ["React", "Node.js", "Python", "Scikit-Learn"],
      image: "/images/IceScopeGL.png",
      github: "https://github.com/efazman/MiSpace-Hackathon-2025"
    },
    {
      title: "Real-Time Trading Simulator",
      description: "A real-time, event-driven trading simulator / matching engine that consumes input events (add/cancel/modify orders) and emits output events (order accepted, trade executed). Implemented in C++17 with a per-symbol limit order book and price-time priority matching.",
      tech: ["C++"],
      image: "/images/tradingsim.png",
      github: "https://github.com/efazman/Real-Time-Market-Simulation-Engine"
    },
    {
      title: "Roomies Ledger",
      description: "Roomies Ledger is a mobile-first expense splitting app for roommates. Create/join households with invite codes, log purchases, split costs, and see who owes who at a glance.",
      tech: ["React", "Supabase", "OpenAI API"],
      image: "/images/RoomiesLedger.png",
      github: "https://github.com/efazman/ice-scope-th"
    },
    {
      title: "poop",
      description: "Cross-platform scheduling and analytics tool for social media managers. Supports Instagram, Twitter, LinkedIn with AI-generated content suggestions.",
      tech: ["Vue.js", "Firebase", "OpenAI API"],
      image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
      github: "https://github.com/efazman"
    },
    {
      title: "RhodoProtect",
      description: "",
      tech: ["Arduino Language", "Firebase", "OpenAI API"],
      image: "/images/embed.png",
      github: "https://github.com/efazman"
    }
  ];

  const skills = [
    { name: "Systems Software", icon: "⚙️", description: "Operating Systems, Distributed Systems, C++" },
    { name: "Database Knowledge", icon: "📊", description: "SQL" },
    { name: "Embedded Systems", icon: <Microchip size={32} />, description: "Insert Info Here" },
    {
      name: "Robotics",
      icon: "🤖",
      description: (
        <>
          <a
            href="https://marc-website-nine.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-yellow-500 underline underline-offset-2"
          >
            MARC
          </a>
          , <a
            href="https://mrover.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-yellow-500 underline underline-offset-2"
          >
            MRover
          </a>
        </>
      ),
    },
  ];


  const techLogos = ["C++", "Python", "REST APIs", "SQL"];

  return (
    <div className={`min-h-screen transition-colors duration-300 relative ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Add styles */}
      <style>{styles}</style>

      {/* Animated Background */}
      <AnimatedBackground darkMode={darkMode} />

      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? (darkMode ? 'bg-gray-900/95 backdrop-blur-sm shadow-lg' : 'bg-white/95 backdrop-blur-sm shadow-lg') : ''}`}>
          <div className={`mx-auto px-6 transition-all duration-500 ${scrolled ? 'max-w-7xl py-4' : 'max-w-4xl py-6'}`}>
            <div className="flex items-center justify-between">
              <a href="#" className={`font-bold bg-gradient-to-r from-yellow-400 to-blue-600 bg-clip-text text-transparent transition-all duration-500 ${scrolled ? 'text-2xl' : 'text-3xl'}`}>
                Efaz Rahman
              </a>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center gap-8">
                {['Work', 'About', 'Skills'].map((item, index) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="hover:text-blue-600 transition-colors opacity-0 animate-fadeInDown"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: 'forwards'
                    }}
                  >
                    {item}
                  </a>
                ))}
                <a
                  href="#contact"
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-500 relative overflow-hidden opacity-0 animate-fadeInDown group ${scrolled
                    ? 'bg-gradient-to-r from-yellow-400 to-blue-600 text-white scale-100 shadow-lg'
                    : 'border-2 border-gray-700 scale-90 hover:scale-95'
                    }`}
                  style={{
                    animationDelay: '300ms',
                    animationFillMode: 'forwards'
                  }}
                >
                  <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                  <span className="relative z-10">Contact</span>
                </a>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-colors opacity-0 animate-fadeInDown ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                  style={{
                    animationDelay: '400ms',
                    animationFillMode: 'forwards'
                  }}
                >
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-4">
                <button onClick={() => setDarkMode(!darkMode)} className="p-2">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <div className="md:hidden pt-4 pb-2">
                <div className="flex flex-col gap-4">
                  <a href="#work" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 transition-colors">Work</a>
                  <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 transition-colors">About</a>
                  <a href="#skills" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 transition-colors">Skills</a>
                  <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 transition-colors">Contact</a>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Cr<em className="not-italic text-yellow-400">e</em>ating D<em className="not-italic text-blue-600">i</em>gital
                <br />
                Exp<em className="not-italic text-yellow-400">e</em>ri<em className="not-italic text-blue-600">e</em>nces
              </h1>
              <p className={`text-xl md:text-2xl mb-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                I’m a Computer Engineering student at the University of Michigan with a strong interest in Systems Engineering, Low‑Level Software, and Backend Systems.              </p>
              <div className="flex gap-4 justify-center flex-wrap">
                <a
                  href="#work"
                  className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all relative overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                  <span className="relative z-10">View My Work</span>
                </a>
                <a
                  href="#contact"
                  className={`px-8 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105 relative overflow-hidden group ${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  <span className={`absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${darkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></span>
                  <span className="relative z-10">Get In Touch</span>
                </a>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl max-w-5xl mx-auto">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80"
                alt="Featured work showcase"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="py-12 px-6">
          <div className="max-w-7xl mx-auto">
            <p className={`text-center mb-8 text-sm uppercase tracking-wider ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              T<em className="not-italic">e</em>chnol<em className="not-italic">o</em>gies I W<em className="not-italic">o</em>rk With
            </p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              {techLogos.map((tech, i) => (
                <div key={i} className={`px-6 py-3 rounded-lg font-semibold ${darkMode ? 'bg-gray-800/70 backdrop-blur-sm' : 'bg-gray-100/70 backdrop-blur-sm'}`}>
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section
          id="work"
          data-reveal
          className={`py-20 px-6 transition-all duration-1000 ${visibleSections['work'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-400 to-blue-600 bg-clip-text text-transparent">
              Featured Work
            </h2>
            <p className={`text-center mb-12 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Click a project to expand
            </p>

            {/* Grid of tiles: ONLY title + image */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveProjectIndex(index)}
                  className="text-left group focus:outline-none"
                  aria-label={`Open details for ${project.title}`}
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-xl font-bold text-white">{project.title}</h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Modal: expanded details */}
            {activeProjectIndex !== null && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
                {/* overlay */}
                <button
                  type="button"
                  className="absolute inset-0 bg-black/70"
                  onClick={() => setActiveProjectIndex(null)}
                  aria-label="Close project details"
                />

                {/* modal card */}
                <div
                  className={`relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
                    }`}
                >
                  {/* close button */}
                  <button
                    type="button"
                    onClick={() => setActiveProjectIndex(null)}
                    className={`absolute top-4 right-4 p-2 rounded-lg ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>

                  {/* header image */}
                  <img
                    src={projects[activeProjectIndex].image}
                    alt={projects[activeProjectIndex].title}
                    className="w-full h-64 object-cover"
                  />

                  {/* content */}
                  <div className="p-8">
                    <h3 className="text-3xl font-bold mb-3">
                      {projects[activeProjectIndex].title}
                    </h3>

                    <p className={`text-lg mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {projects[activeProjectIndex].description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {projects[activeProjectIndex].tech?.map((t, i) => (
                        <span
                          key={i}
                          className={`px-3 py-1 rounded-full text-sm ${darkMode
                            ? 'bg-gray-800/70 text-gray-200'
                            : 'bg-gray-100/70 text-gray-700'
                            }`}
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {projects[activeProjectIndex].link && projects[activeProjectIndex].link !== "#" && (
                        <a
                          href={projects[activeProjectIndex].link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-blue-600 text-white hover:shadow-lg hover:scale-[1.02] transition-all"
                        >
                          View Project <ExternalLink size={18} />
                        </a>
                      )}

                      {projects[activeProjectIndex].github && (
                        <a
                          href={projects[activeProjectIndex].github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-[1.02] ${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'
                            }`}
                        >
                          <Github size={18} />
                          Code
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        {/* Skills Section */}
        <section id="skills" data-reveal className={`py-20 px-6 transition-all duration-1000 ${visibleSections['skills'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${darkMode ? 'bg-gray-800/30 backdrop-blur-sm' : 'bg-gray-50/70 backdrop-blur-sm'}`}>
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-center bg-gradient-to-r from-yellow-400 to-blue-600 bg-clip-text text-transparent">
              What I Bring to the Table
            </h2>
            <p className={`text-center mb-16 text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Full-stack expertise with a focus on user experience
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className={`p-8 rounded-xl transition-all duration-1000 hover:scale-105 hover:shadow-xl flex items-start gap-6 ${darkMode ? 'bg-gray-900/70 backdrop-blur-sm' : 'bg-white/70 backdrop-blur-sm'} ${visibleSections['skills'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl flex-shrink-0">{skill.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{skill.name}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{skill.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" data-reveal className={`py-20 px-6 transition-all duration-1000 ${visibleSections['about'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-yellow-400 to-blue-600 bg-clip-text text-transparent">
              About Me
            </h2>
            <p className={`text-xl mb-6 leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              I’m currently focused on deepening my DSA and systems foundation through advanced coursework and personal projects, with long‑term goals in systems software, infrastructure engineering, or performance‑driven roles.

            </p>
            <p className={`text-xl leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              I primarily work in C++, and I like reasoning about efficiency, correctness, and tradeoffs rather than just making things “work.”

            </p>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" data-reveal className={`py-20 px-6 transition-all duration-1000 ${visibleSections['contact'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} ${darkMode ? 'bg-gray-800/30 backdrop-blur-sm' : 'bg-gray-50/70 backdrop-blur-sm'}`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-blue-600 bg-clip-text text-transparent">
              Let's Work Together
            </h2>
            <p className={`text-xl mb-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Have a project in mind? Let's create something amazing.
            </p>
            <div className="flex gap-6 justify-center flex-wrap">
              <a
                href="efaz@umich.edu"
                className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-blue-600 rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2 relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                <Mail size={20} className="relative z-10" />
                <span className="relative z-10">Send Email</span>
              </a>
              <a
                href="https://github.com/efazman"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-8 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105 inline-flex items-center gap-2 relative overflow-hidden group ${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <span className={`absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${darkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></span>
                <Github size={20} className="relative z-10" />
                <span className="relative z-10">GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/efaz-rahman-umich586"
                target="_blank"
                rel="noopener noreferrer"
                className={`px-8 py-3 rounded-lg font-semibold border-2 transition-all hover:scale-105 inline-flex items-center gap-2 relative overflow-hidden group ${darkMode ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <span className={`absolute inset-0 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left ${darkMode ? 'bg-gray-800/50' : 'bg-gray-200/50'}`}></span>
                <Linkedin size={20} className="relative z-10" />
                <span className="relative z-10">LinkedIn</span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 px-6 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex gap-6">
                <a href="#work" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Work</a>
                <a href="#about" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>About</a>
                <a href="#skills" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Skills</a>
                <a href="#contact" className={`hover:text-blue-600 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Contact</a>
              </div>
              <p className={darkMode ? 'text-gray-500' : 'text-gray-400'}>
                © 2026 Efaz Rahman. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}