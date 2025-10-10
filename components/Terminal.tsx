'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { VirtualFileSystem } from '@/lib/vfs';
import { executeCommand, CommandResult } from '@/lib/commands';
import { Challenge, builtInChallenges, validateCommand, getNextChallenge } from '@/lib/challenges';
import { getChallengesByCategory } from '@/lib/challenges';
import { challengeCategories } from '@/lib/challenges';

interface TerminalLine {
  type: 'input' | 'output' | 'error' | 'success' | 'info' | 'challenge';
  content: string;
  timestamp: Date;
}

interface TerminalProps {
  userId?: string;
}

export default function Terminal({ userId }: TerminalProps) {
  const [vfs] = useState(() => new VirtualFileSystem());
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [hintIndex, setHintIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [commandStartTime, setCommandStartTime] = useState<Date | null>(null);
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [typingStats, setTypingStats] = useState({ speed: 0, accuracy: 0, totalCommands: 0 });
  const [autoComplete, setAutoComplete] = useState<string[]>([]);
  const [category, setCategory] = useState('default');
  const [challenges, setChallenges] = useState<Challenge[]>(getChallengesByCategory('default'));


  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    const selectedChallenges = getChallengesByCategory(category);
    setChallenges(selectedChallenges);
    setCurrentChallenge(selectedChallenges[0]);
  }, [category]);


  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    addLine({
      type: 'info',
      content: `
        ╔═══════════════════════════════════════════════════════════════╗
        ║                                                               ║
        ║  ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗     ║
        ║  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗    ║
        ║     ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║    ║
        ║     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║    ║
        ║     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║    ║
        ║     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝    ║
        ║                                                               ║
        ║           Linux Command Learning Platform v0.0.1              ║
        ║               [CLASSIFIED SYSTEM ACCESS]                      ║
        ║                                                               ║
        ╚═══════════════════════════════════════════════════════════════╝

        [SYSTEM INITIALIZED] Welcome, operative.
        Type 'help' for available commands
        Type '!tutorial' to begin your training

        Tip: You can explore different challenge categories!
        Type '!categories' to view all available ones.
        Then switch using: !category <name>
        `,
      timestamp: new Date(),
    });

    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = (line: TerminalLine) => {
    setLines(prev => [...prev, line]);
  };

  const displayChallenge = (challenge: Challenge) => {
    addLine({
      type: 'challenge',
      content: `
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        🎯 CHALLENGE ${challenge.orderIndex}: ${challenge.title}
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        Difficulty: ${challenge.difficulty.toUpperCase()} | Level: ${challenge.level} | XP: ${challenge.xpReward}

        ${challenge.scenario}

        Type '!hint' for a hint | Type '!skip' to skip
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        `,
      timestamp: new Date(),
    });
    setHintIndex(0);
  };

  const showCategoryList = () => {
    const available = Object.keys(challengeCategories);
    addLine({
      type: 'info',
      content: `
        📚 AVAILABLE CATEGORIES
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ${available.map(cat => `- ${cat}`).join('\n\t\t')}
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        Use: !category <category_name> to switch.
        Example: !category default
        `,
      timestamp: new Date(),
    });
  };


  const handleSpecialCommand = (cmd: string): boolean => {
  const available = Object.keys(challengeCategories);

  // ✅ Show all available categories
  if (cmd === '!categories') {
    showCategoryList();
    return true;
  }

  // ✅ Handle category switching
  if (cmd.startsWith('!category')) {
    const parts = cmd.trim().split(' ');

    // If no argument provided, show category help
    if (parts.length === 1) {
      addLine({
        type: 'info',
        content: `
          📂 CATEGORY COMMAND HELP
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          Use this command to switch between different sets of challenges.

          Available categories:
          ${available.map(cat => `- ${cat}`).join('\n')}

          Example:
          !category basics
          ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                  `,
        timestamp: new Date(),
      });
      return true;
    }

    const chosen = parts[1];

    // If invalid category name
    if (!available.includes(chosen)) {
      addLine({
        type: 'error',
        content: `❌ Unknown category "${chosen}". Try one of: ${available.join(', ')}`,
        timestamp: new Date(),
      });
      return true;
    }

    // Switch category
    setCategory(chosen);
    addLine({
      type: 'info',
      content: `📂 Switched to category: ${chosen.toUpperCase()}\nLoading challenges...`,
      timestamp: new Date(),
    });

    const selected = getChallengesByCategory(chosen);
    setChallenges(selected);
    setCurrentChallenge(selected[0]);
    displayChallenge(selected[0]);
    setStartTime(new Date());

    addLine({
      type: 'info',
      content: `💡 Type '!hint' for help or '!skip' to move to the next challenge.`,
      timestamp: new Date(),
    });

    return true;
  }

  // ✅ Hint system
  if (cmd === '!hint') {
    if (!currentChallenge) {
      addLine({
        type: 'info',
        content: 'No active challenge. Type !tutorial to start.',
        timestamp: new Date(),
      });
      return true;
    }

    if (hintIndex >= currentChallenge.hints.length) {
      addLine({
        type: 'info',
        content: `💡 No more hints available. Expected commands: ${currentChallenge.expectedCommands.join(' or ')}`,
        timestamp: new Date(),
      });
    } else {
      addLine({
        type: 'info',
        content: `💡 HINT ${hintIndex + 1}/${currentChallenge.hints.length}: ${currentChallenge.hints[hintIndex]}`,
        timestamp: new Date(),
      });
      setHintIndex(prev => prev + 1);
    }
    return true;
  }

  // ✅ Skip challenge
  if (cmd === '!skip') {
    if (!currentChallenge) {
      addLine({
        type: 'info',
        content: 'No active challenge to skip.',
        timestamp: new Date(),
      });
      return true;
    }

    // Find index of current challenge in the current category
    const currentIndex = challenges.findIndex(c => c.id === currentChallenge.id);
    const nextChallenge = challenges[currentIndex + 1];

    if (nextChallenge) {
      addLine({
        type: 'info',
        content: '⏭️  Challenge skipped. Moving to next challenge...',
        timestamp: new Date(),
      });
      setCurrentChallenge(nextChallenge);
      displayChallenge(nextChallenge);
      setStartTime(new Date());
    } else {
      addLine({
        type: 'success',
        content: `🎉 You’ve reached the end of available challenges in the [${category.toUpperCase()}] category!`,
        timestamp: new Date(),
      });
      setCurrentChallenge(null);
    }

    return true;
  }


  // ✅ Start tutorial
  if (cmd === '!tutorial') {
    const firstChallenge = builtInChallenges[0];
    setCurrentChallenge(firstChallenge);
    displayChallenge(firstChallenge);
    setStartTime(new Date());
    return true;
  }

  // ✅ Manual pages
  if (cmd.startsWith('!man ')) {
    const cmdName = cmd.substring(5).trim();
    const result = executeCommand(`man ${cmdName}`, vfs);
    addLine({
      type: result.success ? 'output' : 'error',
      content: result.output,
      timestamp: new Date(),
    });
    return true;
  }

  // ✅ Reset session
  if (cmd === '!reset') {
    window.location.reload();
    return true;
  }

  // ✅ Show player stats
  if (cmd === '!stats') {
    addLine({
      type: 'info',
      content: `
        ╔══════════════ OPERATIVE STATS ═════════════════╗
        ║ Level: ${userLevel}
        ║ Total XP: ${userXP}
        ║ Challenges Completed: ${completedChallenges.size}/${builtInChallenges.length}
        ║ Commands Executed: ${typingStats.totalCommands}
        ║ Avg Typing Speed: ${typingStats.speed.toFixed(1)} CPM
        ║ Avg Accuracy: ${typingStats.accuracy.toFixed(1)}%
        ╚════════════════════════════════════════════════╝
              `,
      timestamp: new Date(),
    });
    return true;
  }

  // ❌ If no special command matched
  return false;
};


  const calculateTypingSpeed = (command: string, startTime: Date): number => {
    const endTime = new Date();
    const timeInMinutes = (endTime.getTime() - startTime.getTime()) / 60000;
    return timeInMinutes > 0 ? command.length / timeInMinutes : 0;
  };

  const handleCommand = () => {
    if (!input.trim()) return;

    const cmd = input.trim();
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    addLine({
      type: 'input',
      content: `
        ┌─[user@terminal]─[${vfs.getCurrentPath()}]
        └──╼ $ ${cmd}`,
      timestamp: new Date(),
    });

    if (handleSpecialCommand(cmd)) {
      setInput('');
      return;
    }

    const cmdStartTime = commandStartTime || new Date();
    const typingSpeed = calculateTypingSpeed(cmd, cmdStartTime);

    if (cmd === 'clear') {
      setLines([]);
      setInput('');
      return;
    }

    if (cmd === 'history') {
      const historyOutput = commandHistory.map((h, i) => `  ${i + 1}  ${h}`).join('\n');
      addLine({
        type: 'output',
        content: historyOutput || 'No command history yet.',
        timestamp: new Date(),
      });
      setInput('');
      return;
    }

    const result: CommandResult = executeCommand(cmd, vfs);

    if (result.output) {
      addLine({
        type: result.success ? 'output' : 'error',
        content: result.output,
        timestamp: new Date(),
      });
    }

    if (result.bestPractice) {
      addLine({
        type: 'info',
        content: `💡 ${result.bestPractice}`,
        timestamp: new Date(),
      });
    }

    setTypingStats(prev => ({
      speed: (prev.speed * prev.totalCommands + typingSpeed) / (prev.totalCommands + 1),
      accuracy: prev.accuracy,
      totalCommands: prev.totalCommands + 1,
    }));

    if (currentChallenge && result.success) {
  const isValid = validateCommand(currentChallenge, cmd);
  if (isValid) {
    const timeSpent = startTime ? (new Date().getTime() - startTime.getTime()) / 1000 : 0;
    const earnedXP = currentChallenge.xpReward;

    addLine({
      type: 'success',
      content: `
        ✅ CHALLENGE COMPLETED!
        +${earnedXP} XP | Time: ${timeSpent.toFixed(1)}s | Speed: ${typingSpeed.toFixed(0)} CPM
        `,
      timestamp: new Date(),
    });

    setUserXP(prev => {
      const newXP = prev + earnedXP;
      const newLevel = Math.floor(newXP / 100) + 1;
      setUserLevel(newLevel);
      return newXP;
    });

    setCompletedChallenges(prev => new Set([...Array.from(prev), currentChallenge.id]));

    // ✅ Find next challenge *within current category*
    const currentIndex = challenges.findIndex(c => c.id === currentChallenge.id);
    const nextChallenge = challenges[currentIndex + 1];

    if (nextChallenge) {
      setTimeout(() => {
        setCurrentChallenge(nextChallenge);
        displayChallenge(nextChallenge);
        setStartTime(new Date());
      }, 1000);
    } else {
      addLine({
        type: 'success',
        content: `
          ╔═══════════════════════════════════════════════════════════╗
          ║                  🏁 CATEGORY COMPLETE 🏁                   ║
          ║                                                           ║
          ║  Congratulations, operative!                              ║
          ║  You’ve completed all challenges in this category:        ║
          ║  [ ${category.toUpperCase()} ]                             ║
          ║                                                           ║
          ║  Type '!categories' to explore others.                    ║
          ╚═══════════════════════════════════════════════════════════╝
          `,
        timestamp: new Date(),
      });
      setCurrentChallenge(null);
    }
  }
}


    setInput('');
    setCommandStartTime(null);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (autoComplete.length > 0) {
        setInput(autoComplete[0]);
        setAutoComplete([]);
      }
    } else {
      if (!commandStartTime) {
        setCommandStartTime(new Date());
      }
    }
  };

  return (
    <div className="h-screen w-full bg-black text-green-400 font-mono flex flex-col overflow-hidden">
      <div className="flex-none bg-gray-900 border-b border-green-500/30 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-green-400 text-sm">TERMINAL v0.0.1 - [{category.toUpperCase()} MODE]</span>
        </div>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-green-500">●</span>
            <span>LEVEL {userLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-500">⚡</span>
            <span>{userXP} XP</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">🎯</span>
            <span>{completedChallenges.size}/{builtInChallenges.length}</span>
          </div>
        </div>
      </div>

      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-4 space-y-2 terminal-content"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`
              ${line.type === 'input' ? 'text-green-300' : ''}
              ${line.type === 'output' ? 'text-gray-300 pl-20' : ''}
              ${line.type === 'error' ? 'text-red-400 pl-20' : ''}
              ${line.type === 'success' ? 'text-green-400 font-bold' : ''}
              ${line.type === 'info' ? 'text-cyan-400 px-20' : ''}
              ${line.type === 'challenge' ? 'text-yellow-400' : ''}
              whitespace-pre-wrap break-words
            `}
          >
            {line.content}
          </div>
        ))}

        <div className="flex items-start gap-2 text-green-300">
          <span className="whitespace-pre pl-20">┌─[user@terminal]─[{vfs.getCurrentPath()}]
└──╼ $ </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none border-none caret-green-400"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>

      <style jsx>{`
        .terminal-content::-webkit-scrollbar {
          width: 8px;
        }
        .terminal-content::-webkit-scrollbar-track {
          background: #000;
        }
        .terminal-content::-webkit-scrollbar-thumb {
          background: #22c55e;
          border-radius: 4px;
        }
        .terminal-content::-webkit-scrollbar-thumb:hover {
          background: #16a34a;
        }
      `}</style>
    </div>
  );
}
