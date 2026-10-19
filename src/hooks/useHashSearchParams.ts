import { useState, useEffect, useCallback, useTransition } from 'react';

export interface LibraryUrlFilters {
  region: 'all' | 'ankle' | 'knee' | 'hip';
  movementTypes: string[];
  rehabPhases: string[];
  equipment: string[];
  difficulty: string;
  kineticChain: string;
  search: string;
  unknownParams: string[];
}

export const REGION_CODE_TO_SUBREGION: Record<string, string> = {
  all: 'ALL',
  ankle: 'Ankle & Foot',
  knee: 'Knee',
  hip: 'Hip & Pelvis'
};

export const SUBREGION_TO_REGION_CODE: Record<string, 'all' | 'ankle' | 'knee' | 'hip'> = {
  ALL: 'all',
  'Ankle & Foot': 'ankle',
  Knee: 'knee',
  'Hip & Pelvis': 'hip'
};

export const parseLibraryFiltersFromHash = (hash: string): LibraryUrlFilters => {
  const qIndex = hash.indexOf('?');
  const unknownParams: string[] = [];
  
  if (qIndex === -1) {
    return {
      region: 'all',
      movementTypes: [],
      rehabPhases: [],
      equipment: [],
      difficulty: 'ALL',
      kineticChain: 'ALL',
      search: '',
      unknownParams: []
    };
  }

  const queryString = hash.slice(qIndex + 1);
  const params = new URLSearchParams(queryString);

  // Check legacy subRegion param
  let rawRegion = params.get('region');
  const legacySubRegion = params.get('subRegion');
  if (!rawRegion && legacySubRegion) {
    if (legacySubRegion === 'Ankle & Foot') rawRegion = 'ankle';
    else if (legacySubRegion === 'Knee') rawRegion = 'knee';
    else if (legacySubRegion === 'Hip & Pelvis') rawRegion = 'hip';
    else if (legacySubRegion === 'ALL') rawRegion = 'all';
  }

  let region: 'all' | 'ankle' | 'knee' | 'hip' = 'all';
  if (rawRegion) {
    const lower = rawRegion.toLowerCase().trim();
    if (lower === 'ankle' || lower === 'knee' || lower === 'hip' || lower === 'all') {
      region = lower as any;
    } else {
      unknownParams.push(`region=${rawRegion}`);
    }
  }

  const rawTypes = params.get('type') || params.get('movementTypes');
  const movementTypes = rawTypes ? rawTypes.split(',').map(s => s.trim()).filter(Boolean) : [];

  const rawPhases = params.get('phase') || params.get('rehabPhases');
  const rehabPhases: string[] = [];
  if (rawPhases) {
    const phaseTokens = rawPhases.split(',').map(s => s.trim()).filter(Boolean);
    for (const pt of phaseTokens) {
      if (pt === '1' || pt.includes('Phase 1')) rehabPhases.push('Phase 1: 急性保護/神經肌肉活化');
      else if (pt === '2' || pt.includes('Phase 2')) rehabPhases.push('Phase 2: 次急性控制負荷');
      else if (pt === '3' || pt.includes('Phase 3')) rehabPhases.push('Phase 3: 後期肌力與肥大強化');
      else if (pt === '4' || pt.includes('Phase 4')) rehabPhases.push('Phase 4: 增強式與重返運動');
      else unknownParams.push(`phase=${pt}`);
    }
  }

  const rawEquip = params.get('equip') || params.get('equipment');
  const equipment = rawEquip ? rawEquip.split(',').map(s => s.trim()).filter(Boolean) : [];

  const rawDiff = params.get('diff') || params.get('difficulty');
  let difficulty = 'ALL';
  if (rawDiff) {
    const ld = rawDiff.toLowerCase();
    if (ld === 'beginner' || ld.includes('初階')) difficulty = 'Beginner (初階)';
    else if (ld === 'intermediate' || ld.includes('中階')) difficulty = 'Intermediate (中階)';
    else if (ld === 'advanced' || ld.includes('進階')) difficulty = 'Advanced (進階)';
    else if (ld !== 'all') unknownParams.push(`diff=${rawDiff}`);
  }

  const rawChain = params.get('chain') || params.get('kineticChain');
  let kineticChain = 'ALL';
  if (rawChain) {
    const lc = rawChain.toLowerCase();
    if (lc === 'okc' || lc.includes('開放鏈')) kineticChain = '開放鏈 (OKC)';
    else if (lc === 'ckc' || lc.includes('閉鎖鏈')) kineticChain = '閉鎖鏈 (CKC)';
    else if (lc !== 'all') unknownParams.push(`chain=${rawChain}`);
  }

  const search = params.get('q') || params.get('search') || '';

  return {
    region,
    movementTypes,
    rehabPhases,
    equipment,
    difficulty,
    kineticChain,
    search,
    unknownParams
  };
};

