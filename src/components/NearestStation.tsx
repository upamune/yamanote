import React from 'react';
import { MapPin, RotateCw } from 'lucide-react';
import { Station } from '../types';

interface NearestStationProps {
  station: Station | null;
  distance?: number;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const NearestStation: React.FC<NearestStationProps> = ({
  station,
  loading,
  error,
  onRefresh
}) => {
  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg mb-4">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <MapPin className="text-blue-500" size={24} />
          <div>
            <h2 className="text-lg font-bold">最寄り駅</h2>
            {loading ? (
              <p className="text-gray-500">位置情報を取得中...</p>
            ) : station ? (
              <p className="text-gray-700">
                {station.nameJa}
                {station.distance && (
                  <span className="text-sm text-gray-500 ml-2">
                    (約{Math.round(station.distance)}m)
                  </span>
                )}
              </p>
            ) : (
              <p className="text-gray-500">位置情報を取得できません</p>
            )}
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 hover:bg-gray-100 rounded-full"
          title="位置情報を更新"
        >
          <RotateCw size={20} />
        </button>
      </div>
    </div>
  );
};