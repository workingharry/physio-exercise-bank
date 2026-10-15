import React, { useState, useEffect } from 'react';
import { Switch, Route, Router } from 'wouter';
import { Link } from 'wouter';
import { Navbar } from './components/layout/Navbar';
import { LibraryView } from './components/library/LibraryView';
import { ExerciseDetailView } from './components/detail/ExerciseDetailView';
import { ProtocolView } from './components/protocols/ProtocolView';
import { RoutineBuilderView } from './components/builder/RoutineBuilderView';
import { CustomStudioView } from './components/custom/CustomStudioView';
import { useRoutineStore } from './store/useRoutineStore';
import { ShieldCheck, Heart, ClipboardList } from 'lucide-react';

// Bulletproof hash location hook for 100% compatibility with file:// protocol and web servers
const currentHashLocation = () => {
  const hash = typeof window !== 'undefined' ? window.location.hash.replace(/^#?\/?/, '') : '';
  return '/' + hash;
};

const useSafeHashLocation = () => {
  const [loc, setLoc] = useState(currentHashLocation);

  useEffect(() => {
    const handler = () => setLoc(currentHashLocation());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = (to: string) => {
    const clean = to.replace(/^#?\/?/, '');
    window.location.hash = '/' + clean;
  };

  return [loc, navigate] as [string, (to: string, ...args: any[]) => any];
};
useSafeHashLocation.hrefs = (href: string) => '#' + (href.startsWith('/') ? href : '/' + href);

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const { routine } = useRoutineStore();
  const [loc] = useSafeHashLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router hook={useSafeHashLocation}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white transition-colors duration-150">
        {/* Navigation */}
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Multi-View Content */}
      <main className="flex-1 pb-16 md:pb-0">
        <Switch>
          <Route path="/" component={LibraryView} />
          <Route path="/library" component={LibraryView} />
          <Route path="/exercise/:id" component={ExerciseDetailView} />
          <Route path="/protocols" component={ProtocolView} />
          <Route path="/builder" component={RoutineBuilderView} />
          <Route path="/custom" component={CustomStudioView} />
          <Route>
            <div className="max-w-4xl mx-auto py-24 text-center">
              <h2 className="text-2xl font-bold">404 - 找不到此頁面</h2>
              <a href="/" className="mt-4 inline-block px-4 py-2 bg-teal-600 rounded-xl text-white text-xs font-semibold">
                返回首頁
              </a>
            </div>
          </Route>
        </Switch>
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 py-8 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            <span>
              PhysioBank 物理治療復健運動處方庫 · 僅供物理治療實習教學與學術複習參考
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>V1 下肢關節核心庫 (387 動作)</span>
            <span>·</span>
            <span>JOSPT / Aspetar / Melbourne ACL 指引</span>
          </div>
        </div>
      </footer>

      {/* Floating Prescription Count Badge */}
      {routine.length > 0 && loc !== '/builder' && (
        <Link
          href="/builder"
          className="no-print fixed bottom-20 md:bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-2xl shadow-teal-600/40 hover:scale-105 active:scale-95 transition-all group border border-teal-400/40"
        >
          <ClipboardList className="w-4 h-4 text-white" />
          <span>已選處方</span>
          <span className="w-5 h-5 rounded-full bg-white text-teal-800 text-xs font-black flex items-center justify-center shadow-sm">
            {routine.length}
          </span>
        </Link>
      )}
    </div>
    </Router>
  );
}

export default App;
