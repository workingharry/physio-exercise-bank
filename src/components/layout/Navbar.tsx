import React from 'react';
import { Link } from 'wouter';
import { Menu, Sun, Moon, Laptop, Code2, GraduationCap } from 'lucide-react';
import { useNavStore } from '../../store/useNavStore';

export const Navbar: React.FC = () => {
  const { toggleMobileDrawer, theme, cycleTheme } = useNavStore();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-stone-200 dark:border-stone-800 bg-[#FAF8F5]/95 dark:bg-[#1C1917]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Left: Mobile Hamburger (nav-open) + Brand */}
        <div className="flex items-center gap-3">
          <button
            data-testid="nav-open"
            onClick={toggleMobileDrawer}
            className="lg:hidden p-2 -ml-2 rounded-xl text-stone-700 dark:text-stone-300 hover:text-amber-800 dark:hover:text-amber-400 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition"
            aria-label="開啟導覽選單"
            title="開啟導覽選單 (快捷鍵: m)"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center shadow-md shadow-amber-900/10 group-hover:scale-105 transition">
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
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={cycleTheme}
            className="p-2 rounded-xl bg-white dark:bg-[#201D1A] hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-amber-700 transition shadow-sm"
            title={`切換外觀 (目前: ${theme === 'dark' ? '深色' : theme === 'light' ? '淺色' : '跟隨系統'})`}
          >
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-600" />
            ) : (
              <Laptop className="w-4 h-4 text-stone-500" />
            )}
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
    </header>
  );
};
