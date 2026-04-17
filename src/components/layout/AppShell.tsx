import { Outlet, NavLink } from 'react-router-dom';
import { GraduationCap, FolderUp, CalendarCheck, FlameKindling, Settings2 } from 'lucide-react';

const navItems = [
  { to: '/', label: '대시보드', icon: GraduationCap, end: true },
  { to: '/upload', label: '자료 올리기', icon: FolderUp },
  { to: '/plan', label: '플랜 짜기', icon: CalendarCheck },
  { to: '/study', label: '지금 공부', icon: FlameKindling },
  { to: '/settings', label: '설정', icon: Settings2 },
];

export default function AppShell() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-exam-500 to-exam-700 rounded-2xl flex items-center justify-center shadow-md">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 text-xl tracking-tight">EXAM<span className="text-heat-500">!!</span></h1>
              <p className="text-xs text-gray-400 font-medium">교수님, 가르쳐 주세요</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-exam-50 text-exam-700 font-semibold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center font-medium">EXAM!! v1.0</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
