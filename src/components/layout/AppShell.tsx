import { Outlet, NavLink } from 'react-router-dom';
import { GraduationCap, FolderUp, CalendarCheck, FlameKindling, Settings2, BarChart3, MessageSquareText, Wifi, WifiOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { checkServerHealth } from '../../services/deepTutorClient';

const navItems = [
  { to: '/',       label: '대시보드',   icon: GraduationCap, end: true },
  { to: '/tutor',  label: 'AI 튜터',    icon: MessageSquareText },
  { to: '/upload', label: '자료 올리기', icon: FolderUp },
  { to: '/plan',   label: '플랜 짜기',  icon: CalendarCheck },
  { to: '/study',  label: '지금 공부',  icon: FlameKindling },
  { to: '/stats',  label: '통계',       icon: BarChart3 },
  { to: '/settings', label: '설정',     icon: Settings2 },
];

export default function AppShell() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkServerHealth().then(setOnline);
    const id = setInterval(() => checkServerHealth().then(setOnline), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-gradient-to-b from-slate-900 via-slate-900 to-exam-900 flex flex-col shadow-2xl">
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-exam-400 to-heat-500 rounded-2xl flex items-center justify-center shadow-lg shadow-exam-900/50">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-white text-xl tracking-tight">
                EXAM<span className="text-heat-400">!!</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium">powered by DeepTutor</p>
            </div>
          </div>
        </div>

        {/* DeepTutor Status */}
        <div className="mx-3 mt-3 mb-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
          {online === null ? (
            <div className="w-2 h-2 rounded-full bg-slate-500 animate-pulse" />
          ) : online ? (
            <Wifi className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
          )}
          <span className={`text-xs font-medium ${online ? 'text-green-400' : 'text-slate-500'}`}>
            {online === null ? '확인 중...' : online ? 'DeepTutor 연결됨' : 'OpenRouter 직접 연결'}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 mt-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-white/15 text-white shadow-inner'
                    : 'text-slate-400 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <p className="text-[10px] text-slate-500 text-center">EXAM!! v1.1 · DeepTutor Core</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-slate-50 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
