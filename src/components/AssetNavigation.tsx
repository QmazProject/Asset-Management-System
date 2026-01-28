import { ActionToolbar } from './ActionToolbar'
import { SearchBar } from './SearchBar'
import { Loader2, ArrowUp } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

interface AssetNavigationProps {
    onActionClick: (action: string) => void
    activeAction: string | null
    assets: any[]
    isLoading: boolean
    selectedAssets: Set<string>
    setSelectedAssets: (selected: Set<string>) => void
    totalItems: number
    onAssetPreview?: (asset: any) => void
}

export const AssetNavigation = ({
    onActionClick,
    activeAction,
    assets,
    isLoading,
    selectedAssets,
    setSelectedAssets,
    totalItems,
    onAssetPreview
}: AssetNavigationProps) => {


    const [showFilters, setShowFilters] = useState(true);
    const [showBackToTop, setShowBackToTop] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterHeight, setFilterHeight] = useState(0);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateHeight = () => {
            if (searchContainerRef.current) {
                setFilterHeight(searchContainerRef.current.offsetHeight);
            }
        };

        // Initial measurement
        updateHeight();

        const observer = new ResizeObserver(updateHeight);
        if (searchContainerRef.current) {
            observer.observe(searchContainerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Filter assets based on search query
    const filteredAssets = assets.filter(asset => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
            asset.asset_name?.toLowerCase().includes(query) ||
            asset.manufacturer?.toLowerCase().includes(query) ||
            asset.model?.toLowerCase().includes(query) ||
            asset.scan_code?.toLowerCase().includes(query) ||
            asset.inventory_number?.toLowerCase().includes(query) ||
            asset.current_location?.toLowerCase().includes(query) ||
            asset.responsible_employee?.toLowerCase().includes(query)
        );
    });

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY > 300) {
                setShowFilters(false);
                setShowBackToTop(true);
            } else {
                setShowFilters(true);
                setShowBackToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };


    return (
        <>
            {/* Search Bar with Filters - Sticky initially, then slides up */}
            <div
                ref={searchContainerRef}
                className="sticky top-0 z-50 transition-transform duration-300 ease-in-out bg-white"
                style={{
                    transform: showFilters ? 'translateY(0)' : 'translateY(-100%)',
                }}
            >
                <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            </div>

            {/* Action Toolbar - Sticky adjusting to filter visibility */}
            <div
                className="sticky z-40 transition-[top] duration-300 ease-in-out"
                style={{
                    top: showFilters ? `${filterHeight}px` : '0px'
                }}
            >
                <ActionToolbar
                    onActionClick={onActionClick}
                    activeAction={activeAction}
                    totalItems={totalItems}
                    selectedCount={selectedAssets.size}
                />
            </div>

            {/* Main Content Area */}
            <main className="w-full">
                {/* Asset Table Section */}
                <div className="bg-white border-t border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {/* 
                                        TABLE HEADER DEFINITIONS 
                                        This section defines the columns that appear at the top of the asset table.
                                        Each <th> corresponds to a specific data field.
                                    */}
                                    <th scope="col" className="w-[70px] px-0 py-3 text-center sticky left-0 z-10 bg-gray-50">
                                        <div className="flex justify-center">
                                            {/* 
                                                SELECT ALL CHECKBOX 
                                                When clicked, this checks if all assets are currently selected.
                                                If so, it deselects all. If not, it selects all assets by mapping their IDs.
                                            */}
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-lime-600 focus:ring-lime-600"
                                                checked={selectedAssets.size === assets.length && assets.length > 0}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedAssets(new Set(assets.map(a => a.id)))
                                                        // When "Select All" is clicked, open the last asset in the list
                                                        if (onAssetPreview && assets.length > 0) {
                                                            onAssetPreview(assets[assets.length - 1])
                                                        }
                                                    } else {
                                                        setSelectedAssets(new Set())
                                                        // Close preview when deselecting all
                                                        if (onAssetPreview) onAssetPreview(null)
                                                    }
                                                }}
                                            />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900 w-[220px]">
                                        Manufacturer and model
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Responsible Worker Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Current Location Name
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Scan Code
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Inventory Number
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Condition
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                        Availability
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <Loader2 className="w-6 h-6 text-lime-600 animate-spin mx-auto" />
                                            <p className="text-gray-500 text-sm mt-2">Loading assets...</p>
                                        </td>
                                    </tr>
                                ) : filteredAssets.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500 text-sm">
                                            {searchQuery ? `No assets found matching "${searchQuery}"` : 'No assets found. Click "Add" to create your first asset.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssets.map((asset) => {
                                        const isSelected = selectedAssets.has(asset.id)
                                        return (
                                            /* 
                                                TABLE BODY ROW 
                                                This loops through each 'asset' item and renders a row (<tr>).
                                                The <td> cells must match the order of the header columns above.
                                            */
                                            <tr
                                                key={asset.id}
                                                /* 
                                                    ROW CLICK HANDLER 
                                                    Clicking anywhere on the row selects ONLY this asset (single selection).
                                                    It clears all other selections and highlights only the clicked row.
                                                */
                                                onClick={() => {
                                                    // Single selection: select only this asset
                                                    setSelectedAssets(new Set([asset.id]))
                                                    // Open the panel for this specific asset
                                                    if (onAssetPreview) onAssetPreview(asset)
                                                }}
                                                className={`transition-colors cursor-pointer ${isSelected ? 'bg-lime-50' : 'hover:bg-gray-50'
                                                    }`}>
                                                <td
                                                    className="w-[70px] px-0 py-4 whitespace-nowrap text-center sticky left-0 z-10 bg-inherit cursor-pointer"
                                                    onClick={(e) => {
                                                        e.stopPropagation() // Prevent row click
                                                        // Toggle checkbox selection
                                                        const newSelected = new Set(selectedAssets)
                                                        if (isSelected) {
                                                            newSelected.delete(asset.id)
                                                        } else {
                                                            newSelected.add(asset.id)
                                                            if (onAssetPreview) onAssetPreview(asset)
                                                        }
                                                        setSelectedAssets(newSelected)
                                                    }}
                                                >
                                                    <div className="flex justify-center">
                                                        {/* 
                                                            ROW CHECKBOX 
                                                            Allows multi-selection by toggling this specific row on/off.
                                                            The entire column is clickable for easier interaction.
                                                        */}
                                                        <input
                                                            type="checkbox"
                                                            className="rounded border-gray-300 text-lime-600 focus:ring-lime-600 pointer-events-none"
                                                            checked={isSelected}
                                                            readOnly
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {/* Drill Icon */}
                                                        <div className="w-8 h-8 rounded bg-blue-50 border border-blue-500 flex items-center justify-center shrink-0">
                                                            <img
                                                                src="/Drill Icon.png"
                                                                alt="Asset icon"
                                                                className="w-5 h-5 object-contain"
                                                            />
                                                        </div>
                                                        {/* Asset Image Thumbnail */}
                                                        {asset.image_url ? (
                                                            <img
                                                                src={asset.image_url}
                                                                alt={asset.name}
                                                                className="w-[64px] h-[48px] flex-shrink-0 rounded object-cover border border-green-500"
                                                            />
                                                        ) : (
                                                            <div className="w-[64px] h-[48px] flex-shrink-0 rounded bg-gray-100 flex items-center justify-center border border-green-500">
                                                                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900">{asset.manufacturer || '-'}</div>
                                                            <div className="text-sm text-gray-500">{asset.model || ''}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Name */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{asset.asset_name || '-'}</div>
                                                    <div className="text-sm text-gray-500">{asset.label || ''}</div>
                                                </td>
                                                {/* Responsible Worker Name */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{asset.responsible_employee || '-'}</div>
                                                </td>
                                                {/* Current Location Name */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{asset.current_location || '-'}</div>
                                                </td>
                                                {/* Scan Code */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{asset.scan_code || '-'}</div>
                                                </td>
                                                {/* Inventory Number */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{asset.inventory_number || '-'}</div>
                                                </td>
                                                {/* Condition */}
                                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${asset.condition === 'Operational' ? 'bg-green-100 text-green-800' :
                                                            asset.condition === 'Broken' ? 'bg-red-100 text-red-800' :
                                                                asset.condition === 'In Repair' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {asset.condition || '-'}
                                                    </span>
                                                </td>
                                                {/* Availability */}
                                                <td className="px-6 py-4 whitespace-nowrap text-left">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${asset.availability === 'Assigned' ? 'bg-blue-100 text-blue-800' :
                                                            asset.availability === 'In Transit' ? 'bg-orange-100 text-orange-800' :
                                                                asset.availability === 'Available/Free' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {asset.availability || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main >

            {/* Back to Top Button */}
            {showBackToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 bg-lime-600 hover:bg-lime-700 text-white px-6 py-3 rounded-full shadow-lg transition-all duration-300 ease-in-out hover:scale-110 flex items-center gap-2"
                    aria-label="Back to top"
                >
                    <ArrowUp className="w-5 h-5" />
                    <span className="text-sm font-medium">Back to top </span>
                </button>
            )}
        </>
    )
}
