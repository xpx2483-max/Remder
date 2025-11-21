import { create } from 'zustand';
import { DataService, NoteMetadata } from '../lib/storage/types';
import { MockAdapter } from '../lib/storage/MockAdapter';
import { SupabaseAdapter } from '../lib/storage/SupabaseAdapter';
import { parseNote, ParsedNote } from '../lib/markdown/parser';
import { fsrs } from 'ts-fsrs';

export type ViewMode = 'library' | 'review' | 'test' | 'master' | 'edit';

interface AppState {
  dataService: DataService;
  initDataService: (type: 'mock' | 'supabase') => Promise<void>;

  rootPath: string | null;
  files: string[];
  setRootPath: (path: string) => void;
  setFiles: (files: string[]) => void;

  currentFilepath: string | null;
  currentNote: ParsedNote | null;
  currentMetadata: NoteMetadata | null;

  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  loadNote: (filepath: string) => Promise<void>;
  saveReview: (rating: number) => Promise<void>;
  closeNote: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  dataService: new MockAdapter(),

  rootPath: null,
  files: [],

  currentFilepath: null,
  currentNote: null,
  currentMetadata: null,

  viewMode: 'library',

  initDataService: async (type) => {
    let service: DataService;
    if (type === 'supabase') {
       service = new SupabaseAdapter(
         import.meta.env.VITE_SUPABASE_URL || '',
         import.meta.env.VITE_SUPABASE_ANON_KEY || ''
       );
    } else {
       service = new MockAdapter();
    }
    await service.init();
    set({ dataService: service });
  },

  setRootPath: (path) => set({ rootPath: path }),
  setFiles: (files) => set({ files }),

  setViewMode: (mode) => set({ viewMode: mode }),

  loadNote: async (filepath) => {
    try {
      const { readTextFile } = await import('@tauri-apps/plugin-fs');
      const content = await readTextFile(filepath);

      const parsed = parseNote(content);
      const metadata = await get().dataService.getMetadata(filepath);

      set({
        currentFilepath: filepath,
        currentNote: parsed,
        currentMetadata: metadata,
        viewMode: 'review'
      });
    } catch (e) {
      console.error("Failed to load note:", e);
    }
  },

  saveReview: async (rating) => {
    const { currentFilepath, currentMetadata, dataService } = get();
    if (!currentFilepath || !currentMetadata) return;

    const f = fsrs();

    const scheduling_cards = f.repeat(currentMetadata.card, new Date());
    const record = scheduling_cards[rating as 1|2|3|4];

    if (!record) {
        console.error("Invalid rating or scheduling failed");
        return;
    }

    const newCard = record.card;
    const log = record.log;

    await dataService.saveReview(currentFilepath, newCard, log);

    set({
        currentMetadata: {
            ...currentMetadata,
            card: newCard,
            lastReview: log
        }
    });
  },

  closeNote: () => set({ currentFilepath: null, currentNote: null, viewMode: 'library' })
}));
