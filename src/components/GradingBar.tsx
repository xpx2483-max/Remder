import { useAppStore } from '../store/appStore';

export const GradingBar = () => {
  const { saveReview, currentMetadata } = useAppStore();

  if (!currentMetadata) return null;

  const handleGrade = async (rating: number) => {
    await saveReview(rating);
  };

  return (
    <div className="card bg-base-200 border border-base-300 p-2">
      <div className="flex flex-col items-center gap-1 mb-2">
          <span className="text-xs text-base-content/50 uppercase font-bold tracking-wider">Rate Recall</span>
      </div>
      <div className="join">
        <button className="join-item btn btn-error btn-md w-24 flex flex-col gap-0" onClick={() => handleGrade(1)}>
            <span>Again</span>
            <span className="text-[10px] opacity-70 font-normal">1 min</span>
        </button>
        <button className="join-item btn btn-warning btn-md w-24 flex flex-col gap-0" onClick={() => handleGrade(2)}>
            <span>Hard</span>
            <span className="text-[10px] opacity-70 font-normal">2 days</span>
        </button>
        <button className="join-item btn btn-info btn-md w-24 flex flex-col gap-0" onClick={() => handleGrade(3)}>
            <span>Good</span>
            <span className="text-[10px] opacity-70 font-normal">4 days</span>
        </button>
        <button className="join-item btn btn-success btn-md w-24 flex flex-col gap-0" onClick={() => handleGrade(4)}>
            <span>Easy</span>
            <span className="text-[10px] opacity-70 font-normal">7 days</span>
        </button>
      </div>
      {currentMetadata.lastReview && (
          <div className="text-center mt-2 text-xs text-base-content/40">
              Last reviewed: {new Date(currentMetadata.lastReview.review).toLocaleDateString()}
          </div>
      )}
    </div>
  );
};
