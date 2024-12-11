import { stations as initialStations } from '../data/stations';
import { Settings, AppState } from '../types';

const initialSettings: Settings = {
  startStation: null,
  direction: 'clockwise',
  bypassLocationCheck: false,
};

export const getInitialState = (): AppState => ({
  stations: initialStations,
  settings: initialSettings,
});