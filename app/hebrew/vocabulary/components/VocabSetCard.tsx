"use client";

import { VocabSet } from "../data/types";

interface SetStats {
  total: number;
  notLearned: number;
  learned: number;
}

interface VocabSetCardProps {
  set: VocabSet;
  stats: SetStats;
  isFoundational?: boolean;
  onStudy: () => void;
  onToggleActive: () => void;
  getSetTypeIcon: (setType?: string) => string;
  getSetTypeLabel: (setType?: string) => string;
}

export default function VocabSetCard({
  set,
  stats,
  isFoundational = false,
  onStudy,
  onToggleActive,
  getSetTypeIcon,
  getSetTypeLabel,
}: VocabSetCardProps) {
  const isActive = set.isActive;
  const setType = (set as any).setType;

  return (
    <div
      className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
        isActive
          ? 'border-green-400 bg-gradient-to-br from-green-50 to-white'
          : isFoundational
          ? 'border-[#4a5d49]/30'
          : 'border-white/50'
      }`}
    >
      {/* Active Badge */}
      {isActive && (
        <div className="inline-block px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full mb-3">
          ✓ ACTIVE
        </div>
      )}

      {/* Set Type Badge (only for non-foundational, non-vocabulary types) */}
      {!isFoundational && setType && setType !== 'vocabulary' && (
        <div className="inline-block px-3 py-1 bg-[#4a5d49]/10 text-[#4a5d49] text-xs font-bold rounded-full mb-3 ml-2">
          {getSetTypeIcon(setType)} {getSetTypeLabel(setType)}
        </div>
      )}

      {/* Set Info */}
      <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        <span className="text-2xl">{getSetTypeIcon(setType)}</span>
        <span>{set.title}</span>
      </h3>
      <p className="text-sm text-gray-600 mb-4">{set.description}</p>

      {/* Stats */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-1">
          <span className="text-gray-600">Total:</span>
          <span className="font-bold text-gray-800">{stats.total}</span>
        </div>
        {stats.notLearned > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-orange-600">Not Learned:</span>
            <span className="font-bold text-orange-700">{stats.notLearned}</span>
          </div>
        )}
        {stats.learned > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-green-600">Learned:</span>
            <span className="font-bold text-green-700">{stats.learned}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 items-center">
        <button
          onClick={onStudy}
          className="flex-1 px-4 py-2 bg-gradient-to-r from-[#4a5d49] to-[#6b7d6a] text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
        >
          Study
        </button>
        <button
          onClick={onToggleActive}
          className={`px-4 py-2 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 ${
            isActive
              ? 'bg-green-500 text-white border-green-600'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          {isActive ? '✓ Active' : 'Set Active'}
        </button>
      </div>
    </div>
  );
}