export const serializeLibraryFiltersToHash = (filters: Partial<LibraryUrlFilters>): string => {
  const params = new URLSearchParams();

  if (filters.region && filters.region !== 'all') {
    params.set('region', filters.region);
  }

  if (filters.movementTypes && filters.movementTypes.length > 0) {
    params.set('type', filters.movementTypes.join(','));
  }

  if (filters.rehabPhases && filters.rehabPhases.length > 0) {
    const shortPhases = filters.rehabPhases.map(p => {
      if (p.includes('Phase 1')) return '1';
      if (p.includes('Phase 2')) return '2';
      if (p.includes('Phase 3')) return '3';
      if (p.includes('Phase 4')) return '4';
      return p;
    });
    params.set('phase', shortPhases.join(','));
  }

  if (filters.equipment && filters.equipment.length > 0) {
    params.set('equip', filters.equipment.join(','));
  }

  if (filters.difficulty && filters.difficulty !== 'ALL') {
    if (filters.difficulty.includes('Beginner') || filters.difficulty.includes('初階')) params.set('diff', 'beginner');
    else if (filters.difficulty.includes('Intermediate') || filters.difficulty.includes('中階')) params.set('diff', 'intermediate');
    else if (filters.difficulty.includes('Advanced') || filters.difficulty.includes('進階')) params.set('diff', 'advanced');
  }

  if (filters.kineticChain && filters.kineticChain !== 'ALL') {
    if (filters.kineticChain.includes('OKC') || filters.kineticChain.includes('開放鏈')) params.set('chain', 'okc');
    else if (filters.kineticChain.includes('CKC') || filters.kineticChain.includes('閉鎖鏈')) params.set('chain', 'ckc');
  }

  if (filters.search && filters.search.trim()) {
    params.set('q', filters.search.trim());
  }

  const qs = params.toString();
  return qs ? `#/library?${qs}` : `#/library`;
};

export const useHashSearchParams = () => {
  const [filters, setFilters] = useState<LibraryUrlFilters>(() => {
    return typeof window !== 'undefined'
      ? parseLibraryFiltersFromHash(window.location.hash)
      : {
          region: 'all',
          movementTypes: [],
          rehabPhases: [],
          equipment: [],
          difficulty: 'ALL',
          kineticChain: 'ALL',
          search: '',
          unknownParams: []
        };
  });

  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseLibraryFiltersFromHash(window.location.hash);
      setFilters(parsed);

      // Automatic redirect for legacy parameter subRegion -> region
      if (window.location.hash.includes('subRegion=')) {
        const newHash = serializeLibraryFiltersToHash(parsed);
        window.history.replaceState(null, '', newHash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const updateFilters = useCallback((next: Partial<LibraryUrlFilters>, mode: 'replace' | 'push' = 'replace') => {
    const merged = { ...filters, ...next };
    const newHash = serializeLibraryFiltersToHash(merged);
    if (mode === 'replace') {
      window.history.replaceState(null, '', newHash);
    } else {
      window.location.hash = newHash.replace(/^#/, '');
    }
    setFilters(parseLibraryFiltersFromHash(newHash));
  }, [filters]);

  const clearAllFilters = useCallback(() => {
    const targetHash = filters.region && filters.region !== 'all'
      ? `#/library?region=${filters.region}`
      : `#/library`;
    window.history.replaceState(null, '', targetHash);
    setFilters(parseLibraryFiltersFromHash(targetHash));
  }, [filters.region]);

  return {
    filters,
    updateFilters,
    clearAllFilters
  };
};
