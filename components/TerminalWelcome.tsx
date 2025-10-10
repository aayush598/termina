"use client";

export default function TerminalWelcome() {
  return (
    <div className="w-full text-green-400 font-mono">
      {/* Desktop View */}
      <pre className="hidden md:block whitespace-pre leading-tight text-sm sm:text-base">
{String.raw`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗     ║
║  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗    ║
║     ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║    ║
║     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║    ║
║     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║    ║
║     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝    ║
║                                                               ║
║                     Termina v0.0.1                            ║
║                [CLASSIFIED SYSTEM ACCESS]                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

[SYSTEM INITIALIZED] Welcome, operative.
Type 'help' for available commands
Type '!tutorial' to begin your training

Tip: You can explore different challenge categories!
Type '!categories' to view all available ones.
Then switch using: !category <name>
`}
      </pre>

      {/* Mobile View - Simplified and Responsive */}
      <div className="block md:hidden text-xs">
        {/* Top Border */}
        <div className="flex">
          <div className="text-green-400">╔</div>
          <div className="flex-1 border-b border-green-400"></div>
          <div className="text-green-400">╗</div>
        </div>
        
        {/* Content */}
        <div className="flex">
          <div className="text-green-400 w-4 border-l border-green-400">║</div>
          <div className="flex-1 px-2 py-1 text-center">
            <div className="font-bold text-green-300">TERMINA v0.0.1</div>
            <div className="text-green-500 text-[10px] mt-1">[SYSTEM ACCESS GRANTED]</div>
          </div>
          <div className="text-green-400 w-4 border-r border-green-400">║</div>
        </div>
        
        {/* Bottom Border */}
        <div className="flex">
          <div className="text-green-400">╚</div>
          <div className="flex-1 border-t border-green-400"></div>
          <div className="text-green-400">╝</div>
        </div>

        {/* Mobile Content */}
        <div className="mt-3 px-2 space-y-2">
          <div className="text-green-300">[SYSTEM INITIALIZED]</div>
          <div>Welcome, operative.</div>
          <div className="text-green-300 mt-3">Quick Start:</div>
          <div className="space-y-1 text-[11px]">
            <div>• <span className="text-green-300">help</span> - Show commands</div>
            <div>• <span className="text-green-300">!tutorial</span> - Begin training</div>
            <div>• <span className="text-green-300">!categories</span> - View categories</div>
          </div>
          <div className="text-green-500 text-[10px] mt-3">
            Tip: Use !category &lt;name&gt; to switch modes
          </div>
        </div>
      </div>

      {/* Default Mode Info */}
      <div className="flex justify-end mt-2 pr-2 text-xs sm:text-sm text-green-300">
        [ Default Mode ]
      </div>
    </div>
  );
}