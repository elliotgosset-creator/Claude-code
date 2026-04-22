import { LayoutDashboard, BookOpen, Dumbbell, TrendingUp, User, Moon, Sun } from 'lucide-react'
import type { Tab, Theme } from '../types'

interface NavItem {
  id: Tab
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Accueil', icon: LayoutDashboard },
  { id: 'diary', label: 'Journal', icon: BookOpen },
  { id: 'workout', label: 'Sport', icon: Dumbbell },
  { id: 'progress', label: 'Progrès', icon: TrendingUp },
  { id: 'profile', label: 'Profil', icon: User },
]

interface Props {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  theme: Theme
  onToggleTheme: () => void
}

export default function Navigation({ activeTab, onTabChange, theme, onToggleTheme }: Props) {
  return (
    <>
      {/* Top header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FL</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white text-lg">FitLife</span>
          </div>
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-2xl mx-auto px-2 h-16 flex items-center justify-around">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                onClick={() => onTabChange(id)}
                className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px] ${
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className={`p-1 rounded-lg ${isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}
