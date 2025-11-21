import { useAppStore } from '../store/appStore';
import { LibraryView } from './LibraryView';
import { NoteRenderer } from './NoteRenderer';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useKeyboardShortcuts } from './shared/useKeyboardShortcuts';

export const Layout = () => {
  const { viewMode, closeNote } = useAppStore();

  // Initialize Global Shortcuts
  useKeyboardShortcuts();

  return (
    <div className="h-screen w-screen bg-base-300 overflow-hidden flex">
       <AnimatePresence mode="wait">
         {viewMode === 'library' ? (
            <motion.div
                key="library"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full h-full"
            >
                <LibraryView />
            </motion.div>
         ) : (
             <motion.div
                key="player"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full h-full relative"
             >
                 {/* Top Bar for Player */}
                 <div className="absolute top-0 left-0 right-0 p-2 z-50 flex justify-between pointer-events-none">
                     <button
                        className="btn btn-circle btn-ghost pointer-events-auto bg-base-100/50 backdrop-blur"
                        onClick={closeNote}
                     >
                         <X />
                     </button>
                 </div>

                 <NoteRenderer />
             </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};
