import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Briefcase, Bot, CheckCircle, ArrowRight, ShieldCheck, Users, Building2, Award, Target, HelpCircle, BarChart3 } from 'lucide-react';
import { Button, Card, Badge } from '../components/UIComponents';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32 border-b border-[var(--border-color)]">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[var(--primary)]/10 rounded-full blur-3xl" />
        <div className="absolute top-60 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <Badge variant="primary" className="mb-6 px-4 py-1 text-xs uppercase tracking-widest font-bold">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 fill-current" /> Smart Internship Discovery & AI Career Assistant
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            Discover Internships.{' '}
            <span className="bg-gradient-to-r from-[var(--primary)] via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Build Your Future.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Find relevant internship opportunities, connect with leading organizations, track your applications, and take the next step in your career—all in one place.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link to="/internships">
              <Button size="lg" className="shadow-lg shadow-[var(--primary)]/25">
                Explore Internships <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-center">
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
              <h3 className="text-2xl font-black text-[var(--primary)]">95%+</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">Match Accuracy</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
              <h3 className="text-2xl font-black text-emerald-500">50+</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">Partner Companies</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
              <h3 className="text-2xl font-black text-purple-500">100%</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">Trackable Applications</p>
            </div>
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
              <h3 className="text-2xl font-black text-amber-500">AI</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 font-semibold">Skill Gap & Prep</p>
            </div>
          </div>
        </div>
      </section>

      {/* How InternHub Works */}
      <section className="py-20 border-b border-[var(--border-color)] bg-[var(--bg-card)]/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-[var(--text-primary)]">How InternHub Works</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              A seamless, intelligent lifecycle for students, hiring companies, and college administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="flex flex-col items-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-6">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold">1. Create Your Profile</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                Add your technical skills, academic performance, target domains, and work preferences to receive tailored internship recommendations.
              </p>
            </Card>

            <Card className="flex flex-col items-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold">2. Smart Internship Matching</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                Our intelligent matching engine evaluates your qualifications against active internship requisitions to find your ideal fit.
              </p>
            </Card>

            <Card className="flex flex-col items-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-6">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold">3. Apply & Prepare</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-3 leading-relaxed">
                Track your application progress in real time and leverage AI assistance for interview prep, resume reviews, and career coaching.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 border-b border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6">
              <Badge variant="purple" className="px-3 py-1 text-xs">Empowering Careers</Badge>
              <h2 className="text-3xl sm:text-4xl font-black">
                Everything You Need for Internship Success
              </h2>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                InternHub connects candidates and recruiters through a streamlined digital portal designed for transparency, speed, and candidate growth.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Smart Skill-Based Candidate Matching
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Real-Time Application Tracking Dashboard
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> Automated Recruiter Shortlisting & Management
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <CheckCircle className="w-4 h-4 text-emerald-500" /> AI Career Coaching & Skill Gap Analysis
                </div>
              </div>
            </div>

            <div className="flex-1 w-full">
              <Card className="p-6 bg-slate-900 text-slate-100 border-slate-800 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <span className="text-xs font-mono text-emerald-400">// Smart Match Overview</span>
                  <Badge variant="primary" className="text-[10px]">Verified Match</Badge>
                </div>
                <div className="space-y-3 text-xs text-slate-300">
                  <div className="flex justify-between items-center bg-slate-800/60 p-3 rounded-xl">
                    <span className="font-semibold text-white">Full Stack Software Engineering Intern</span>
                    <span className="text-emerald-400 font-bold">94% Match</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                    <div className="bg-slate-800/40 p-2.5 rounded-lg">Skill Alignment: <span className="text-white font-medium">React, Node.js, SQL</span></div>
                    <div className="bg-slate-800/40 p-2.5 rounded-lg">Preferred Domain: <span className="text-white font-medium">Software Dev</span></div>
                    <div className="bg-slate-800/40 p-2.5 rounded-lg">Work Mode: <span className="text-white font-medium">Hybrid / Remote</span></div>
                    <div className="bg-slate-800/40 p-2.5 rounded-lg">Academic Index: <span className="text-white font-medium">Eligible</span></div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-b border-[var(--border-color)] bg-[var(--bg-card)]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold mb-12">Trusted by Students & Recruitment Leaders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-left">
              <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                "InternHub's recommendation match index helped me identify suitable software roles quickly and prepare effectively for technical interviews."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Student" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold">Aarav Sharma</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">Software Engineering Intern</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 text-left">
              <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                "Managing applications and candidate shortlists is effortless. The candidate match scoring gives us clear visibility into applicant eligibility."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" alt="Company" className="w-8 h-8 object-contain" />
                <div>
                  <h4 className="text-xs font-bold">Microsoft University Relations</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">Hiring Partner</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 text-left">
              <p className="text-xs text-[var(--text-secondary)] italic leading-relaxed">
                "The placement analytics allow our team to track student placement progress and guide unplaced candidates toward active opportunities."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  IIT
                </div>
                <div>
                  <h4 className="text-xs font-bold">Placement Directorate</h4>
                  <p className="text-[10px] text-[var(--text-muted)]">IIT Madras Administrator</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 border-b border-[var(--border-color)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-extrabold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="p-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--primary)]" /> How does InternHub match students with internships?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                InternHub evaluates candidate skills, domain preferences, academic performance, and work arrangements to calculate personalized match recommendations for students.
              </p>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[var(--primary)]" /> How do recruiters manage applicants?
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                Recruiters can publish internship requisitions, review candidate profiles with skill match indicators, update application statuses, and shortlist candidates directly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[var(--bg-card)] border-t border-[var(--border-color)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--primary)] text-white">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <span className="text-sm font-black">InternHub Portal</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            © 2026 InternHub. All-in-one Internship Management Portal.
          </p>
        </div>
      </footer>
    </div>
  );
};
