import { useAppStore } from '../store/appStore';
import { Play } from 'lucide-react';

export const Dashboard = () => {
    const { files, fileMetadatas, setQueue, startSession } = useAppStore();

    // Calculate Due Notes
    const now = new Date();
    const dueNotes = files.filter(f => {
        const meta = fileMetadatas[f];
        // If never reviewed (state=0, due=now), it's new but maybe we limit daily new?
        // If meta exists and due < now, it's due.
        if (!meta || !meta.card) return true; // Treat new as due
        return new Date(meta.card.due) <= now;
    });

    const handleStartSession = () => {
        setQueue(dueNotes);
        startSession();
    };

    if (dueNotes.length === 0) return null;

    return (
        <div className="card bg-primary text-primary-content shadow-xl mb-6">
            <div className="card-body flex-row items-center justify-between p-4">
                <div>
                    <h2 className="card-title text-2xl">{dueNotes.length} Notes Due</h2>
                    <p className="opacity-80">Ready for review?</p>
                </div>
                <button className="btn btn-secondary btn-lg gap-2" onClick={handleStartSession}>
                    <Play fill="currentColor" />
                    Start Session
                </button>
            </div>
        </div>
    );
};
