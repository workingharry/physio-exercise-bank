import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { searchConditions, conditionsByRegion } from '../../data/selectors';
import { Condition } from '../../types/exercise';
import { 
  Search, Stethoscope, ChevronRight, ArrowRight, Layers, 
  Sparkles, AlertCircle, Compass, CheckCircle2, Shield
} from 'lucide-react';

interface Props {
  onSwitchToReview: () => void;
}

export const ConditionSearchView: React.FC<Props> = ({ onSwitchToReview }) => {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const match = window.location.hash.match(/[?&]region=([^&]+)/);
      if (match) return decodeURIComponent(match[1]);
    }
    return 'ALL';
  });
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync selectedRegionFilter on hashchange
  useEffect(() => {
    const handleHash = () => {
      const match = window.location.hash.match(/[?&]region=([^&]+)/);
      if (match) {
        setSelectedRegionFilter(decodeURIComponent(match[1]));
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Search results
  const searchResults = useMemo(() => {
    return searchConditions(query);
  }, [query]);

  // Dropdown suggestions (top 6 matches)
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    return searchResults.slice(0, 6);
  }, [query, searchResults]);

  // Grouped conditions when query is empty
  const regions = ['Ankle & Foot', 'Knee', 'Hip & Pelvis'];
  const regionNamesZh: Record<string, string> = {
    'Ankle & Foot': '腳踝與足部 (Ankle & Foot)',
    'Knee': '膝關節與髕骨 (Knee & Patella)',
    'Hip & Pelvis': '髖關節與骨盆 (Hip & Pelvis)'
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const target = selectedIndex >= 0 ? suggestions[selectedIndex] : suggestions[0];
      if (target) {
        navigate(`/condition/${target.id}`);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Hero Search Box (Editorial Claude Warmth: Centered, Calm, High-Impact) */}
      <div className="relative max-w-3xl mx-auto pt-4 pb-2 text-center space-y-3">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          依臨床病症檢索運動處方
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-xl mx-auto leading-relaxed">
          輸入口語症狀或醫學名詞（如「腳踝扭傷」、「膝痛」、「ACL」、「跟腱病變」），30 秒內直達臨床分期處方
        </p>

        {/* Intelligent Search Input with Autocomplete */}
        <div className="relative mt-4 text-left">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-amber-700/70 dark:text-amber-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsDropdownOpen(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="搜尋病症名稱、別名或症狀關鍵字（支援繁簡容錯）..."
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-[#201D1A] border-2 border-amber-800/20 dark:border-amber-700/30 hover:border-amber-700/40 focus:border-amber-700 dark:focus:border-amber-500 rounded-2xl text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder:text-stone-400 shadow-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 transition"
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setIsDropdownOpen(false);
                  inputRef.current?.focus();
                }}
                className="absolute right-3.5 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {isDropdownOpen && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-[#201D1A] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl overflow-hidden divide-y divide-stone-100 dark:divide-stone-800">
              {suggestions.map((cond, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <Link
                    key={cond.id}
                    href={`/condition/${cond.id}`}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex items-center justify-between p-3.5 transition text-left ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200'
                        : 'hover:bg-stone-50 dark:hover:bg-stone-900/60 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <strong className="font-serif font-bold text-sm">
                          {cond.nameEn}
                        </strong>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                          {cond.region}
                        </span>
                      </div>
                      <p className="text-xs text-amber-900 dark:text-amber-300 font-medium">
                        {cond.nameZh}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-semibold shrink-0">
                      <span>查看處方</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Region Filter Chips & Fast Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 pb-1 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedRegionFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              selectedRegionFilter === 'ALL'
                ? 'bg-amber-800 text-amber-50 shadow-sm'
                : 'bg-white dark:bg-[#201D1A] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
            }`}
          >
            全部病症 (98)
          </button>
          {regions.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRegionFilter(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedRegionFilter === r
                  ? 'bg-amber-800 text-amber-50 shadow-sm'
                  : 'bg-white dark:bg-[#201D1A] text-stone-600 dark:text-stone-400 border border-stone-200 dark:border-stone-800'
              }`}
            >
              {r === 'Ankle & Foot' ? '腳踝足部' : r === 'Knee' ? '膝與髕骨' : '髖與骨盆'}
            </button>
          ))}
        </div>

        <button
          onClick={onSwitchToReview}
          className="text-xs font-semibold text-amber-800 dark:text-amber-400 hover:underline flex items-center gap-1 shrink-0"
        >
          <span>切換至部位瀏覽模式 (373 動作)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search Result or Grouped Condition Cards */}
      {query.trim() ? (
        // When searching
        searchResults.length === 0 ? (
          <div className="text-center py-16 bg-[#FAF8F5] dark:bg-[#201D1A] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 space-y-3">
            <AlertCircle className="w-10 h-10 mx-auto text-amber-600" />
            <h3 className="font-serif font-bold text-base text-stone-800 dark:text-stone-200">
              找不到相符的病症關鍵字
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              建議嘗試更廣義的字詞（例如「踝」、「膝」、「肌腱」），或者改用部位與肌群瀏覽方式查找。
            </p>
            <button
              onClick={onSwitchToReview}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-amber-50 text-xs font-bold transition shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>改用部位瀏覽模式查找</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs text-stone-500 font-medium">
              搜尋到 <strong>{searchResults.length}</strong> 個相關病症：
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map(c => (
                <ConditionCard key={c.id} condition={c} />
              ))}
            </div>
          </div>
        )
      ) : (
        // When no query is entered: Group by Region
        <div className="space-y-8">
          {regions
            .filter(r => selectedRegionFilter === 'ALL' || selectedRegionFilter === r)
            .map(r => {
              const condList = conditionsByRegion(r);
              return (
                <div key={r} className="space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-stone-200 dark:border-stone-800">
                    <h2 className="font-serif font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                      <span>{regionNamesZh[r] || r}</span>
                    </h2>
                    <span className="text-xs text-stone-400 font-medium">
                      共 {condList.length} 種病症協定
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {condList.map(c => (
                      <ConditionCard key={c.id} condition={c} />
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

// Sub-component: Condition Card
const ConditionCard: React.FC<{ condition: Condition }> = ({ condition }) => {
  return (
    <Link
      href={`/condition/${condition.id}`}
      className="group p-4 bg-white dark:bg-[#201D1A] rounded-2xl border border-stone-200 dark:border-stone-800 hover:border-amber-700/60 dark:hover:border-amber-600/60 transition shadow-sm hover:shadow-md flex flex-col justify-between space-y-3"
    >
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#F5F2EB] dark:bg-[#2A2622] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800">
            {condition.region}
          </span>
          {condition.bundleSize > 1 && (
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
              共用處方群
            </span>
          )}
        </div>

        <strong className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 group-hover:text-amber-800 dark:group-hover:text-amber-300 transition line-clamp-1 block">
          {condition.nameEn}
        </strong>

        <p className="text-xs text-stone-700 dark:text-stone-300 font-medium line-clamp-1">
          {condition.nameZh}
        </p>
      </div>

      {/* Phase Coverage badges */}
      <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1">
          {condition.phaseCoverage.map((p, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400"
            >
              {p.replace('Phase ', 'P')}
            </span>
          ))}
        </div>

        <span className="text-amber-700 dark:text-amber-400 font-semibold group-hover:translate-x-0.5 transition flex items-center gap-0.5">
          <span>協定</span>
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
};
