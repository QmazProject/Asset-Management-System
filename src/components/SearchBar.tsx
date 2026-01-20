import { Search, ChevronDown, SlidersHorizontal } from 'lucide-react'

interface SearchBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export const SearchBar = ({ searchQuery, onSearchChange }: SearchBarProps) => {
    return (
        <div className="bg-gray-200 border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                {/* Search and Filters Row */}
                <div className="flex items-center gap-3">
                    {/* Search Input */}
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search assets"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Filter Buttons */}
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700">
                        Locations
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700">
                        Asset group
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700">
                        Label
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700">
                        Default location
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700">
                        Default location type
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700">
                        Status
                        <ChevronDown className="w-4 h-4" />
                    </button>

                    {/* More Filters Button */}
                    <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm text-gray-700">
                        <SlidersHorizontal className="w-4 h-4" />
                        More filters
                    </button>
                </div>
            </div>
        </div>
    )
}
