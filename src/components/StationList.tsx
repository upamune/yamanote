import React, { useState } from 'react';
import { Check, MapPin, Flag, PlayCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Station } from '../types';
import { calculateDistance, getCurrentPosition } from '../utils/geolocation';

interface StationListProps {
  stations: Station[];
  bypassLocationCheck: boolean;
  onCheckIn: (stationId: number) => void;
  startStation: number | null;
  direction: 'clockwise' | 'counterclockwise';
}

export const StationList: React.FC<StationListProps> = ({
  stations,
  bypassLocationCheck,
  onCheckIn,
  startStation,
  direction
}) => {
  const [showCheckedStations, setShowCheckedStations] = useState(true);

  const orderedStations = React.useMemo(() => {
    if (!startStation) return stations;

    const startIndex = stations.findIndex(s => s.id === startStation);
    if (startIndex === -1) return stations;

    let orderedStations;
    if (direction === 'clockwise') {
      orderedStations = [
        ...stations.slice(startIndex),
        ...stations.slice(0, startIndex)
      ];
    } else {
      orderedStations = [
        ...stations.slice(startIndex).reverse(),
        ...stations.slice(0, startIndex).reverse()
      ];
    }

    const goalStation = { ...stations[startIndex], isGoalPoint: true };
    return [...orderedStations, goalStation];
  }, [stations, startStation, direction]);

  const { checkedStations, uncheckedStations } = React.useMemo(() => {
    return orderedStations.reduce(
      (acc, station) => {
        const isStartStation = station.id === startStation && !station.isGoalPoint;
        const isGoalStation = station.isGoalPoint;
        const isComplete = isStartStation 
          ? station.startCheckedIn
          : isGoalStation
          ? station.goalCheckedIn
          : station.checkedIn;

        if (isComplete) {
          acc.checkedStations.push(station);
        } else {
          acc.uncheckedStations.push(station);
        }
        return acc;
      },
      { checkedStations: [] as Station[], uncheckedStations: [] as Station[] }
    );
  }, [orderedStations, startStation]);

  const handleCheckIn = async (station: Station) => {
    if (!bypassLocationCheck) {
      try {
        const position = await getCurrentPosition();
        const distance = calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          station.lat,
          station.lng
        );

        if (distance > 1000) {
          toast.error('駅から1000m以内でチェックインしてください！');
          return;
        }
      } catch (error) {
        toast.error('位置情報の取得に失敗しました: ' + (error as Error).message);
        return;
      }
    }

    onCheckIn(station.id);
    toast.success(`${station.nameJa}にチェックインしました！`);
  };

  const renderStation = (station: Station) => {
    const isStartStation = station.id === startStation && !station.isGoalPoint;
    const isGoalStation = station.isGoalPoint;
    const isComplete = isStartStation 
      ? station.startCheckedIn
      : isGoalStation
      ? station.goalCheckedIn
      : station.checkedIn;

    // 駅の順序に基づくインデックスを計算
    const stationIndex = orderedStations.findIndex(
      s => s.id === station.id && s.isGoalPoint === station.isGoalPoint
    );

    return (
      <div
        key={`${station.id}${isGoalStation ? '-goal' : ''}`}
        className={`p-4 rounded-lg shadow-md ${
          isComplete ? 'bg-green-100' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 w-8">
                {stationIndex + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">{station.nameJa}</h3>
                  {isStartStation && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      スタート地点
                    </span>
                  )}
                  {isGoalStation && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      ゴール地点
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{station.name}</p>
                {station.checkedInAt && (
                  <p className="text-xs text-gray-500">
                    チェックイン: {new Date(station.checkedInAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleCheckIn(station)}
            disabled={isComplete}
            className={`p-2 rounded-full ${
              isComplete
                ? 'bg-green-500 text-white'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {isComplete ? (
              <Check size={20} />
            ) : isStartStation ? (
              <PlayCircle size={20} />
            ) : isGoalStation ? (
              <Flag size={20} />
            ) : (
              <MapPin size={20} />
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {checkedStations.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowCheckedStations(!showCheckedStations)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
          >
            {showCheckedStations ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
            チェックイン済み ({checkedStations.length}駅)
          </button>

          {showCheckedStations && (
            <div className="space-y-4">
              {checkedStations.map(station => renderStation(station))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {uncheckedStations.map(station => renderStation(station))}
      </div>
    </div>
  );
};