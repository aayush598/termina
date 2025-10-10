"use client";

export default function TerminalWelcome() {
  return (
    <div className="w-full text-green-400 font-mono">
      {/* Desktop View */}
      <pre className="hidden md:block whitespace-pre leading-tight text-sm sm:text-base">
{String.raw`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ████████╗███████╗██████╗ ██╗   ██╗██╗███╗   ██╗ █████╗         ║
║   ╚══██╔══╝██╔════╝██╔══██╗██║   ██║██║████╗  ██║██╔══██╗        ║
║      ██║   █████╗  ██████╔╝██║   ██║██║██╔██╗ ██║███████║        ║
║      ██║   ██╔══╝  ██╔══██╗██║   ██║██║██║╚██╗██║██╔══██║        ║
║      ██║   ███████╗██║  ██║╚██████╔╝██║██║ ╚████║██║  ██║        ║
║      ╚═╝   ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝        ║
║                                                                  ║
║                  Termina v0.0.1 — Training Terminal              ║
╚══════════════════════════════════════════════════════════════════╝

Welcome, operative.

Termina is an interactive terminal that helps you learn and master 
command-line skills through real challenges and XP progression.

Quick Start:
• Type 'help' — list commands  
• Type '!tutorial' — start training  
• Type '!categories' — view challenge areas  
• Type '!category <name>' - switch modes.

Tip: Use '!hint' if you get stuck.
`}
      </pre>

      {/* Mobile View */}
      <div className="block md:hidden text-xs">
        <div className="flex justify-center text-green-300 font-bold">
          TERMINA v0.0.1
        </div>
        <div className="mt-2 text-[11px] leading-tight px-2">
          Welcome to <span className="text-green-300">Termina</span> — an
          interactive terminal to practice real command-line challenges and earn XP.
        </div>
        <div className="mt-2 text-green-300">Quick Start:</div>
        <div className="text-[11px] space-y-1">
          <div>• help — list commands</div>
          <div>• !tutorial — start training</div>
          <div>• !categories — view challenges</div>
        </div>
        <div className="text-green-500 text-[10px] mt-2">
          Tip: Use !hint if you’re stuck.
        </div>
        <div className="text-green-500 text-[10px] mt-3">
            Tip: Use !category &lt;name&gt; to switch modes.
          </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end mt-2 pr-2 text-xs text-green-300">
        [ System Ready ]
      </div>
    </div>
  );
}
