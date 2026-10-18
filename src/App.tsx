import React, { useState, useEffect } from 'react';
import { Switch, Route, Router } from 'wouter';
import { Navbar } from './components/layout/Navbar';
import { NavigationDrawer } from './components/layout/NavigationDrawer';
import { DataStatusModal } from './components/modals/DataStatusModal';
import { LibraryView } from './components/library/LibraryView';
import { ExerciseDetailView } from './components/detail/ExerciseDetailView';
import { ProtocolView } from './components/protocols/ProtocolView';
import { AnatomyIndexView } from './components/anatomy/AnatomyIndexView';
import { BookmarksView } from './components/bookmarks/BookmarksView';
import { RoutineBuilderView } from './components/builder/RoutineBuilderView';
import { CustomStudioView } from './components/custom/CustomStudioView';
import { ConditionDetailView } from './components/conditions/ConditionDetailView';
import { ExerciseCompareModal } from './components/library/ExerciseCompareModal';
import { useNavStore, applyThemeToDOM } from './store/useNavStore';
import { useRoutineStore } from './store/useRoutineStore';
import { allExercises } from './data/exercises';
import { Exercise } from './types/exercise';
import { ShieldCheck } from 'lucide-react';

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
  const { theme, isDataStatusOpen, setDataStatusOpen } = useNavStore();
  const { comparisonIds, customExercises } = useRoutineStore();
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const comparisonExercises = React.useMemo(() => {
    const combined = [...customExercises, ...allExercises];
    return comparisonIds
      .map(id => combined.find(ex => ex.id === id))
      .filter((ex): ex is Exercise => Boolean(ex));
  }, [comparisonIds, customExercises]);

  return (
    <Router hook={useSafeHashLocation}>
      <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#1C1917] text-stone-900 dark:text-stone-100 flex flex-col lg:flex-row font-sans selection:bg-amber-600 selection:text-white transition-colors duration-150">
        
        {/* Navigation Drawer (Mobile modal + Desktop persistent rail) */}
        <NavigationDrawer onOpenCompare={() => setIsCompareModalOpen(true)} />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header Navbar */}
          <Navbar />

          {/* Main Multi-View Content */}
          <main className="flex-1 pb-16 lg:pb-0">
            <Switch>
              <Route path="/" component={LibraryView} />
              <Route path="/library" component={LibraryView} />
              <Route path="/browse" component={LibraryView} />
              <Route path="/condition/:id" component={ConditionDetailView} />
              <Route path="/exercise/:id" component={ExerciseDetailView} />
              <Route path="/anatomy" component={AnatomyIndexView} />
              <Route path="/protocols" component={ProtocolView} />
              <Route path="/notebook" component={BookmarksView} />
              <Route path="/bookmarks" component={BookmarksView} />
              <Route path="/builder" component={RoutineBuilderView} />
              <Route path="/custom" component={CustomStudioView} />
              <Route>
                <div className="max-w-4xl mx-auto py-24 text-center">
                  <h2 className="text-2xl font-serif font-bold">404 - 找不到此頁面</h2>
                  <a href="/" className="mt-4 inline-block px-4 py-2 bg-amber-800 hover:bg-amber-900 rounded-xl text-amber-50 text-xs font-semibold">
                    返回首頁
                  </a>
                </div>
              </Route>
            </Switch>
          </main>

          {/* Footer */}
          <footer className="no-print mt-auto border-t border-stone-200 dark:border-stone-800/80 bg-white/80 dark:bg-[#201D1A]/80 py-6 px-4 text-xs text-stone-500 dark:text-stone-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>
                  PhysioBank 物理治療運動百科知識庫 · 完整 373 動作離線參考庫
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

        {/* Global Modals */}
        <DataStatusModal 
          isOpen={isDataStatusOpen} 
          onClose={() => setDataStatusOpen(false)} 
        />

        <ExerciseCompareModal
          isOpen={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
          exercises={comparisonExercises}
        />

      </div>
    </Router>
  );
}

export default App;
