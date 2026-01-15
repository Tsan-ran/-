
import React from 'react';
import { Camera, List, Search, Upload, LayoutGrid,  Bug, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onNavigate: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onNavigate }) => {
  const navItems = [
    { id: 'add', icon: <Camera size={20} />, label: '新增/編輯' },
    { id: 'list', icon: <List size={20} />, label: '紀錄列表' },
    { id: 'gallery', icon: <LayoutGrid size={20} />, label: '相簿統整' },
    { id: 'import', icon: <Upload size={20} />, label: '匯入 CSV' },
    { id: 'settings', icon: <Settings size={20} />, label: '儲存說明' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <nav className="fixed bottom-0 left-0 right-0 md:relative md:w-64 bg-white border-t md:border-t-0 md:border-r border-slate-200 z-50">
        <div className="p-6 hidden md:flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center bg-white">
            <img
              src="/logo.JPG"
              alt="logo"xs
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="text-lg font-black text-slate-800 tracking-tight">蛾類名錄</h1>
        </div>
        <div className="flex md:flex-col justify-around md:justify-start p-2 md:p-4 gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col md:flex-row items-center gap-3 p-3 rounded-2xl transition-all ${
                activeTab === item.id 
                  ? 'bg-slate-900 text-white font-bold shadow-lg shadow-slate-200' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              {item.icon}
              <span className="text-[10px] md:text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto h-screen">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-5 z-40">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">
            {navItems.find(i => i.id === activeTab)?.label || '蛾類名錄'}
          </h2>
        </header>
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
