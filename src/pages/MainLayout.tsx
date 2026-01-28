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
import { ServiceTemplates } from './Administration/ServiceTemplates'
import { AddServiceTemplate } from './Administration/AddServiceTemplate'
import { EditServiceTemplate } from './Administration/EditServiceTemplate'
import { DashboardNavigation } from '../components/DashboardNavigation'

export const MainLayout = () => {
    const { user, profile, loading, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate() // Initialize navigate
    const [assets, setAssets] = useState<any[]>([])
    const [isLoadingAssets, setIsLoadingAssets] = useState(true)
    const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
    const [previewAsset, setPreviewAsset] = useState<any | null>(null) // State for the side panel
    const [activeTab, setActiveTab] = useState(() => {
        if (location.pathname.startsWith('/administration')) {
            return 'administration'
        }
        return 'asset'
    })
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

    // Sync active tab with URL location
    useEffect(() => {
        if (location.pathname.startsWith('/administration')) {
            setActiveTab('administration')
        } else if (location.pathname === '/dashboard') {
            // Only reset to asset if we are strictly on dashboard root and activeTab was administration
            // This prevents overwriting user selection if they are toggling between Asset/Location on dashboard
            if (activeTab === 'administration') {
                setActiveTab('asset')
            }
        }
    }, [location.pathname])

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
            if (location.pathname !== '/dashboard') {
                navigate('/dashboard')
            }
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

    if (location.pathname === '/administration/service-templates/add') {
        return <AddServiceTemplate />
    }

    if (location.pathname.startsWith('/administration/service-templates/edit/')) {
        return <EditServiceTemplate />
    }


    return (
        <div className="min-h-screen bg-white">
            {/* 
                1. TOP HEADER
                This is the very top bar containing the user's name, branch, and logout button.
                It lives here so it's visible on all dashboard pages.
            */}
            {profile && (
                <TopHeader
                    userName={profile.full_name}
                    userBranch={profile.branch}
                    onLogout={handleLogout}
                />
            )}

            {/* 
                2. NAVIGATION TABS
                The main tab bar (Assets, Locations, Dashboard, Administration).
                Clicking these changes the 'activeTab' state, which switches the view below.
            */}
            <NavigationTabs
                activeTab={activeTab}
                onTabChange={handleTabChange}
                adminMenuOpen={showAdminMenu}
            />

            {/* 
                3. MAIN CONTENT AREA
                This section changes based on which tab is clicked.
                It acts like a "switch" statement for your dashboard views.
            */}
            {location.pathname === '/administration/service-templates' ? (
                // Special route for Service Templates page
                <ServiceTemplates />
            ) : activeTab === 'asset' ? (
                // VIEW A: ASSETS LIST
                // Shows the table of assets with the SearchBar and ActionToolbar
                <AssetNavigation
                    onActionClick={handleActionChange}
                    activeAction={activeAction}
                    assets={assets}
                    isLoading={isLoadingAssets}
                    selectedAssets={selectedAssets}
                    setSelectedAssets={setSelectedAssets}
                    onAssetPreview={(asset: any) => setPreviewAsset(asset)}
                    totalItems={assets.length}
                />
            ) : activeTab === 'location' ? (
                // VIEW B: LOCATION MAP/LIST
                <LocationNavigation />
            ) : activeTab === 'dashboard' ? (
                // VIEW C: MAIN DASHBOARD STATS
                <DashboardNavigation />
            ) : null}

            {/* 
                4. SIDE SASH / DETAILS PANEL
                This slides in from the right when you click on an asset row.
                It sits "outside" the main content flow (fixed position).
            */}
            <AssetDetailsPanel
                asset={previewAsset}
                onClose={() => setPreviewAsset(null)}
            />

            {/* 
                5. ADMINISTRATION MENU (OVERLAY)
                The dropdown menu that appears when you click "Administration".
                It overlays the content.
            */}
            {showAdminMenu && (
                <AdministrationNavigation onClose={() => setShowAdminMenu(false)} />
            )}
        </div >
    )
}
