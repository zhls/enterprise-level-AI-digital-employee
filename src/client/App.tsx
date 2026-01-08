import React, { useEffect, useState } from 'react';
import { ApiKeyConfig } from './components/Config/ApiKeyConfig';
import { DashboardLayout } from './components/Dashboard/DashboardLayout';
import { AvatarContainer } from './components/Avatar/AvatarContainer';
import { ChatBox } from './components/Chat/ChatBox';
import keyService from './services/keyService';
import { useKeyStore } from './store/keyStore';
import { useAvatarStore } from './store/avatarStore';
import AvatarController from './components/Avatar/AvatarController';

function App() {
  const { isConfigured, setConfigured, setKeys } = useKeyStore();
  const { status } = useAvatarStore();
  const [isLoading, setIsLoading] = useState(true);

  const getStatusText = () => {
    switch (status) {
      case 'connected': return '已连接';
      case 'connecting': return '连接中...';
      case 'error': return '连接失败';
      default: return '未连接';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  useEffect(() => {
    const keys = keyService.getApiKeys();
    if (keys) {
      setKeys(keys);
      setConfigured(true);
    }
    setIsLoading(false);
  }, [setKeys, setConfigured]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  if (!isConfigured) {
    return <ApiKeyConfig onConfigured={() => setConfigured(true)} />;
  }



  return (
    <DashboardLayout>
      {/* AI健康助手 - 固定在屏幕中央20%位置 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[20vw] h-[20vw] min-w-[300px] min-h-[300px] z-50 pointer-events-none">
        <div className="relative w-full h-full">
          {/* 半透明背景圆 */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full backdrop-blur-sm border-2 border-white/30 shadow-2xl"></div>

          {/* 数字人容器 */}
          <div className="absolute inset-2 rounded-full overflow-hidden pointer-events-auto">
            <AvatarContainer />
          </div>

          {/* 状态指示器 */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm px-4 py-1 rounded-full border border-white/20">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${status === 'connecting' ? 'animate-pulse' : ''}`} />
              <span className="text-white text-xs font-medium">{getStatusText()}</span>
              <span className="text-white/40 text-xs">|</span>
              <span className="text-white/70 text-xs">AI健康助手</span>
            </div>
          </div>

          {/* 连接控制按钮 */}
          <div className="absolute -top-3 right-0 pointer-events-auto">
            <button
              onClick={() => AvatarController.disconnect()}
              className="bg-red-500/80 hover:bg-red-500 text-white px-3 py-1 rounded-full text-xs border border-white/30 backdrop-blur-sm transition"
            >
              断开
            </button>
          </div>
        </div>
      </div>

      <div className="h-full">
        <ChatBox />
      </div>
    </DashboardLayout>
  );
}

export default App;
