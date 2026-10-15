import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { Navbar } from './components/layout/Navbar';
import { LibraryView } from './components/library/LibraryView';
import { ExerciseDetailView } from './components/detail/ExerciseDetailView';
import { ProtocolView } from './components/protocols/ProtocolView';
import { RoutineBuilderView } from './components/builder/RoutineBuilderView';
import { CustomStudioView } from './components/custom/CustomStudioView';
import { ShieldCheck, Heart } from 'lucide-react';

export function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-white transition-colors duration-150">
      {/* Navigation */}
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Main Multi-View Content */}
      <main className="flex-1">
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
    </div>
  );
}

export default App;
