import { useAppStore } from '../store/appStore';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import { FolderOpen, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { join } from '@tauri-apps/api/path';
import { Dashboard } from './Dashboard';
import { formatDistanceToNow, isPast, isToday } from 'date-fns';
import { ThemeController } from './shared/ThemeController';

export const LibraryView = () => {
  const { rootPath, files, fileMetadatas, setRootPath, setFiles, loadNote, initDataService, loadSettings } = useAppStore();
  const [loading, setLoading] = useState(false);

  // Initialize data service & settings on mount
  useEffect(() => {
    initDataService('mock');
    loadSettings();
  }, []);

  // Auto-scan if rootPath is loaded from settings
  useEffect(() => {
      if (rootPath && files.length === 0) {
          scanFiles(rootPath);
      }
  }, [rootPath]);

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

  // Group files
  const grouped = files.reduce((acc, file) => {
      const meta = fileMetadatas[file];
      const isNew = !meta?.card || meta.card.reps === 0;
      const dueDate = meta?.card?.due ? new Date(meta.card.due) : null;

      if (isNew) {
          acc.new.push(file);
      } else if (dueDate && isPast(dueDate) && !isToday(dueDate)) {
          acc.overdue.push(file);
      } else if (dueDate && isToday(dueDate)) {
          acc.today.push(file);
      } else {
          acc.future.push(file);
      }
      return acc;
  }, { overdue: [] as string[], today: [] as string[], new: [] as string[], future: [] as string[] });

  return (
    <div className="h-full flex flex-col p-4 bg-base-200">
      <div className="navbar bg-base-100 rounded-box shadow-sm mb-4">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl">Memory Player</a>
        </div>
        <div className="flex-none gap-2">
            <ThemeController />
            <button
                className="btn btn-primary"
                onClick={handleOpenFolder}
                disabled={loading}
            >
                {loading ? <span className="loading loading-spinner"></span> : <FolderOpen size={18} />}
                {rootPath ? 'Change' : 'Open'}
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
            <>
                <Dashboard />

                <div className="space-y-4 pb-20">
                    <FileSection title="🚨 Overdue" files={grouped.overdue} rootPath={rootPath} loadNote={loadNote} metadatas={fileMetadatas} color="error" />
                    <FileSection title="📅 Due Today" files={grouped.today} rootPath={rootPath} loadNote={loadNote} metadatas={fileMetadatas} color="warning" />
                    <FileSection title="🆕 New" files={grouped.new} rootPath={rootPath} loadNote={loadNote} metadatas={fileMetadatas} color="info" />
                    <FileSection title="💤 Future" files={grouped.future} rootPath={rootPath} loadNote={loadNote} metadatas={fileMetadatas} color="neutral" collapsed />
                </div>
            </>
        )}
      </div>
    </div>
  );
};

const FileSection = ({ title, files, rootPath, loadNote, metadatas, color, collapsed = false }: any) => {
    if (files.length === 0) return null;

    return (
        <div className="collapse collapse-arrow bg-base-100 shadow-sm">
            <input type="checkbox" defaultChecked={!collapsed} />
            <div className={`collapse-title text-xl font-medium text-${color} flex items-center gap-2`}>
                {title} <span className="badge badge-sm">{files.length}</span>
            </div>
            <div className="collapse-content">
                <ul className="menu w-full p-0">
                    {files.map((file: string, idx: number) => {
                         const meta = metadatas[file];
                         return (
                            <li key={idx}>
                                <a onClick={() => loadNote(file)} className="flex items-center gap-2 py-2">
                                    <FileText size={16} className="opacity-50" />
                                    <span className="truncate flex-1" title={file}>
                                        {file.replace(rootPath || '', '').replace(/^\//, '')}
                                    </span>
                                    {meta?.card?.due && (
                                        <span className="text-xs opacity-40">
                                            {formatDistanceToNow(new Date(meta.card.due), { addSuffix: true })}
                                        </span>
                                    )}
                                </a>
                            </li>
                         );
                    })}
                </ul>
            </div>
        </div>
    );
};
