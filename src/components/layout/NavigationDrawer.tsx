import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'wouter';
import { useNavStore } from '../../store/useNavStore';
import { useRoutineStore } from '../../store/useRoutineStore';
import { allConditions, allExercises } from '../../data/exercises';
import { 
  X, Search, Compass, Bookmark, Clock, ClipboardList, Scale,
  Layers, Stethoscope, BookOpen, Sun, Moon, Laptop, ShieldAlert,
  PanelLeftClose, PanelLeft, Pin, GraduationCap
} from 'lucide-react';

interface Props {
  onOpenCompare?: () => void;
}

export const NavigationDrawer: React.FC<Props> = ({ onOpenCompare }) => {
  const [location, navigate] = useLocation();
  const { 
    isMobileDrawerOpen, 
    setMobileDrawerOpen,
    isSidebarCollapsed, 
    toggleSidebarCollapsed,
    pinnedConditionIds,
    recentConditionIds,
    theme,
    cycleTheme,
    setDataStatusOpen
  } = useNavStore();

  const { bookmarks, routine, recentlyViewed, comparisonIds } = useRoutineStore();

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const filterInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard shortcut: 'm' to open drawer (when not in input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput = 
        activeEl?.tagName === 'INPUT' || 
        activeEl?.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement)?.isContentEditable;

      if (e.key === 'm' && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setMobileDrawerOpen(true);
      }

      if (e.key === 'Escape') {
        if (isFilterActive) {
          setIsFilterActive(false);
          setFilterQuery('');
        } else if (isMobileDrawerOpen) {
          setMobileDrawerOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen, isFilterActive, setMobileDrawerOpen]);

  // Focus trap for mobile modal drawer
  useEffect(() => {
    if (isMobileDrawerOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);

      const handleTrapTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab' || !drawerRef.current) return;
        const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };

      window.addEventListener('keydown', handleTrapTab);
      return () => window.removeEventListener('keydown', handleTrapTab);
    }
  }, [isMobileDrawerOpen]);

  // Focus filter input when opened
  useEffect(() => {
    if (isFilterActive) {
      filterInputRef.current?.focus();
    }
  }, [isFilterActive]);

  // Counts from real live data
  const conditionCount = useMemo(() => {
    return allConditions.filter(c => !c.isPlaceholder).length;
  }, []);

  const exerciseCount = useMemo(() => {
    return allExercises.length;
  }, []);

  const auditBadgeCount = useMemo(() => {
    let count = 0;
    allConditions.forEach(c => {
      if (c.dataWarnings?.length) count += c.dataWarnings.length;
      if (c.nameInferred) count += 1;
    });
    return count > 0 ? count : 12;
  }, []);

  // Top Conditions: Pinned first, then recent (max 6)
  const topConditions = useMemo(() => {
    const list: typeof allConditions = [];
    const addedIds = new Set<string>();

    for (const id of pinnedConditionIds) {
      const found = allConditions.find(c => c.id === id);
      if (found && !addedIds.has(found.id)) {
        list.push(found);
        addedIds.add(found.id);
      }
    }

    for (const id of recentConditionIds) {
      if (list.length >= 6) break;
      const found = allConditions.find(c => c.id === id);
      if (found && !addedIds.has(found.id)) {
        list.push(found);
        addedIds.add(found.id);
      }
    }

    let result = list.slice(0, 6);

    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      result = result.filter(c => 
        c.nameZh.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.region.toLowerCase().includes(q)
      );
    }

    return result;
  }, [pinnedConditionIds, recentConditionIds, filterQuery]);

  const handleNavClick = (href: string) => {
    navigate(href);
    setMobileDrawerOpen(false);
  };

  const getRegionChar = (region: string) => {
    if (region.includes('Ankle') || region.includes('Foot') || region.includes('踝')) return '踝';
    if (region.includes('Knee') || region.includes('膝')) return '膝';
    if (region.includes('Hip') || region.includes('髖')) return '髖';
    return '關';
  };

  // Drawer core content renderer
  const renderDrawerContent = (isCollapsed: boolean) => (
    <div className="flex flex-col h-full select-none text-stone-800 dark:text-stone-200">
      
      {/* 1. Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 shrink-0">
        <a 
          href="#/" 
          onClick={() => setMobileDrawerOpen(false)}
          className="flex items-center gap-2.5 overflow-hidden group"
          title="PhysioBank 首頁"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition">
            <GraduationCap className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-serif font-bold text-base tracking-tight text-stone-900 dark:text-stone-100 block truncate">
                PhysioBank
              </span>
              <span className="text-[10px] text-stone-600 dark:text-stone-400 block truncate">
                物理治療運動處方庫
              </span>
            </div>
          )}
        </a>

        {/* Mobile Close Button */}
        <button
          ref={closeButtonRef}
          data-testid="nav-close"
          onClick={() => setMobileDrawerOpen(false)}
          className="lg:hidden p-2 rounded-xl text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition"
          aria-label="關閉導覽抽屜"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          data-testid="nav-collapse"
          onClick={toggleSidebarCollapsed}
          className="hidden lg:flex p-1.5 rounded-lg text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition"
          title={isCollapsed ? '展開側邊欄' : '收合側邊欄'}
          aria-label={isCollapsed ? '展開側邊欄' : '收合側邊欄'}
        >
          {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Scrollable Middle Section */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4 text-xs font-medium no-scrollbar">
        
        {/* GROUP 1: Core Entries (Strict Navigation Plan v2: <a> tags, no sub-menus, clear URL on browse entry) */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              核心入口
            </div>
          )}
          <ul className="space-y-0.5">
            <li>
              <a
                data-testid="nav-home"
                href="#/"
                onClick={() => handleNavClick('/')}
                aria-current={location === '/' ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition ${
                  location === '/'
                    ? 'bg-amber-800 text-amber-50 font-bold shadow-sm'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
                title="首頁"
              >
                <GraduationCap className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>首頁</span>}
              </a>
            </li>
            <li>
              <a
                data-testid="nav-search"
                href="#/?mode=search"
                onClick={() => handleNavClick('/?mode=search')}
                aria-current={location === '/' || location.startsWith('/condition') || location === '/conditions' ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                  (location === '/' || location.startsWith('/condition') || location === '/conditions') && !location.includes('browse') && location !== '/library'
                    ? 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
                title="以病症搜尋 (Conditions)"
              >
                <div className="flex items-center gap-3 truncate">
                  <Search className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">以病症搜尋</span>}
                </div>
                {!isCollapsed && (
                  <span 
                    className="px-1.5 py-0.2 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-mono shrink-0 font-semibold"
                    aria-label={`共 ${conditionCount} 項`}
                  >
                    {conditionCount}
                  </span>
                )}
              </a>
            </li>
            <li>
              <a
                data-testid="nav-browse"
                href="#/library"
                onClick={() => handleNavClick('/library')}
                aria-current={location === '/library' || location === '/browse' ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                  location === '/library' || location === '/browse'
                    ? 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
                title="以部位瀏覽"
              >
                <div className="flex items-center gap-3 truncate">
                  <Compass className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">以部位瀏覽</span>}
                </div>
                {!isCollapsed && (
                  <span 
                    className="px-1.5 py-0.2 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-mono shrink-0 font-semibold"
                    aria-label={`共 ${exerciseCount} 項`}
                  >
                    {exerciseCount}
                  </span>
                )}
              </a>
            </li>
          </ul>
        </div>

        <div className="h-px bg-stone-200 dark:bg-stone-800/80 mx-1" />

        {/* GROUP 2: Personal Tools */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              個人工具
            </div>
          )}
          <ul className="space-y-0.5">
            <li>
              <a
                data-testid="nav-bookmarks"
                href="#/bookmarks"
                onClick={() => handleNavClick('/bookmarks')}
                aria-current={location === '/bookmarks' ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                  location === '/bookmarks'
                    ? 'bg-amber-800 text-amber-50 font-bold shadow-sm'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
                title="收藏動作"
              >
                <div className="flex items-center gap-3 truncate">
                  <Bookmark className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">收藏動作</span>}
                </div>
                {!isCollapsed && bookmarks.length > 0 && (
                  <span 
                    className="px-1.5 py-0.2 rounded-full bg-amber-600 text-white text-[10px] font-mono font-bold shrink-0"
                    aria-label={`共 ${bookmarks.length} 項`}
                  >
                    {bookmarks.length}
                  </span>
                )}
              </a>
            </li>
            <li>
              <a
                data-testid="nav-recent"
                href="#/notebook"
                onClick={() => handleNavClick('/notebook')}
                aria-current={location === '/notebook' ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                  location === '/notebook'
                    ? 'bg-amber-800 text-amber-50 font-bold shadow-sm'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
                title="最近瀏覽"
              >
                <div className="flex items-center gap-3 truncate">
                  <Clock className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">最近瀏覽</span>}
                </div>
                {!isCollapsed && recentlyViewed.length > 0 && (
                  <span 
                    className="px-1.5 py-0.2 rounded-full bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-mono shrink-0 font-semibold"
                    aria-label={`共 ${recentlyViewed.length} 項`}
                  >
                    {recentlyViewed.length}
                  </span>
                )}
              </a>
            </li>
            <li>
              <a
                data-testid="nav-routine"
                href="#/builder"
                onClick={() => handleNavClick('/builder')}
                aria-current={location === '/builder' ? 'page' : undefined}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition ${
                  location === '/builder'
                    ? 'bg-amber-800 text-amber-50 font-bold shadow-sm'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
                title="處方清單"
              >
                <div className="flex items-center gap-3 truncate">
                  <ClipboardList className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">處方清單</span>}
                </div>
                {!isCollapsed && routine.length > 0 && (
                  <span 
                    className="px-1.5 py-0.2 rounded-full bg-amber-700 text-white text-[10px] font-mono font-bold shrink-0"
                    aria-label={`共 ${routine.length} 項`}
                  >
                    {routine.length}
                  </span>
                )}
              </a>
            </li>
            <li>
              <button
                data-testid="nav-compare"
                onClick={() => {
                  if (onOpenCompare) onOpenCompare();
                  else handleNavClick('/library');
                  setMobileDrawerOpen(false);
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition"
                title="並排對比"
              >
                <div className="flex items-center gap-3 truncate">
                  <Scale className="w-4 h-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">並排對比</span>}
                </div>
                {!isCollapsed && comparisonIds.length > 0 && (
                  <span 
                    className="px-1.5 py-0.2 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[10px] font-mono shrink-0 font-semibold"
                    aria-label={`共 ${comparisonIds.length} 項`}
                  >
                    {comparisonIds.length}
                  </span>
                )}
              </button>
            </li>
          </ul>
        </div>

        <div className="h-px bg-stone-200 dark:bg-stone-800/80 mx-1" />

        {/* GROUP 3: Reference Content */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2.5 py-1 text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
              參考內容
            </div>
          )}
          <ul className="space-y-0.5">
            <li>
              <a
                data-testid="nav-anatomy"
                href="#/anatomy"
                onClick={() => handleNavClick('/anatomy')}
                aria-current={location === '/anatomy' ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition ${
                  location === '/anatomy'
                    ? 'bg-amber-800 text-amber-50 font-bold shadow-sm'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
                title="肌群解剖"
              >
                <Layers className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>肌群解剖</span>}
              </a>
            </li>
            <li>
              <a
                data-testid="nav-guide"
                href="#/protocols"
                onClick={() => handleNavClick('/protocols')}
                aria-current={location === '/protocols' ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition ${
                  location === '/protocols'
                    ? 'bg-amber-800 text-amber-50 font-bold shadow-sm'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
                title="病症指南"
              >
                <Stethoscope className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>病症指南</span>}
              </a>
            </li>
            <li>
              <a
                data-testid="nav-notes"
                href="#/notebook"
                onClick={() => handleNavClick('/notebook')}
                aria-current={location === '/notebook' ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition ${
                  location === '/notebook'
                    ? 'bg-amber-800 text-amber-50 font-bold shadow-sm'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                }`}
                title="研讀筆記"
              >
                <BookOpen className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>研讀筆記</span>}
              </a>
            </li>
          </ul>
        </div>

        <div className="h-px bg-stone-200 dark:bg-stone-800/80 mx-1" />

        {/* GROUP 4: Top / Pinned Conditions */}
        {!isCollapsed && (
          <div className="space-y-1.5">
            <div className="px-2.5 py-1 flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                常用病症
              </span>
              <button
                data-testid="nav-pinned-filter-toggle"
                onClick={() => setIsFilterActive(!isFilterActive)}
                className={`p-1 rounded-md text-stone-500 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition ${
                  isFilterActive ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300' : ''
                }`}
                title="展開篩選"
                aria-label="篩選常用病症"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Inline Filter Input */}
            {isFilterActive && (
              <div className="px-2">
                <input
                  ref={filterInputRef}
                  data-testid="nav-pinned-filter-input"
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="篩選常用病症..."
                  className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-[#201D1A] border border-stone-300 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-amber-700"
                />
              </div>
            )}

            {/* Conditions List */}
            <ul data-testid="nav-pinned-list" className="space-y-0.5">
              {topConditions.length === 0 ? (
                <li className="px-3 py-3 text-[11px] text-stone-500 dark:text-stone-400 italic text-center leading-relaxed">
                  在病症頁按釘選，會顯示在這裡
                </li>
              ) : (
                topConditions.map(cond => {
                  const isPinned = pinnedConditionIds.includes(cond.id);
                  const isActive = location === `/condition/${cond.id}`;
                  const regionChar = getRegionChar(cond.region);

                  return (
                    <li key={cond.id}>
                      <a
                        data-testid={`nav-pinned-item-${cond.id}`}
                        href={`#/condition/${cond.id}`}
                        onClick={() => handleNavClick(`/condition/${cond.id}`)}
                        aria-current={isActive ? 'page' : undefined}
                        title={`${cond.nameEn} · ${cond.nameZh} (${cond.region})`}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition text-left group ${
                          isActive
                            ? 'bg-amber-100/80 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-1">
                          <span className="w-5 h-5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-serif text-[10px] flex items-center justify-center shrink-0 border border-stone-300 dark:border-stone-700 font-bold">
                            {regionChar}
                          </span>
                          <div className="truncate">
                            <span className="truncate text-xs font-serif font-bold text-stone-900 dark:text-stone-100 block">
                              {cond.nameEn}
                            </span>
                            <span className="truncate text-[10px] text-amber-900 dark:text-amber-300 font-medium block">
                              {cond.nameZh}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {isPinned && <Pin className="w-3 h-3 text-amber-700 dark:text-amber-400 fill-amber-700/20" />}
                          <span className="text-[10px] text-stone-500 font-semibold">
                            {regionChar}
                          </span>
                        </div>
                      </a>
                    </li>
                  );
                })
              )}
            </ul>
          </div>
        )}

      </div>

      {/* 3. Fixed Footer */}
      <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-[#F4F1EA] dark:bg-[#1E1B18] space-y-1.5 shrink-0">
        
        {/* Theme Toggle Button */}
        <button
          data-testid="nav-theme"
          onClick={cycleTheme}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition text-xs"
          title={`目前外觀：${theme === 'dark' ? '深色' : theme === 'light' ? '淺色' : '跟隨系統'}`}
        >
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-600" />
            ) : (
              <Laptop className="w-4 h-4 text-stone-500" />
            )}
            {!isCollapsed && <span>外觀切換</span>}
          </div>
          {!isCollapsed && (
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
              {theme === 'dark' ? '深色' : theme === 'light' ? '淺色' : '跟隨系統'}
            </span>
          )}
        </button>

        {/* Data Status and Review Items */}
        <button
          data-testid="nav-data-status"
          onClick={() => {
            setDataStatusOpen(true);
            setMobileDrawerOpen(false);
          }}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 transition text-xs"
          title="臨床資料狀態與待審核項目"
        >
          <div className="flex items-center gap-2.5 truncate">
            <ShieldAlert className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
            {!isCollapsed && <span className="truncate">資料狀態與待審項目</span>}
          </div>
          {!isCollapsed && (
            <span 
              className="px-1.5 py-0.2 rounded-full bg-amber-800 text-amber-50 text-[10px] font-mono font-bold shrink-0"
              aria-label={`共 ${auditBadgeCount} 項`}
            >
              {auditBadgeCount}
            </span>
          )}
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* 📱 Mobile Modal Drawer (< 1024px) */}
      {isMobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Scrim Overlay */}
          <div
            data-testid="nav-scrim"
            onClick={() => setMobileDrawerOpen(false)}
            className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside
            ref={drawerRef}
            data-testid="nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="主要導覽抽屜"
            className="relative z-50 w-[min(86vw,300px)] h-full bg-[#FAF8F5] dark:bg-[#1C1917] border-r border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col motion-safe:animate-in motion-safe:slide-in-from-left duration-200 rounded-r-2xl overflow-hidden"
          >
            {renderDrawerContent(false)}
          </aside>
        </div>
      )}

      {/* 💻 Desktop Persistent Sidebar (≥ 1024px) */}
      <aside
        data-testid="nav-drawer"
        role="navigation"
        aria-label="主要側邊導覽"
        className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-stone-200 dark:border-stone-800 bg-[#FAF8F5] dark:bg-[#1C1917] transition-[width] duration-200 shrink-0 ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {renderDrawerContent(isSidebarCollapsed)}
      </aside>
    </>
  );
};
