import React from 'react';
import { Link, useLocation } from 'wouter';
import { BookOpen, Layers, Stethoscope, Bookmark, Moon, Sun, Code2, GraduationCap } from 'lucide-react';
import { useRoutineStore } from '../../store/useRoutineStore';

interface Props {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<Props> = ({ darkMode, setDarkMode }) => {
  const [location] = useLocation();
  const { bookmarks } = useRoutineStore();

  const navLinks = [
    { href: '/', label: '運動百科', icon: BookOpen },
    { href: '/anatomy', label: '肌群解剖', icon: Layers },
    { href: '/protocols', label: '病症指南', icon: Stethoscope },
    { href: '/notebook', label: '研讀筆記', icon: Bookmark, badge: bookmarks.length },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-300 dark:to-blue-400 bg-clip-text text-transparent">
                PhysioBank
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-700/60">
                運動百科
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">物理治療下肢運動百科知識庫</p>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-xl border border-slate-200 dark:border-slate-800/80">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-cyan-400 text-slate-950 font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-amber-500 transition"
            title="切換淺色/深色主題模式"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <a
            href="https://github.com/workingharry/physio-exercise-bank"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium transition"
          >
            <Code2 className="w-4 h-4 text-teal-500" />
            <span>GitHub 庫</span>
          </a>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Ergonomic thumb reach) */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md py-2 px-1 shadow-2xl">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-lg transition ${
                isActive ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-teal-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {link.badge}
                  </span>
                )}
              </div>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
};
