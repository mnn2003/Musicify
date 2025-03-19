import React from 'react';
import { ChevronDown } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

interface QueuePanelProps {
  onClose: () => void;
}

const QueuePanel: React.FC<QueuePanelProps> = ({ onClose }) => {
  const { queue } = usePlayerStore();

  return (
    <div className="absolute bottom-full right-0 w-full sm:w-80 max-h-96 overflow-y-auto bg-gray-900 border border-gray-800 rounded-t-lg shadow-lg">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-white font-bold">Queue</h3>
        <button
          className="text-gray-400 hover:text-white"
          onClick={onClose}
          aria-label="Close queue"
        >
          <ChevronDown size={20} />
        </button>
      </div>
      
      <div className="p-2">
        {queue.length > 0 ? (
          queue.map((track, index) => (
            <div
              key={`${track.id}-${index}`}
              className="flex items-center p-2 hover:bg-gray-800 rounded-md"
            >
              <img
                src={track.thumbnail || "/placeholder.svg"}
                alt={track.title}
                className="w-10 h-10 object-cover mr-3 rounded"
              />
              <div className="truncate flex-1">
                <div className="text-white text-sm truncate">{track.title}</div>
                <div className="text-gray-400 text-xs truncate">{track.artist}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400 text-center py-4">Queue is empty</div>
        )}
      </div>
    </div>
  );
};

export default QueuePanel;
