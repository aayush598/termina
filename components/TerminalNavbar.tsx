'use client';

import React from 'react';
import { builtInChallenges } from '@/lib/challenges';

interface TerminalNavbarProps {
  category: string;
  userLevel: number;
  userXP: number;
  completedChallenges: Set<string>;
}

export default function TerminalNavbar({
  category,
  userLevel,
  userXP,
  completedChallenges,
}: TerminalNavbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-900 border-b border-green-500/30 px-4 py-3 sm:py-2 gap-3 sm:gap-0">
      
      {/* LEFT SECTION */}
      <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center sm:justify-start gap-1 sm:gap-4">
        {/* Traffic lights */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>

        {/* Title and Mode */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:gap-2 w-full">
          <span className="text-green-400 text-sm sm:text-base font-semibold leading-tight">
            TERMINA v0.0.1 <span>[{category.toUpperCase()} MODE]</span>
          </span>
        </div>
      </div>

      {/* RIGHT SECTION - Stats */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-6 w-full sm:w-auto justify-start sm:justify-end text-xs sm:text-sm">
        <div className="flex items-center gap-1 sm:gap-2 bg-gray-800 px-2 py-1 rounded-md">
          <span className="text-green-500">●</span>
          <span>LEVEL {userLevel}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 bg-gray-800 px-2 py-1 rounded-md">
          <span className="text-yellow-500">⚡</span>
          <span>{userXP} XP</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 bg-gray-800 px-2 py-1 rounded-md">
          <span className="text-blue-400">🎯</span>
          <span>{completedChallenges.size}/{builtInChallenges.length}</span>
        </div>
      </div>

    </div>
  );
}
