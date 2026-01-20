import { Package, MapPin, Users, FileText, LayoutDashboard, Settings, ChevronDown } from 'lucide-react'

type TabId = 'asset' | 'location' | 'employees' | 'reports' | 'dashboard' | 'administration'

interface Tab {
    id: TabId
    label: string
    icon: React.ReactNode
}

const tabs: Tab[] = [
    { id: 'asset', label: 'Asset', icon: <Package className="w-5 h-5" /> },
    { id: 'location', label: 'Location', icon: <MapPin className="w-5 h-5" /> },
    { id: 'employees', label: 'Employees', icon: <Users className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-5 h-5" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'administration', label: 'Administration', icon: <Settings className="w-5 h-5" /> },
]

interface NavigationTabsProps {
    activeTab: string
    onTabChange: (id: string) => void
    adminMenuOpen?: boolean
}

export const NavigationTabs = ({ activeTab, onTabChange, adminMenuOpen = false }: NavigationTabsProps) => {

    return (
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8">
                <nav className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`
                                flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all
                                border-b-2 -mb-px
                                ${activeTab === tab.id
                                    ? 'border-lime-600 text-lime-700 bg-white'
                                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            {tab.id === 'administration' && (
                                <ChevronDown
                                    className={`w-4 h-4 ml-1 transition-transform duration-200 ${adminMenuOpen ? 'rotate-180' : ''}`}
                                />
                            )}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    )
}
