import { Outlet, NavLink } from 'react-router-dom';
import { BookOpen, Upload, Calendar, Brain, Settings } from 'lucide-react';

const navItems = [
  { to: '/', label: '홈', icon: BookOpen, end: true },
  { to: '/upload', label: '자료 업로드', icon: Upload },
  { to: '/plan', label: '학습 플랜', icon: Calendar },
  { to: '/study', label: '학습하기', icon: Brain },
  { to: '/settings', label: '설정', icon: Settings },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">DeepTutor</h1>
              <p className="text-xs text-gray-500">AI 시험 대비 학습</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">DeepTutor v1.0.0</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
