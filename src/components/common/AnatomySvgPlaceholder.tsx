import React from 'react';
import { SubRegion } from '../../types/exercise';

interface Props {
  subRegion: SubRegion;
  className?: string;
  badge?: string;
}

export const AnatomySvgPlaceholder: React.FC<Props> = ({ subRegion, className = "h-48 w-full", badge }) => {
  const isAnkle = subRegion.includes('Ankle');
  const isKnee = subRegion.includes('Knee');
  const isHip = subRegion.includes('Hip');

  return (
    <div className={`relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 overflow-hidden border border-slate-700/50 rounded-xl ${className}`}>
      {/* Background medical grid */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#0d9488_1px,transparent_1px)] [background-size:16px_16px]" />
      
      {/* Anatomical stylized vector */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center">
        {isAnkle && (
          <svg className="w-16 h-16 text-amber-400 opacity-90 drop-shadow-[0_0_12px_rgba(217,119,6,0.4)]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Tibia & Fibula */}
            <path d="M26 4v34M38 10v26" strokeDasharray="3 3" />
            {/* Talocrural Mortise & Talus */}
            <path d="M22 38c0 4 6 8 10 8s10-4 10-8" />
            <path d="M20 44l-4 6c-2 3-1 6 2 7h24c6 0 10-4 10-10l-6-3" fill="currentColor" fillOpacity="0.15" />
            {/* Calcaneus */}
            <circle cx="24" cy="52" r="3" fill="currentColor" />
            {/* First Ray Metatarsal */}
            <path d="M42 47l10 5" />
          </svg>
        )}

        {isKnee && (
          <svg className="w-16 h-16 text-cyan-400 opacity-90 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Femur Condyles */}
            <path d="M24 6v22c0 5-6 6-6 10s4 6 10 6 8-4 8-10V6" />
            <path d="M40 6v22c0 5 6 6 6 10s-4 6-10 6" />
            {/* Patella */}
            <ellipse cx="32" cy="30" rx="6" ry="8" fill="currentColor" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="2" />
            {/* Tibial Plateau */}
            <path d="M16 46h32M24 46v14M40 46v14" />
          </svg>
        )}

        {isHip && (
          <svg className="w-16 h-16 text-indigo-400 opacity-90 drop-shadow-[0_0_12px_rgba(99,102,241,0.4)]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {/* Pelvic Ilium & Acetabulum */}
            <path d="M12 16c6-8 22-8 28-2s8 14 0 20c-4 3-8 4-10 8" />
            {/* Femoral Head & Neck */}
            <circle cx="28" cy="34" r="7" fill="currentColor" fillOpacity="0.2" />
            <path d="M28 41l-6 17M35 40l-2 18" />
            {/* Greater Trochanter */}
            <path d="M36 44c3-2 6 2 4 6" />
          </svg>
        )}

        {!isAnkle && !isKnee && !isHip && (
          <svg className="w-16 h-16 text-emerald-400 opacity-90 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="32" cy="14" r="8" />
            <path d="M32 22v20M20 28l12 6 12-6M22 56l10-14 10 14" />
          </svg>
        )}

        <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          {badge || subRegion}
        </span>
      </div>
    </div>
  );
};
