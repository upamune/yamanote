import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, ArrowRightCircle } from 'lucide-react';
import { Toaster } from 'sonner';
import { StationList } from './components/StationList';
import { ProgressBar } from './components/ProgressBar';
import { SettingsModal } from './components/SettingsModal';
import { NearestStation } from './components/NearestStation';
import { InitialSetupModal } from './components/InitialSetupModal';
import { stations as initialStations } from './data/stations';
import { Settings, AppState } from './types';
import { loadFromLocalStorage, saveToLocalStorage } from './utils/storage';
import { useNearestStation } from './hooks/useNearestStation';

const initialSettings: Settings = {
  startStation: null,
  direction: 'clockwise',
  bypassLocationCheck: false,
};

export function App() {
  const [state, setState] = useState<AppState>(() => {
    const savedState = loadFromLocalStorage();
    return savedState || {
      stations: initialStations,
      settings: initialSettings,
    };
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { nearestStation, loading, error, updateNearestStation } = useNearestStation(state.stations);

  const isInitialized = state.settings.startStation !== null;

  useEffect(() => {
    saveToLocalStorage(state);
  }, [state]);

  const handleInitialSetup = (startStation: number, direction: 'clockwise' | 'counterclockwise') => {
    setState(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        startStation,
        direction,
      }
    }));
  };

  const handleCheckIn = (stationId: number) => {
    setState((prev) => ({
      ...prev,
      stations: prev.stations.map((station) => {
        if (station.id !== stationId) return station;

        if (station.id === prev.settings.startStation) {
          if (!station.startCheckedIn) {
            return {
              ...station,
              startCheckedIn: true,
              checkedInAt: new Date().toISOString()
            };
          }
          if (!station.goalCheckedIn) {
            return {
              ...station,
              goalCheckedIn: true,
              checkedInAt: new Date().toISOString()
            };
          }
          return station;
        }

        return {
          ...station,
          checkedIn: true,
          checkedInAt: new Date().toISOString()
        };
      }),
    }));
  };

  const handleSettingsChange = (newSettings: Partial<Settings>) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings },
    }));
  };

  const handleDataImport = (data: AppState) => {
    setState(data);
    setIsSettingsOpen(false);
  };

  const completedStations = state.stations.reduce((count, station) => {
    if (station.id === state.settings.startStation) {
      return count + (station.startCheckedIn && station.goalCheckedIn ? 1 : 0);
    }
    return count + (station.checkedIn ? 1 : 0);
  }, 0);

  if (!isInitialized) {
    return (
      <>
        <Toaster position="top-center" />
        <InitialSetupModal
          stations={state.stations}
          onComplete={handleInitialSetup}
          onDataImport={handleDataImport}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Toaster position="top-center" />
      <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">山手線ウォーキング</h1>
              <div className="flex items-center gap-2 mt-1 text-gray-600">
                <ArrowRightCircle 
                  size={16} 
                  className={state.settings.direction === 'counterclockwise' ? 'rotate-180' : ''}
                />
                <span className="text-sm">
                  {state.settings.direction === 'clockwise' ? '外回り' : '内回り'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <SettingsIcon size={24} />
            </button>
          </div>
          <div className="mt-4">
            <ProgressBar 
              total={state.stations.length} 
              completed={completedStations} 
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 mt-28">
        <NearestStation
          station={nearestStation}
          loading={loading}
          error={error}
          onRefresh={updateNearestStation}
        />
        <StationList
          stations={state.stations}
          bypassLocationCheck={state.settings.bypassLocationCheck}
          onCheckIn={handleCheckIn}
          startStation={state.settings.startStation}
          direction={state.settings.direction}
        />
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={state.settings}
        stations={state.stations}
        onSettingsChange={handleSettingsChange}
        onDataImport={handleDataImport}
      />
    </div>
  );
}