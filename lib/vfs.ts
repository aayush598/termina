export interface VFSNode {
  type: 'file' | 'directory';
  name: string;
  content?: string;
  permissions?: string;
  owner?: string;
  size?: number;
  modified?: Date;
  children?: { [key: string]: VFSNode };
}

export interface FileSystem {
  [key: string]: VFSNode;
}

export const createInitialFileSystem = (): FileSystem => {
  return {
    home: {
      type: 'directory',
      name: 'home',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      modified: new Date(),
      children: {
        user: {
          type: 'directory',
          name: 'user',
          permissions: 'drwxr-xr-x',
          owner: 'user',
          modified: new Date(),
          children: {
            'welcome.txt': {
              type: 'file',
              name: 'welcome.txt',
              content: 'Welcome to the Linux Terminal Learning Platform!\n\nType "help" to see available commands.\nType "!tutorial" to start the interactive tutorial.\nType "!hint" for help on the current challenge.\n',
              permissions: '-rw-r--r--',
              owner: 'user',
              size: 150,
              modified: new Date(),
            },
            documents: {
              type: 'directory',
              name: 'documents',
              permissions: 'drwxr-xr-x',
              owner: 'user',
              modified: new Date(),
              children: {},
            },
            downloads: {
              type: 'directory',
              name: 'downloads',
              permissions: 'drwxr-xr-x',
              owner: 'user',
              modified: new Date(),
              children: {},
            },
          },
        },
      },
    },
    etc: {
      type: 'directory',
      name: 'etc',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      modified: new Date(),
      children: {
        'hosts': {
          type: 'file',
          name: 'hosts',
          content: '127.0.0.1 localhost\n::1 localhost\n',
          permissions: '-rw-r--r--',
          owner: 'root',
          size: 35,
          modified: new Date(),
        },
      },
    },
    tmp: {
      type: 'directory',
      name: 'tmp',
      permissions: 'drwxrwxrwt',
      owner: 'root',
      modified: new Date(),
      children: {},
    },
    var: {
      type: 'directory',
      name: 'var',
      permissions: 'drwxr-xr-x',
      owner: 'root',
      modified: new Date(),
      children: {
        log: {
          type: 'directory',
          name: 'log',
          permissions: 'drwxr-xr-x',
          owner: 'root',
          modified: new Date(),
          children: {},
        },
      },
    },
  };
};

export class VirtualFileSystem {
  private fileSystem: FileSystem;
  private currentPath: string;

  constructor(fileSystem?: FileSystem, currentPath: string = '/home/user') {
    this.fileSystem = fileSystem || createInitialFileSystem();
    this.currentPath = currentPath;
  }

  getCurrentPath(): string {
    return this.currentPath;
  }

  getFileSystem(): FileSystem {
    return this.fileSystem;
  }

  private parsePath(path: string): string[] {
    if (path.startsWith('/')) {
      return path.split('/').filter(p => p !== '');
    }
    const current = this.currentPath.split('/').filter(p => p !== '');
    const relative = path.split('/').filter(p => p !== '');

    const result = [...current];
    for (const part of relative) {
      if (part === '..') {
        result.pop();
      } else if (part !== '.') {
        result.push(part);
      }
    }
    return result;
  }

  private getNode(path: string): VFSNode | null {
    const parts = this.parsePath(path);
    let node: any = this.fileSystem;

    for (const part of parts) {
      if (node && typeof node === 'object' && 'children' in node && node.children && node.children[part]) {
        node = node.children[part];
      } else if (node && typeof node === 'object' && part in node) {
        node = node[part];
      } else {
        return null;
      }
    }

    return node as VFSNode;
  }

  changeDirectory(path: string): { success: boolean; error?: string; path?: string } {
    if (path === '/') {
      this.currentPath = '/';
      return { success: true, path: '/' };
    }

    const node = this.getNode(path);
    if (!node) {
      return { success: false, error: `cd: ${path}: No such file or directory` };
    }
    if (node.type !== 'directory') {
      return { success: false, error: `cd: ${path}: Not a directory` };
    }

    const parts = this.parsePath(path);
    this.currentPath = '/' + parts.join('/');
    return { success: true, path: this.currentPath };
  }

