import { HelpCircle, Bell, ShoppingCart, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface TopHeaderProps {
    userName: string
    userBranch: string
    onLogout: () => void
}

export const TopHeader = ({ userName, userBranch, onLogout }: TopHeaderProps) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])
    return (
        <header className="bg-white border-b border-black shadow-sm">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Left Side - Logo & Brand */}
                    <div className="flex items-center gap-3">
                        {/* Logo */}
                        <img
                            src="/qmaz - company logo.png"
                            

                            alt="Asset Management System"
                            className="h-14 w-14 object-contain" 
                        />
                        {/* Brand Name with Professional Font */}
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight" style={{ fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif" }}>
                            Asset Management System
                        </h1>
                    </div>

                    {/* Right Side - Menu Items */}
                    <div className="flex items-center gap-6">
                        {/* Help Link */}
                        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900">
                            <HelpCircle className="w-4 h-4" />
                            <span>Help?</span>
                        </button>

                        {/* Alerts */}
                        <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
                            <Bell className="w-4 h-4" />
                            <span>Alerts</span>
                        </button>

                        {/* Transfer Cart */}
                        <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900">
                            <ShoppingCart className="w-4 h-4" />
                            <span>Transfer cart</span>
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-2 text-sm hover:bg-gray-50 px-2 py-1 rounded"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-xs text-gray-600">👤</span>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-gray-900 font-medium leading-tight">{userName}</div>
                                        <div className="text-gray-500 text-xs leading-tight">{userBranch}</div>
                                    </div>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                                    <button
                                        onClick={() => {
                                            onLogout()
                                            setIsDropdownOpen(false)
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                            <polyline points="16 17 21 12 16 7"></polyline>
                                            <line x1="21" y1="12" x2="9" y2="12"></line>
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
