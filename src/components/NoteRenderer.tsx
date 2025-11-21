import { useAppStore } from '../store/appStore';
import { ReviewMode } from './modes/ReviewMode';
import { ClozeMode } from './modes/ClozeMode';
import { BlurMode } from './modes/BlurMode';
import { EditMode } from './modes/EditMode';
import { GradingBar } from './GradingBar';
import { SessionSummary } from './SessionSummary';
import { Eye, MessageSquare, Flashlight, Edit } from 'lucide-react';

export const NoteRenderer = () => {
  const { viewMode, setViewMode, sessionStats, sessionTotal } = useAppStore();

  if (viewMode === 'summary') {
      return <SessionSummary />;
  }

  const renderContent = () => {
      switch (viewMode) {
          case 'review': return <ReviewMode />;
          case 'test': return <ClozeMode />;
          case 'master': return <BlurMode />;
          case 'edit': return <EditMode />;
          default: return <ReviewMode />;
      }
  };

  const progressPercentage = sessionTotal > 0
    ? Math.round(((sessionStats.reviewedCount + 1) / sessionTotal) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col bg-base-100 relative">
        {/* Session HUD Progress Bar */}
        {sessionTotal > 0 && (
             <div className="absolute top-0 left-0 right-0 h-1 z-50">
                 <div
                    className="h-full bg-secondary transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                 />
             </div>
        )}

        {/* Mode Switcher */}
        <div className="flex justify-center p-2 border-b border-base-200 bg-base-100/80 backdrop-blur z-40 mt-1">
            {sessionTotal > 0 && (
                <div className="absolute left-4 top-2 text-xs opacity-50 font-mono mt-1">
                    {sessionStats.reviewedCount + 1} / {sessionTotal}
                </div>
            )}

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

        {/* Grading Bar */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
             <div className="pointer-events-auto shadow-xl rounded-box">
                <GradingBar />
             </div>
        </div>
    </div>
  );
};
