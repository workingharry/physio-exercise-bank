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
    { href: '/', label: '運動百科 (首頁)', icon: BookOpen },
    { href: '/anatomy', label: '肌群解剖', icon: Layers },
    { href: '/protocols', label: '病症指南', icon: Stethoscope },
    { href: '/notebook', label: '研讀筆記', icon: Bookmark, badge: bookmarks.length },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 dark:border-stone-800 bg-[#FAF8F5]/95 dark:bg-[#1C1917]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center shadow-md shadow-amber-900/10 group-hover:scale-105 transition">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-lg tracking-tight text-stone-900 dark:text-stone-100">
                PhysioBank
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60">
                v2 臨床雙模式
              </span>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">物理治療運動處方知識庫</p>
          </div>
        </Link>

        {/* Navigation Items (Editorial Warm Stone Style) */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#EFECE6] dark:bg-[#2A2622] p-1 rounded-xl border border-stone-200 dark:border-stone-800">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isActive
                    ? 'bg-amber-800 text-amber-50 shadow-sm'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-amber-600 text-white font-bold">
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
            className="p-2 rounded-xl bg-white dark:bg-[#201D1A] hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-700 transition shadow-sm"
            title="切換淺色/深色主題模式"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-600" />}
          </button>

          <a
            href="https://github.com/workingharry/physio-exercise-bank"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#201D1A] hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 font-medium transition shadow-sm"
          >
            <Code2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
            <span>GitHub 庫</span>
          </a>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-stone-200 dark:border-stone-800 bg-[#FAF8F5]/95 dark:bg-[#1C1917]/95 backdrop-blur-md py-2 px-1 shadow-2xl">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href || (link.href !== '/' && location.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-medium rounded-lg transition ${
                isActive ? 'text-amber-800 dark:text-amber-400 font-bold' : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-700 text-white text-[10px] flex items-center justify-center font-bold">
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