  listDirectory(path?: string): { success: boolean; entries?: VFSNode[]; error?: string } {
    const targetPath = path || this.currentPath;
    const node = this.getNode(targetPath);

    if (!node) {
      return { success: false, error: `ls: cannot access '${path}': No such file or directory` };
    }
    if (node.type !== 'directory') {
      return { success: true, entries: [node] };
    }

    const entries: VFSNode[] = [];
    if (node.children) {
      for (const child of Object.values(node.children)) {
        entries.push(child);
      }
    }

    return { success: true, entries };
  }

  readFile(path: string): { success: boolean; content?: string; error?: string } {
    const node = this.getNode(path);

    if (!node) {
      return { success: false, error: `cat: ${path}: No such file or directory` };
    }
    if (node.type !== 'file') {
      return { success: false, error: `cat: ${path}: Is a directory` };
    }

    return { success: true, content: node.content || '' };
  }

  createDirectory(path: string): { success: boolean; error?: string } {
    const parts = this.parsePath(path);
    const dirName = parts.pop();

    if (!dirName) {
      return { success: false, error: 'mkdir: missing operand' };
    }

    const parentPath = '/' + parts.join('/');
    const parentNode: any = parts.length === 0 ? this.fileSystem : this.getNode(parentPath);

    if (!parentNode) {
      return { success: false, error: `mkdir: cannot create directory '${path}': No such file or directory` };
    }

    const children: any = 'children' in parentNode ? parentNode.children : parentNode;

    if (children && children[dirName]) {
      return { success: false, error: `mkdir: cannot create directory '${path}': File exists` };
    }

    const newDir: VFSNode = {
      type: 'directory',
      name: dirName,
      permissions: 'drwxr-xr-x',
      owner: 'user',
      modified: new Date(),
      children: {},
    };

    if (children) {
      children[dirName] = newDir;
    }

    return { success: true };
  }

  createFile(path: string, content: string = ''): { success: boolean; error?: string } {
    const parts = this.parsePath(path);
    const fileName = parts.pop();

    if (!fileName) {
      return { success: false, error: 'touch: missing operand' };
    }

    const parentPath = '/' + parts.join('/');
    const parentNode: any = parts.length === 0 ? this.fileSystem : this.getNode(parentPath);

    if (!parentNode) {
      return { success: false, error: `touch: cannot touch '${path}': No such file or directory` };
    }

    const children: any = 'children' in parentNode ? parentNode.children : parentNode;

    const newFile: VFSNode = {
      type: 'file',
      name: fileName,
      content,
      permissions: '-rw-r--r--',
      owner: 'user',
      size: content.length,
      modified: new Date(),
    };

    if (children) {
      children[fileName] = newFile;
    }

    return { success: true };
  }

  removeFile(path: string): { success: boolean; error?: string } {
    const parts = this.parsePath(path);
    const fileName = parts.pop();

    if (!fileName) {
      return { success: false, error: 'rm: missing operand' };
    }

    const parentPath = '/' + parts.join('/');
    const parentNode: any = parts.length === 0 ? this.fileSystem : this.getNode(parentPath);

    if (!parentNode) {
      return { success: false, error: `rm: cannot remove '${path}': No such file or directory` };
    }

    const children: any = 'children' in parentNode ? parentNode.children : parentNode;

    if (!children || !children[fileName]) {
      return { success: false, error: `rm: cannot remove '${path}': No such file or directory` };
    }

    if (children[fileName].type === 'directory') {
      return { success: false, error: `rm: cannot remove '${path}': Is a directory` };
    }

    delete children[fileName];
    return { success: true };
  }

  removeDirectory(path: string, recursive: boolean = false): { success: boolean; error?: string } {
    const parts = this.parsePath(path);
    const dirName = parts.pop();

    if (!dirName) {
      return { success: false, error: 'rmdir: missing operand' };
    }

    const parentPath = '/' + parts.join('/');
    const parentNode: any = parts.length === 0 ? this.fileSystem : this.getNode(parentPath);

    if (!parentNode) {
      return { success: false, error: `rmdir: failed to remove '${path}': No such file or directory` };
    }

    const children: any = 'children' in parentNode ? parentNode.children : parentNode;

    if (!children || !children[dirName]) {
      return { success: false, error: `rmdir: failed to remove '${path}': No such file or directory` };
    }

    const targetNode = children[dirName];
    if (targetNode.type !== 'directory') {
      return { success: false, error: `rmdir: failed to remove '${path}': Not a directory` };
    }

    if (!recursive && targetNode.children && Object.keys(targetNode.children).length > 0) {
      return { success: false, error: `rmdir: failed to remove '${path}': Directory not empty` };
    }

    delete children[dirName];
    return { success: true };
  }
}
