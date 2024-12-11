import React from 'react';
import { Train, ArrowRightCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Station, AppState } from '../types';
import { importData } from '../utils/storage';

interface InitialSetupModalProps {
  stations: Station[];
  onComplete: (startStation: number, direction: 'clockwise' | 'counterclockwise') => void;
  onDataImport: (data: AppState) => void;
}

export const InitialSetupModal: React.FC<InitialSetupModalProps> = ({
  stations,
  onComplete,
  onDataImport,
}) => {
  const [selectedStation, setSelectedStation] = React.useState<number | ''>('');
  const [selectedDirection, setSelectedDirection] = React.useState<'clockwise' | 'counterclockwise'>('clockwise');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStation === '') {
      toast.error('開始駅を選択してください');
      return;
    }
    onComplete(Number(selectedStation), selectedDirection);
    toast.success('設定を保存しました！');
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await importData(file);
      onDataImport(data);
      toast.success('データをインポートしました');
    } catch (error) {
      toast.error('データのインポートに失敗しました');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Train size={48} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">山手線ウォーキング</h2>
          <p className="text-gray-600">
            開始駅と進行方向を選択して始めましょう
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              開始駅を選択
            </label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full p-3 border rounded-lg"
              required
            >
              <option value="">駅を選択してください</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.nameJa}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              進行方向を選択
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedDirection('clockwise')}
                className={`p-4 rounded-lg border flex items-center justify-center gap-2
                  ${selectedDirection === 'clockwise'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300'
                  }`}
              >
                <ArrowRightCircle />
                外回り
              </button>
              <button
                type="button"
                onClick={() => setSelectedDirection('counterclockwise')}
                className={`p-4 rounded-lg border flex items-center justify-center gap-2
                  ${selectedDirection === 'counterclockwise'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'border-gray-300'
                  }`}
              >
                <ArrowRightCircle className="rotate-180" />
                内回り
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            始める
          </button>
        </form>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-600 mb-3">
            以前のデータをお持ちの方はこちら
          </p>
          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer w-full">
            <Upload size={20} />
            データを取り込む
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
};