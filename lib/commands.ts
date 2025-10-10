import { VirtualFileSystem, VFSNode } from './vfs';

export interface CommandResult {
  output: string;
  success: boolean;
  isSpecial?: boolean;
  bestPractice?: string;
}

export interface Command {
  name: string;
  description: string;
  usage: string;
  examples: string[];
  manPage: string;
  execute: (args: string[], vfs: VirtualFileSystem) => CommandResult;
}

const formatFileList = (entries: VFSNode[], showAll: boolean = false, longFormat: boolean = false): string => {
  if (longFormat) {
    return entries
      .filter(entry => showAll || !entry.name.startsWith('.'))
      .map(entry => {
        const size = entry.size || 0;
        const date = entry.modified ? new Date(entry.modified).toLocaleDateString() : '';
        return `${entry.permissions || ''} ${entry.owner || 'user'} ${size.toString().padStart(8)} ${date} ${entry.name}`;
      })
      .join('\n');
  }
  return entries
    .filter(entry => showAll || !entry.name.startsWith('.'))
    .map(entry => entry.name)
    .join('  ');
};

export const commands: { [key: string]: Command } = {
  ls: {
    name: 'ls',
    description: 'List directory contents',
    usage: 'ls [OPTION]... [FILE]...',
    examples: ['ls', 'ls -l', 'ls -a', 'ls -la /home'],
    manPage: `NAME
    ls - list directory contents

SYNOPSIS
    ls [OPTION]... [FILE]...

DESCRIPTION
    List information about the FILEs (the current directory by default).

OPTIONS
    -a, --all
        do not ignore entries starting with .
    -l
        use a long listing format
    -h, --help
        display this help and exit`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      let showAll = false;
      let longFormat = false;
      let path: string | undefined;

      for (const arg of args) {
        if (arg === '-a' || arg === '--all') {
          showAll = true;
        } else if (arg === '-l') {
          longFormat = true;
        } else if (arg === '-la' || arg === '-al') {
          showAll = true;
          longFormat = true;
        } else if (!arg.startsWith('-')) {
          path = arg;
        }
      }

      const result = vfs.listDirectory(path);
      if (!result.success) {
        return { output: result.error || 'Error listing directory', success: false };
      }

      const output = formatFileList(result.entries || [], showAll, longFormat);
      let bestPractice = '';

      if (!longFormat) {
        bestPractice = 'Tip: Use "ls -l" for detailed file information including permissions and sizes.';
      }

      return { output, success: true, bestPractice };
    },
  },

  cd: {
    name: 'cd',
    description: 'Change the current directory',
    usage: 'cd [DIRECTORY]',
    examples: ['cd /home', 'cd ..', 'cd ~', 'cd /home/user/documents'],
    manPage: `NAME
    cd - change directory

SYNOPSIS
    cd [DIRECTORY]

DESCRIPTION
    Change the current working directory to DIRECTORY.

EXAMPLES
    cd /home/user
        Change to /home/user directory
    cd ..
        Move up one directory
    cd ~
        Change to home directory`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      const path = args[0] || '/home/user';
      const result = vfs.changeDirectory(path);

      if (!result.success) {
        return { output: result.error || 'Error changing directory', success: false };
      }

      return {
        output: '',
        success: true,
        bestPractice: 'Use "pwd" to verify your current location after changing directories.'
      };
    },
  },

  pwd: {
    name: 'pwd',
    description: 'Print working directory',
    usage: 'pwd',
    examples: ['pwd'],
    manPage: `NAME
    pwd - print name of current/working directory

SYNOPSIS
    pwd

DESCRIPTION
    Print the full filename of the current working directory.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      return { output: vfs.getCurrentPath(), success: true };
    },
  },

  cat: {
    name: 'cat',
    description: 'Concatenate and display file contents',
    usage: 'cat [FILE]...',
    examples: ['cat file.txt', 'cat /etc/hosts'],
    manPage: `NAME
    cat - concatenate files and print on the standard output

SYNOPSIS
    cat [FILE]...

DESCRIPTION
    Concatenate FILE(s) to standard output.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      if (args.length === 0) {
        return { output: 'cat: missing operand', success: false };
      }

      const result = vfs.readFile(args[0]);
      if (!result.success) {
        return { output: result.error || 'Error reading file', success: false };
      }

      return {
        output: result.content || '',
        success: true,
        bestPractice: 'For large files, consider using "less" or "head" to view content in manageable chunks.'
      };
    },
  },

  mkdir: {
    name: 'mkdir',
    description: 'Make directories',
    usage: 'mkdir [DIRECTORY]...',
    examples: ['mkdir mydir', 'mkdir /home/user/projects'],
    manPage: `NAME
    mkdir - make directories

SYNOPSIS
    mkdir [DIRECTORY]...

DESCRIPTION
    Create the DIRECTORY(ies), if they do not already exist.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      if (args.length === 0) {
        return { output: 'mkdir: missing operand', success: false };
      }

      const result = vfs.createDirectory(args[0]);
      if (!result.success) {
        return { output: result.error || 'Error creating directory', success: false };
      }

      return {
        output: '',
        success: true,
        bestPractice: 'Use meaningful directory names with lowercase and underscores for better readability.'
      };
    },
  },

  touch: {
    name: 'touch',
    description: 'Create empty files',
    usage: 'touch [FILE]...',
    examples: ['touch file.txt', 'touch /home/user/newfile.txt'],
    manPage: `NAME
    touch - create empty files

SYNOPSIS
    touch [FILE]...

DESCRIPTION
    Create empty FILE(s) if they do not exist.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      if (args.length === 0) {
        return { output: 'touch: missing operand', success: false };
      }

      const result = vfs.createFile(args[0]);
      if (!result.success) {
        return { output: result.error || 'Error creating file', success: false };
      }

      return {
        output: '',
        success: true,
        bestPractice: 'Use file extensions to indicate file types (e.g., .txt, .py, .sh).'
      };
    },
  },

  rm: {
    name: 'rm',
    description: 'Remove files or directories',
    usage: 'rm [OPTION]... [FILE]...',
    examples: ['rm file.txt', 'rm -r directory'],
    manPage: `NAME
    rm - remove files or directories

SYNOPSIS
    rm [OPTION]... [FILE]...

DESCRIPTION
    Remove (unlink) the FILE(s).

OPTIONS
    -r, -R, --recursive
        remove directories and their contents recursively`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      if (args.length === 0) {
        return { output: 'rm: missing operand', success: false };
      }

      let recursive = false;
      let filePath = '';

      for (const arg of args) {
        if (arg === '-r' || arg === '-R' || arg === '--recursive') {
          recursive = true;
        } else if (!arg.startsWith('-')) {
          filePath = arg;
        }
      }

      if (!filePath) {
        return { output: 'rm: missing operand', success: false };
      }

      const result = recursive
        ? vfs.removeDirectory(filePath, true)
        : vfs.removeFile(filePath);

      if (!result.success) {
        return { output: result.error || 'Error removing file', success: false };
      }

      return {
        output: '',
        success: true,
        bestPractice: 'CAUTION: rm is permanent. Always double-check before deleting files, especially with -r flag.'
      };
    },
  },

  echo: {
    name: 'echo',
    description: 'Display a line of text',
    usage: 'echo [STRING]...',
    examples: ['echo "Hello World"', 'echo $HOME'],
    manPage: `NAME
    echo - display a line of text

SYNOPSIS
    echo [STRING]...

DESCRIPTION
    Echo the STRING(s) to standard output.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      const output = args.join(' ');
      return {
        output,
        success: true,
        bestPractice: 'Use quotes around strings with spaces: echo "Hello World"'
      };
    },
  },

  clear: {
    name: 'clear',
    description: 'Clear the terminal screen',
    usage: 'clear',
    examples: ['clear'],
    manPage: `NAME
    clear - clear the terminal screen

SYNOPSIS
    clear

DESCRIPTION
    Clear the terminal screen.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      return { output: '', success: true, isSpecial: true };
    },
  },

  help: {
    name: 'help',
    description: 'Display available commands',
    usage: 'help',
    examples: ['help'],
    manPage: `NAME
    help - display available commands

SYNOPSIS
    help

DESCRIPTION
    Display a list of available commands and special commands.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      const commandList = Object.values(commands)
        .map(cmd => `  ${cmd.name.padEnd(15)} - ${cmd.description}`)
        .join('\n');

      const output = `Available Commands:
${commandList}

Special Commands:
  !hint          - Get a hint for the current challenge
  !man [cmd]     - Display manual page for a command
  !tutorial      - Start the interactive tutorial
  !skip          - Skip the current challenge
  !reset         - Reset the file system to initial state

Type any command followed by --help for usage information.`;

      return { output, success: true };
    },
  },

  man: {
    name: 'man',
    description: 'Display manual pages',
    usage: 'man [COMMAND]',
    examples: ['man ls', 'man cd'],
    manPage: `NAME
    man - display manual pages

SYNOPSIS
    man [COMMAND]

DESCRIPTION
    Display the manual page for COMMAND.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      if (args.length === 0) {
        return { output: 'What manual page do you want?\nFor example, try: man ls', success: false };
      }

      const cmd = commands[args[0]];
      if (!cmd) {
        return { output: `No manual entry for ${args[0]}`, success: false };
      }

      return { output: cmd.manPage, success: true };
    },
  },

  grep: {
    name: 'grep',
    description: 'Search for patterns in files',
    usage: 'grep [PATTERN] [FILE]',
    examples: ['grep "hello" file.txt', 'grep "error" /var/log/app.log'],
    manPage: `NAME
    grep - print lines that match patterns

SYNOPSIS
    grep [PATTERN] [FILE]

DESCRIPTION
    Search for PATTERN in FILE and display matching lines.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      if (args.length < 2) {
        return { output: 'grep: missing operands\nUsage: grep [PATTERN] [FILE]', success: false };
      }

      const pattern = args[0].replace(/['"]/g, '');
      const filePath = args[1];

      const fileResult = vfs.readFile(filePath);
      if (!fileResult.success) {
        return { output: fileResult.error || 'Error reading file', success: false };
      }

      const lines = (fileResult.content || '').split('\n');
      const matches = lines.filter(line => line.toLowerCase().includes(pattern.toLowerCase()));

      if (matches.length === 0) {
        return { output: '', success: true };
      }

      return {
        output: matches.join('\n'),
        success: true,
        bestPractice: 'Use grep with regular expressions for powerful pattern matching.'
      };
    },
  },

  find: {
    name: 'find',
    description: 'Search for files in a directory hierarchy',
    usage: 'find [PATH] [OPTIONS]',
    examples: ['find . -name "*.txt"', 'find /home -type f'],
    manPage: `NAME
    find - search for files in a directory hierarchy

SYNOPSIS
    find [PATH] [OPTIONS]

DESCRIPTION
    Search for files in PATH that match specified criteria.

OPTIONS
    -name PATTERN
        Base of file name matches PATTERN
    -type TYPE
        File is of type TYPE (f=file, d=directory)`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      const searchPath = args[0] || '.';
      let namePattern = '';
      let typeFilter = '';

      for (let i = 1; i < args.length; i++) {
        if (args[i] === '-name' && i + 1 < args.length) {
          namePattern = args[i + 1].replace(/['"]/g, '').replace(/\*/g, '');
          i++;
        } else if (args[i] === '-type' && i + 1 < args.length) {
          typeFilter = args[i + 1];
          i++;
        }
      }

      const result = vfs.listDirectory(searchPath);
      if (!result.success) {
        return { output: result.error || 'Error searching files', success: false };
      }

      let filtered = result.entries || [];
      if (namePattern) {
        filtered = filtered.filter(entry => entry.name.includes(namePattern));
      }
      if (typeFilter === 'f') {
        filtered = filtered.filter(entry => entry.type === 'file');
      } else if (typeFilter === 'd') {
        filtered = filtered.filter(entry => entry.type === 'directory');
      }

      const output = filtered.map(entry => `./${entry.name}`).join('\n');
      return {
        output,
        success: true,
        bestPractice: 'Combine find with other commands using pipes for powerful file operations.'
      };
    },
  },

  whoami: {
    name: 'whoami',
    description: 'Print effective user name',
    usage: 'whoami',
    examples: ['whoami'],
    manPage: `NAME
    whoami - print effective user name

SYNOPSIS
    whoami

DESCRIPTION
    Print the user name associated with the current effective user ID.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      return { output: 'user', success: true };
    },
  },

  date: {
    name: 'date',
    description: 'Display or set the system date and time',
    usage: 'date',
    examples: ['date'],
    manPage: `NAME
    date - print or set the system date and time

SYNOPSIS
    date

DESCRIPTION
    Display the current date and time.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      return { output: new Date().toString(), success: true };
    },
  },

  history: {
    name: 'history',
    description: 'Display command history',
    usage: 'history',
    examples: ['history'],
    manPage: `NAME
    history - display command history

SYNOPSIS
    history

DESCRIPTION
    Display the command history for the current session.`,
    execute: (args: string[], vfs: VirtualFileSystem) => {
      return { output: '', success: true, isSpecial: true };
    },
  },
};

export const parseCommand = (input: string): { command: string; args: string[] } => {
  const parts = input.trim().split(/\s+/);
  const command = parts[0] || '';
  const args = parts.slice(1);
  return { command, args };
};

export const executeCommand = (input: string, vfs: VirtualFileSystem): CommandResult => {
  const { command, args } = parseCommand(input);

  if (command === '') {
    return { output: '', success: true };
  }

  if (args.includes('--help')) {
    const cmd = commands[command];
    if (cmd) {
      return { output: `Usage: ${cmd.usage}\n\n${cmd.description}\n\nExamples:\n${cmd.examples.join('\n')}`, success: true };
    }
  }

  const cmd = commands[command];
  if (!cmd) {
    return {
      output: `Command not found: ${command}\nType 'help' to see available commands.`,
      success: false
    };
  }

  return cmd.execute(args, vfs);
};
