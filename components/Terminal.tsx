'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { VirtualFileSystem } from '@/lib/vfs';
import { executeCommand, CommandResult } from '@/lib/commands';
import { Challenge, builtInChallenges, validateCommand, getNextChallenge } from '@/lib/challenges';

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
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(builtInChallenges[0]);
  const [hintIndex, setHintIndex] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [commandStartTime, setCommandStartTime] = useState<Date | null>(null);
  const [userXP, setUserXP] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [typingStats, setTypingStats] = useState({ speed: 0, accuracy: 0, totalCommands: 0 });
  const [autoComplete, setAutoComplete] = useState<string[]>([]);

  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return; // Skip if already initialized
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
║           Linux Command Learning Platform v2.0                ║
║               [CLASSIFIED SYSTEM ACCESS]                      ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

[SYSTEM INITIALIZED] Welcome, operative.
Type 'help' for available commands
Type '!tutorial' to begin your training
`,
      timestamp: new Date(),
    });

    if (currentChallenge) {
      displayChallenge(currentChallenge);
      setStartTime(new Date());
    }

    inputRef.current?.focus();
  }, [currentChallenge]);

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

  const handleSpecialCommand = (cmd: string): boolean => {
    if (cmd === '!hint') {
      if (!currentChallenge) {
        addLine({ type: 'info', content: 'No active challenge. Type !tutorial to start.', timestamp: new Date() });
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

    if (cmd === '!skip') {
      if (!currentChallenge) {
        addLine({ type: 'info', content: 'No active challenge to skip.', timestamp: new Date() });
        return true;
      }

      const next = getNextChallenge(currentChallenge.id);
      if (next) {
        addLine({ type: 'info', content: '⏭️  Challenge skipped. Moving to next challenge...', timestamp: new Date() });
        setCurrentChallenge(next);
        displayChallenge(next);
        setStartTime(new Date());
      } else {
        addLine({ type: 'success', content: '🎉 You\'ve reached the end of available challenges!', timestamp: new Date() });
        setCurrentChallenge(null);
      }
      return true;
    }

    if (cmd === '!tutorial') {
      setCurrentChallenge(builtInChallenges[0]);
      displayChallenge(builtInChallenges[0]);
      setStartTime(new Date());
      return true;
    }

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

    if (cmd === '!reset') {
      window.location.reload();
      return true;
    }

    if (cmd === '!stats') {
      addLine({
        type: 'info',
        content: `
╔══════════════ OPERATIVE STATS ═════════════════╗
║ Level: ${userLevel}
║ Total XP: ${userXP}
║ Challenges Completed: ${completedChallenges.size}/${builtInChallenges.length}
║ Commands Executed: ${typingStats.totalCommands}
║ Average Typing Speed: ${typingStats.speed.toFixed(1)} CPM
║ Average Accuracy: ${typingStats.accuracy.toFixed(1)}%
╚════════════════════════════════════════════════╝
`,
        timestamp: new Date(),
      });
      return true;
    }

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
      content: `┌─[user@terminal]─[${vfs.getCurrentPath()}]
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

        const next = getNextChallenge(currentChallenge.id);
        if (next) {
          setTimeout(() => {
            setCurrentChallenge(next);
            displayChallenge(next);
            setStartTime(new Date());
          }, 1000);
        } else {
          addLine({
            type: 'success',
            content: `
╔═══════════════════════════════════════════════════════════╗
║                  🏆 MISSION COMPLETE 🏆                   ║
║                                                           ║
║  Congratulations, operative! You've completed all        ║
║  available challenges. You are now a certified           ║
║  Linux terminal master!                                  ║
║                                                           ║
║  Final Stats:                                            ║
║  - Level: ${userLevel}
║  - Total XP: ${userXP}
║  - Challenges: ${completedChallenges.size + 1}/${builtInChallenges.length}
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
          <span className="text-green-400 text-sm">TERMINAL v2.0 - SECURE CONNECTION ESTABLISHED</span>
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
              ${line.type === 'output' ? 'text-gray-300' : ''}
              ${line.type === 'error' ? 'text-red-400' : ''}
              ${line.type === 'success' ? 'text-green-400 font-bold' : ''}
              ${line.type === 'info' ? 'text-cyan-400' : ''}
              ${line.type === 'challenge' ? 'text-yellow-400' : ''}
              whitespace-pre-wrap break-words
            `}
          >
            {line.content}
          </div>
        ))}

        <div className="flex items-start gap-2 text-green-300">
          <span className="whitespace-pre">┌─[user@terminal]─[{vfs.getCurrentPath()}]
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
