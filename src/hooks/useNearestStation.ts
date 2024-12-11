import { useState, useEffect } from 'react';
import { Station } from '../types';
import { calculateDistance, getCurrentPosition } from '../utils/geolocation';

export const useNearestStation = (stations: Station[]) => {
  const [nearestStation, setNearestStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateNearestStation = async () => {
    setLoading(true);
    setError(null);
    try {
      const position = await getCurrentPosition();
      const stationsWithDistance = stations.map(station => ({
        ...station,
        distance: calculateDistance(
          position.coords.latitude,
          position.coords.longitude,
          station.lat,
          station.lng
        )
      }));

      const nearest = stationsWithDistance.reduce((prev, current) => 
        prev.distance < current.distance ? prev : current
      );

      setNearestStation(nearest);
    } catch (err) {
      setError('位置情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateNearestStation();
    const interval = setInterval(updateNearestStation, 30000); // 30秒ごとに更新
    return () => clearInterval(interval);
  }, [stations]);

  return { nearestStation, loading, error, updateNearestStation };
};