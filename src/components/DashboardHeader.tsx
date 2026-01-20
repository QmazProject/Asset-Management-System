import { LogOut } from 'lucide-react'
import type { UserProfile } from '../lib/supabase'

interface DashboardHeaderProps {
    profile: UserProfile
    onLogout: () => void
}

export const DashboardHeader = ({ profile, onLogout }: DashboardHeaderProps) => {
    // Get user initials for avatar fallback
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* User Info Section */}
                    <div className="flex items-center gap-4">
                        {/* User Avatar */}
                        <div className="relative">
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.full_name}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-500"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center border-2 border-primary-500">
                                    <span className="text-white text-xl font-bold">
                                        {getInitials(profile.full_name)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* User Details */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                {profile.full_name}
                            </h2>
                            <p className="text-sm text-gray-600 mt-0.5">
                                {profile.branch}
                            </p>
                        </div>
                    </div>

                    {/* Sign Out Button */}
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </header>
    )
}
