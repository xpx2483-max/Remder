import { useAppStore } from '../store/appStore';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import { FolderOpen, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { join } from '@tauri-apps/api/path';

export const LibraryView = () => {
  const { rootPath, files, setRootPath, setFiles, loadNote, initDataService } = useAppStore();
  const [loading, setLoading] = useState(false);

  // Initialize data service on mount
  useEffect(() => {
    initDataService('mock');
  }, []);

  const handleOpenFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
      });

      if (selected && typeof selected === 'string') {
        setRootPath(selected);
        scanFiles(selected);
      }
    } catch (err) {
      console.error("Failed to open dialog", err);
    }
  };

  const scanFiles = async (path: string) => {
    setLoading(true);
    try {
      // Quick recursive scan using a helper queue
      const mdFiles: string[] = [];
      const queue = [path];

      while (queue.length > 0) {
        const currentDir = queue.shift()!;
        try {
           const entries = await readDir(currentDir);
           for (const entry of entries) {
               const fullPath = await join(currentDir, entry.name);

               if (entry.isDirectory) {
                   queue.push(fullPath);
               } else if (entry.isFile && entry.name.endsWith('.md')) {
                   mdFiles.push(fullPath);
               }
           }
        } catch (e) {
            console.warn(`Failed to read dir: ${currentDir}`, e);
        }
      }
      setFiles(mdFiles);
    } catch (e) {
      console.error("Scan failed", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-4 bg-base-200">
      <div className="navbar bg-base-100 rounded-box shadow-sm mb-4">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Memory Player</a>
        </div>
        <div className="flex-none gap-2">
          <button
            className="btn btn-primary"
            onClick={handleOpenFolder}
            disabled={loading}
          >
            {loading ? <span className="loading loading-spinner"></span> : <FolderOpen size={18} />}
            {rootPath ? 'Change Folder' : 'Open Folder'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!rootPath ? (
          <div className="hero h-full">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h1 className="text-5xl font-bold">Hello there</h1>
                <p className="py-6">Select your Obsidian vault or a folder with Markdown files to get started.</p>
                <button className="btn btn-primary" onClick={handleOpenFolder}>Get Started</button>
              </div>
            </div>
          </div>
        ) : (
            <div className="card bg-base-100 shadow-xl h-full">
                <div className="card-body p-0">
                    <ul className="menu w-full rounded-box">
                        <li className="menu-title p-4 bg-base-200">
                             <span>Library ({files.length} notes)</span>
                        </li>
                        {files.map((file, idx) => (
                            <li key={idx}>
                                <a onClick={() => loadNote(file)} className="flex items-center gap-2 py-3">
                                    <FileText size={16} className="text-secondary" />
                                    <span className="truncate" title={file}>
                                        {file.replace(rootPath, '').replace(/^\//, '')}
                                    </span>
                                </a>
                            </li>
                        ))}
                        {files.length === 0 && !loading && (
                            <li className="p-4 text-center text-base-content/50">No markdown files found.</li>
                        )}
                    </ul>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
