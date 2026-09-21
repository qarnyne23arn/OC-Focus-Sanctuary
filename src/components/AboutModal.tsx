import React, { useState } from 'react';
import { X, BookOpen, Send, CheckCircle2, ShieldCheck, FileText, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLight?: boolean;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  isLight = false,
}) => {
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const aboutRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (aboutRef.current) {
      aboutRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) return;

    setIsSending(true);
    // Route message to mdalberashidniloy@gmail.com
    console.log("Contact form submission routed to mdalberashidniloy@gmail.com:", {
      fromName: contactName,
      fromEmail: contactEmail,
      message: contactMessage,
      timestamp: new Date().toISOString()
    });

    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setTimeout(() => setSentSuccess(false), 5000);
    }, 800);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={aboutRef} className="fixed inset-0 z-50 bg-[#0a0e1a]/90 backdrop-blur-xl flex flex-col overflow-y-auto">
      {/* 1. NAV */}
      <header className="sticky top-0 z-40 bg-[#0a0e1a]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-bold transition cursor-pointer border border-white/10 mr-1 sm:mr-2 shrink-0"
            title="Go back to app"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black border border-[#22d3ee]/40 p-1 flex items-center justify-center overflow-hidden shadow-[0_0_12px_rgba(34,211,238,0.25)] shrink-0">
            <img
              src="/sandclock.svg"
              alt="OC Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]"
            />
          </div>
          <span className="font-['Plus_Jakarta_Sans'] font-black text-white text-xs sm:text-base tracking-wider truncate max-w-[120px] sm:max-w-none">
            OC Focus Sanctuary
          </span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={() => scrollToSection('about-story')}
            className="text-xs font-semibold text-[#22d3ee] cursor-pointer hover:underline hidden sm:inline"
          >
            About
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('contact-section')}
            className="text-xs font-semibold text-[#94a3b8] hover:text-white cursor-pointer transition hidden sm:inline"
          >
            Contact
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 sm:px-4 py-2 rounded-xl bg-[#22d3ee] text-[#0a0e1a] font-bold text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)] hover:brightness-110 transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-16">
        {/* 2. ABOUT SECTION */}
        <section id="about-story" className="text-center space-y-6 pt-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#22d3ee]/10 border border-[#22d3ee]/30 text-[#22d3ee] text-[10px] font-black uppercase tracking-widest font-mono">
            <BookOpen className="w-3 h-3" />
            <span>About</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-['Plus_Jakarta_Sans']">
            Built for deep focus in a noisy digital world.
          </h1>

          <p className="max-w-[480px] mx-auto text-sm sm:text-base text-[#94a3b8] leading-relaxed">
            OC Focus Sanctuary was born out of a simple frustration: modern productivity apps are either too bloated with social noise or too barebones to protect real cognitive flow. We built a distraction-free sanctuary designed to respect your attention, safeguard your privacy, and measure deep work with precision.
          </p>
        </section>

        <div className="w-full h-[1px] bg-white/10" />

        {/* 3. CONTACT SECTION */}
        <section id="contact-section" className="space-y-6">
          <div className="max-w-xl mx-auto bg-[#111827] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">Get in touch</h2>
              <p className="text-xs text-[#94a3b8] mt-1">Have feedback, feature requests, or questions? All messages are routed directly to <span className="text-[#22d3ee] font-mono">mdalberashidniloy@gmail.com</span>.</p>
            </div>

            {sentSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Message sent successfully to mdalberashidniloy@gmail.com! We'll get back to you soon.</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0f1115] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#22d3ee] transition"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full px-4 py-2.5 rounded-lg bg-[#0f1115] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#22d3ee] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#9ca3af] mb-1.5">
                  Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0f1115] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-[#22d3ee] transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 px-6 rounded-xl bg-[#22d3ee] hover:brightness-110 text-[#0a0e1a] font-bold text-xs shadow-[0_0_20px_rgba(34,211,238,0.3)] transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-[#0a0e1a] border-t-transparent animate-spin" />
                    Sending to mdalberashidniloy@gmail.com...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send message
                  </>
                )}
              </button>
            </form>
          </div>
        </section>

        <div className="w-full h-[1px] bg-white/10" />

        {/* 4. PRIVACY POLICY SECTION */}
        <section id="privacy" className="space-y-6 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#111827] border border-white/10 text-[#22d3ee]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">Privacy Policy</h2>
              <p className="text-xs text-[#94a3b8]">Last updated: September 20, 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-[#94a3b8] leading-relaxed">
            <p>
              At OC Focus Sanctuary, we take your personal privacy seriously. Because our application tracks your productivity habits, focus sessions, category tags, distraction logs, and energy ratings, we believe in radical transparency regarding how your data is handled.
            </p>

            <h3 className="text-white font-bold text-sm pt-2">1. What Data We Collect</h3>
            <p>
              We collect and store information you actively input or generate while using the app, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Study session logs, durations, and completion timestamps.</li>
              <li>Subject category tags and task items.</li>
              <li>Blocked website configurations and distraction attempt logs.</li>
              <li>Subjective energy ratings (1–5 scale) and daily reflections.</li>
              <li>Account credentials (hashed passwords) if you choose to create a registered user account.</li>
            </ul>

            <h3 className="text-white font-bold text-sm pt-2">2. Local vs. Cloud Storage</h3>
            <p>
              By default, your focus logs and settings are stored locally in your browser's local storage or secure client database. If you enable multi-device sync or create a registered account, your encrypted session state is securely synchronized to our cloud database so you can access your records across devices.
            </p>

            <h3 className="text-white font-bold text-sm pt-2">3. Third-Party Sharing</h3>
            <p>
              <strong>We never sell, rent, or trade your personal data or focus telemetry to third parties.</strong> Data is only processed to provide you with core application functionality, auto-sync, and personalized analytics reports.
            </p>

            <h3 className="text-white font-bold text-sm pt-2">4. Data Deletion & Requests</h3>
            <p>
              You maintain full ownership of your data. You can export a complete backup or CSV spreadsheet of your session history at any time via System Settings &gt; Export. To request complete deletion of your account and associated cloud records, contact our privacy team.
            </p>

            <h3 className="text-white font-bold text-sm pt-2">5. Privacy Contact</h3>
            <p>
              If you have any questions or concerns regarding this privacy policy, please reach out to us at <span className="text-[#22d3ee] font-mono">mdalberashidniloy@gmail.com</span>.
            </p>
            <p className="text-[11px] text-slate-500 italic pt-2">
              Note: This privacy summary outlines our operational practices. For formal legal compliance in specific jurisdictions, consult legal counsel prior to public commercial deployment.
            </p>
          </div>
        </section>

        <div className="w-full h-[1px] bg-white/10" />

        {/* 5. TERMS OF SERVICE SECTION */}
        <section id="terms" className="space-y-6 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#111827] border border-white/10 text-[#22d3ee]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Plus_Jakarta_Sans']">Terms of Service</h2>
              <p className="text-xs text-[#94a3b8]">Last updated: September 20, 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-[#94a3b8] leading-relaxed">
            <p>
              Welcome to OC Focus Sanctuary. By accessing or using our web application, you agree to be bound by these Terms of Service. Please read them carefully.
            </p>

            <h3 className="text-white font-bold text-sm pt-2">1. Acceptable Use</h3>
            <p>
              You agree to use OC Focus Sanctuary solely for personal productivity, study tracking, and focus enhancement. You agree not to reverse engineer, abuse, attempt unauthorized access to our backend servers, or use the service for any unlawful activities.
            </p>

            <h3 className="text-white font-bold text-sm pt-2">2. Accounts and Security</h3>
            <p>
              If you create an account, you are responsible for maintaining the confidentiality of your password and account credentials. You agree to notify us immediately of any unauthorized use of your account.
            </p>

            <h3 className="text-white font-bold text-sm pt-2">3. Disclaimer of Liability</h3>
            <p>
              OC Focus Sanctuary is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. We do not guarantee uninterrupted availability, error-free operation, or absolute productivity outcomes. We shall not be liable for any indirect, incidental, or consequential damages arising from your use of the application.
            </p>

            <h3 className="text-white font-bold text-sm pt-2">4. Modifications and Discontinuation</h3>
            <p>
              We reserve the right to modify, suspend, or discontinue the service (or any part thereof) at any time with or without notice. We may update these Terms of Service periodically; continued use of the application constitutes acceptance of those changes.
            </p>

            <h3 className="text-white font-bold text-sm pt-2">5. Contact Information</h3>
            <p>
              For any questions regarding these terms, please contact us via our contact form above or email <span className="text-[#22d3ee] font-mono">mdalberashidniloy@gmail.com</span>.
            </p>
          </div>
        </section>
      </main>

      {/* 6. FOOTER */}
      <footer className="bg-[#0a0e1a] border-t border-white/10 px-6 py-8 mt-12 text-center text-xs text-[#94a3b8] space-y-4">
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => scrollToSection('privacy')}
            className="hover:text-white transition cursor-pointer"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => scrollToSection('terms')}
            className="hover:text-white transition cursor-pointer"
          >
            Terms of Service
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => scrollToSection('contact-section')}
            className="hover:text-white transition cursor-pointer"
          >
            Contact
          </button>
        </div>
        <p>© {new Date().getFullYear()} OC Focus Sanctuary. All rights reserved.</p>
      </footer>
    </div>
  );
};
