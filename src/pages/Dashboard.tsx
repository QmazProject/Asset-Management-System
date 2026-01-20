import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { TopHeader } from '../components/TopHeader'
import { NavigationTabs } from '../components/NavigationTabs'

import { AddAssetPage } from './AddAssetPage'
import { EditAssetPage } from './EditAssetPage'
import { AssetNavigation } from '../components/AssetNavigation'
import { LocationNavigation } from '../components/LocationNavigation'
import { AdministrationNavigation } from '../components/AdministrationNavigation'
import { AssetDetailsPanel } from '../components/AssetDetailsPanel'

export const Dashboard = () => {
    const { user, profile, loading, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate() // Initialize navigate
    const [assets, setAssets] = useState<any[]>([])
    const [isLoadingAssets, setIsLoadingAssets] = useState(true)
    const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
    const [previewAsset, setPreviewAsset] = useState<any | null>(null) // State for the side panel
    const [activeTab, setActiveTab] = useState('asset')
    const [showAdminMenu, setShowAdminMenu] = useState(false)

    const fetchAssets = async () => {
        try {
            setIsLoadingAssets(true)
            const { data, error } = await supabase
                .from('assets')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setAssets(data || [])
        } catch (error) {
            console.error('Error fetching assets:', error)
        } finally {
            setIsLoadingAssets(false)
        }
    }

    // Only re-fetch assets if the user ID changes (e.g. login/logout), not on every user object reference update
    useEffect(() => {
        if (user?.id) {
            fetchAssets()
        }
    }, [user?.id])

    // Reload assets if returning from a successful add action
    useEffect(() => {
        if (location.state?.refresh) {
            fetchAssets()
        }
    }, [location.state])

    // Load initial state from localStorage or location state
    const [activeAction, setActiveAction] = useState<string | null>(() => {
        if (location.state?.returnFromManageServices) {
            return location.state.isEditMode ? 'edit' : 'add'
        }
        return null
    })



    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }



    const handleLogout = async () => {
        await logout()
    }

    const handleActionChange = (action: string) => {
        setActiveAction(action)
    }

    const handleCloseAction = (shouldRefresh?: boolean) => {
        setSelectedAssets(new Set()) // Clear selection when closing action
        setActiveAction(null)

        // Clear the history state to prevent re-opening if the user refreshes
        navigate(location.pathname, { replace: true, state: {} })

        if (shouldRefresh) {
            fetchAssets() // Refresh the list if an asset was added/edited
        }
    }

    const handleTabChange = (tabId: string) => {
        if (tabId === 'administration') {
            setShowAdminMenu(!showAdminMenu)
        } else {
            setActiveTab(tabId)
            setShowAdminMenu(false)
        }
    }

    // Route to EditAssetPage for edit mode
    if (activeAction === 'edit') {
        const assetToEdit = location.state?.assetId
            ? { id: location.state.assetId, image_url: location.state.existingImage }
            : assets.find(a => selectedAssets.has(a.id))

        return <EditAssetPage onClose={handleCloseAction} assetToEdit={assetToEdit} />
    }

    // Route to AddAssetPage for add mode
    if (activeAction === 'add') {
        return <AddAssetPage onClose={handleCloseAction} />
    }


    return (
        <div className="min-h-screen bg-white">
            {/* Top Utility Header */}
            {profile && (
                <TopHeader
                    userName={profile.full_name}
                    userBranch={profile.branch}
                    onLogout={handleLogout}
                />
            )}

            {/* Navigation Tabs */}
            <NavigationTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                adminMenuOpen={showAdminMenu}
            />

            {/* Main Content Area */}
            {activeTab === 'asset' && (
                // This component (AssetNavigation) receives the 'assets' list from Dashboard
                // and handles the actual display of the table columns and rows.
                <AssetNavigation
                    onActionClick={handleActionChange}
                    activeAction={activeAction}
                    assets={assets}
                    isLoading={isLoadingAssets}
                    selectedAssets={selectedAssets}
                    setSelectedAssets={setSelectedAssets}
                    onAssetPreview={(asset: any) => setPreviewAsset(asset)} // Callback when an asset is clicked/selected for preview
                    totalItems={assets.length}
                />
            )}

            {/* Asset Details Slide-out Panel */}
            {/* Asset Details Slide-out Panel */}
            <AssetDetailsPanel
                asset={previewAsset}
                onClose={() => setPreviewAsset(null)}
            />

            {activeTab === 'location' && (
                <LocationNavigation />
            )}

            {/* 
                ADMINISTRATION OVERLAY
                Rendered conditionally based on showAdminMenu state.
                It sits ON TOP of the active content (Asset/Location) because of its z-index in the component.
                We pass onClose to allow the component to close itself.
            */}
            {showAdminMenu && (
                <AdministrationNavigation onClose={() => setShowAdminMenu(false)} />
            )}
        </div >
    )
}
