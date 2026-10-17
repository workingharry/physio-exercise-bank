import React, { useState, useEffect } from 'react';
import { Switch, Route, Router } from 'wouter';
import { Link } from 'wouter';
import { Navbar } from './components/layout/Navbar';
import { LibraryView } from './components/library/LibraryView';
import { ExerciseDetailView } from './components/detail/ExerciseDetailView';
import { ProtocolView } from './components/protocols/ProtocolView';
import { AnatomyIndexView } from './components/anatomy/AnatomyIndexView';
import { BookmarksView } from './components/bookmarks/BookmarksView';
import { RoutineBuilderView } from './components/builder/RoutineBuilderView';
import { CustomStudioView } from './components/custom/CustomStudioView';
import { useRoutineStore } from './store/useRoutineStore';
import { ShieldCheck, BookOpen } from 'lucide-react';

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
          <Route path="/anatomy" component={AnatomyIndexView} />
          <Route path="/protocols" component={ProtocolView} />
          <Route path="/notebook" component={BookmarksView} />
          <Route path="/bookmarks" component={BookmarksView} />
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
              PhysioBank 物理治療運動百科知識庫 · 完整 387 動作離線參考庫
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>基於 JOSPT / Aspetar / Melbourne ACL 臨床指引</span>
            <span>·</span>
            <span>100% 離線本地運算 · 無外部 API 依賴</span>
          </div>
        </div>
      </footer>
    </div>
    </Router>
  );
}

export default App;
