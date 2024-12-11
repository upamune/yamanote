import React, { useState } from 'react';
import { Settings, X, Upload, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Station, Settings as SettingsType, AppState } from '../types';
import { exportData, importData } from '../utils/storage';
import { getInitialState } from '../utils/reset';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  stations: Station[];
  onSettingsChange: (settings: Partial<SettingsType>) => void;
  onDataImport: (data: AppState) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  onDataImport
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

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

  const handleExport = () => {
    exportData();
    toast.success('データをエクスポートしました');
  };

  const handleReset = () => {
    if (showResetConfirm) {
      onDataImport(getInitialState());
      toast.success('アプリケーションを初期化しました');
      setShowResetConfirm(false);
      onClose();
    } else {
      setShowResetConfirm(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings size={24} />
            設定
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold mb-4">基本設定</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bypassLocation"
                  checked={settings.bypassLocationCheck}
                  onChange={(e) =>
                    onSettingsChange({ bypassLocationCheck: e.target.checked })
                  }
                  className="rounded"
                />
                <label htmlFor="bypassLocation" className="text-sm">
                  位置情報チェックを無効化（デバッグモード）
                </label>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">データ管理</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  <Download size={20} />
                  データ出力
                </button>
                <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer">
                  <Upload size={20} />
                  データ取込
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="border-t pt-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full justify-center"
                >
                  <RefreshCw size={20} />
                  {showResetConfirm ? '本当に初期化しますか？' : 'データを初期化'}
                </button>
                {showResetConfirm && (
                  <p className="text-sm text-red-500 mt-2">
                    ※この操作は取り消せません。全てのチェックイン記録が削除されます。
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};