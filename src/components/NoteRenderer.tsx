import { useAppStore } from '../store/appStore';
import { ReviewMode } from './modes/ReviewMode';
import { ClozeMode } from './modes/ClozeMode';
import { BlurMode } from './modes/BlurMode';
import { EditMode } from './modes/EditMode';
import { GradingBar } from './GradingBar'; // We will implement this next
import { Eye, MessageSquare, Flashlight, Edit } from 'lucide-react';

export const NoteRenderer = () => {
  const { viewMode, setViewMode } = useAppStore();

  // We need a local state to toggle between sub-modes if "viewMode" in store is just "review"
  // Actually, store has 'review', 'test' (cloze), 'master' (blur).

  const renderContent = () => {
      switch (viewMode) {
          case 'review': return <ReviewMode />;
          case 'test': return <ClozeMode />;
          case 'master': return <BlurMode />;
          case 'edit': return <EditMode />;
          default: return <ReviewMode />;
      }
  };

  return (
    <div className="h-full flex flex-col bg-base-100 relative">
        {/* Mode Switcher (Top Right, under the close button ideally, or separate toolbar) */}
        {/* Let's put it in a toolbar at the top center */}
        <div className="flex justify-center p-2 border-b border-base-200 bg-base-100/80 backdrop-blur z-40">
            <div className="join">
                <button
                    className={`join-item btn btn-sm ${viewMode === 'review' ? 'btn-active btn-primary' : ''}`}
                    onClick={() => setViewMode('review')}
                    title="Review (Read)"
                >
                    <Eye size={16} />
                </button>
                <button
                    className={`join-item btn btn-sm ${viewMode === 'test' ? 'btn-active btn-secondary' : ''}`}
                    onClick={() => setViewMode('test')}
                    title="Test (Cloze)"
                >
                    <MessageSquare size={16} />
                </button>
                <button
                    className={`join-item btn btn-sm ${viewMode === 'master' ? 'btn-active btn-accent' : ''}`}
                    onClick={() => setViewMode('master')}
                    title="Master (Blur)"
                >
                    <Flashlight size={16} />
                </button>
                <button
                    className={`join-item btn btn-sm ${viewMode === 'edit' ? 'btn-active' : ''}`}
                    onClick={() => setViewMode('edit')}
                    title="Edit (Source)"
                >
                    <Edit size={16} />
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-32">
            {renderContent()}
        </div>

        {/* Grading Bar - Fixed at bottom */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
             <div className="pointer-events-auto shadow-xl rounded-box">
                <GradingBar />
             </div>
        </div>
    </div>
  );
};
