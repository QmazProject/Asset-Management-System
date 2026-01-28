import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, MapPin, Barcode, FileText, Info, ChevronDown, X, Wrench, Pencil, ClipboardCheck, ArrowUpDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Define the interface for the asset data passed via state
interface AssetData {
    scanCode: string
    inventoryNumber: string
    csNumber: string
    plateNumber: string
    serialNumber: string
    engineNumber: string
    manufacturer: string
    model: string
    assetName: string
    status: string
    assetGroup: string
    description: string
    label: string
    currentLocation: string
    responsibleEmployee: string
    owner: string
    ownershipType: string
    vendor: string
    purchaseDate: string
    purchaseOrderNumber: string
    costCode: string
    purchasePrice: string
    replacementCost: string
    warrantyExpirationDate: string
    notes: string
}

const TextTooltip = ({
    text,
    position = 'bottom',
    align = 'center',
    children
}: {
    text: string;
    position?: 'top' | 'bottom';
    align?: 'center' | 'left';
    children: React.ReactNode
}) => (
    <div className="group/tooltip relative w-fit">
        {children}
        <div className={`absolute ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'} ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} hidden group-hover/tooltip:block whitespace-nowrap z-50`}>
            <div className="bg-black text-white text-xs px-2 py-1 rounded shadow-lg relative">
                {text}
                <div className={`absolute ${align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-4'} border-4 border-transparent ${position === 'top' ? 'top-full border-t-black' : 'bottom-full border-b-black'}`}></div>
            </div>
        </div>
    </div>
);

export const ManageServicePage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const assetData = location.state?.assetData as AssetData
    // We expect assetId to be passed in state, or we try to derive it/fail gracefully
    const assetId = location.state?.assetId

    const [loading, setLoading] = useState(true)

    // Initialize services from state logic
    const [services, setServices] = useState<any[]>(() => {
        const initial = location.state?.assignedServices || []
        if (location.state?.newService) {
            return [...initial, location.state.newService]
        }
        return initial
    })

    const [templateMap, setTemplateMap] = useState<Record<string, any>>({})

    // Selection state for services (only one at a time)
    const [selectedService, setSelectedService] = useState<string | null>(null)

    // ... filtering state ...
    const [filterType, setFilterType] = useState<'Historic' | 'Upcoming'>(!assetId ? 'Upcoming' : 'Historic')

    // Fetch services from Supabase
    const fetchServices = async () => {
        if (!assetId) return
        setLoading(true)
        try {
            // Parallel fetch: Services and Templates
            const [servicesResult, templatesResult] = await Promise.all([
                supabase
                    .from('asset_services')
                    .select('*')
                    .eq('asset_id', assetId)
                    .order('next_service_date', { ascending: true }),
                supabase
                    .from('service_templates')
                    .select('name, description, service_type, frequency_number, unit_of_measurement, based_on, service_template_attachments (count)')
            ])

            if (servicesResult.error) throw servicesResult.error
            if (templatesResult.error) throw templatesResult.error

            setServices(servicesResult.data || [])

            // Build Template Map
            const map: Record<string, any> = {}
            if (templatesResult.data) {
                templatesResult.data.forEach((t: any) => {
                    map[t.name] = {
                        description: t.description || '',
                        frequency: t.service_type === 'Recurrent'
                            ? `Every ${t.frequency_number || '?'} ${t.unit_of_measurement || t.based_on?.split(' ')[0]}`
                            : 'One time service',
                        attachmentCount: t.service_template_attachments?.[0]?.count || 0
                    }
                })
            }
            setTemplateMap(map)

        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (assetId) {
            fetchServices()
        } else {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [assetId, location.state?.refresh])

    // ... delete logic ...
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    const handleDelete = async () => {
        if (!selectedService) return

        // If no assetId (local mode), just remove from state
        if (!assetId) {
            setServices(services.filter(s => s.id !== selectedService))
            setSelectedService(null)
            setIsDeleteModalOpen(false)
            return
        }

        try {
            const { error } = await supabase
                .from('asset_services')
                .delete()
                .eq('id', selectedService)

            if (error) throw error

            setServices(services.filter(s => s.id !== selectedService))
            setSelectedService(null)
            setIsDeleteModalOpen(false)
        } catch (error) {
            console.error('Error deleting service:', error)
            alert('Failed to delete service')
        }
    }

    const handleRowClick = (serviceId: string) => {
        // Toggle selection: if clicking the same row, deselect it
        if (selectedService === serviceId) {
            setSelectedService(null)
        } else {
            setSelectedService(serviceId)
        }
    }

    // Filter displayed services
    const displayedServices = services.filter(s => s.category === filterType)

    const handleAssignClick = () => {
        const targetRoute = filterType === 'Historic' ? '/assign-historic-service' : '/assign-upcoming-service'
        navigate(targetRoute, {
            state: {
                ...location.state, // Pass through all previous state (images, docs, etc)
                assetData,
                assetId,
                assignedServices: services // Pass current list so we can maintain it
            }
        })
    }

    const handleBack = () => {
        if (assetId) {
            navigate('/dashboard')
        } else {
            // Return to AddAsset flow
            navigate('/dashboard', {
                state: {
                    ...location.state,
                    returnFromManageServices: true,
                    assignedServices: services
                }
            })
        }
    }

    if (!assetData && !assetId) {
        // ... Error view ...
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">No Asset Data Found</h2>
                    <p className="text-gray-600 mb-4">Please access this page through the Add Asset form or Dashboard.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-lime-600 text-white rounded hover:bg-lime-700 transition-colors"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">Manage Services</h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Asset Details Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden">
                                <img
                                    src="/Drill Icon.png"
                                    alt="Asset Icon"
                                    className="w-16 h-16 object-contain"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement?.classList.add('bg-lime-50');
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-500">Manufacturer / Model</p>
                                <div className="font-semibold text-gray-900">
                                    {assetData.manufacturer || '-'}
                                    {assetData.model && <span className="text-gray-500 mx-1">/</span>}
                                    {assetData.model}
                                </div>
                                <div className="text-sm text-lime-700 font-medium bg-lime-50 inline-block px-2 py-0.5 rounded">
                                    {assetData.assetName || '-'}
                                </div>
                            </div>

                            {/* Column 2: Location */}
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Current Location</p>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                                    <span className="text-gray-900 font-medium">{assetData.currentLocation || '-'}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">{assetData.responsibleEmployee || '-'}</span>
                                </div>
                            </div>

                            {/* Column 3: Codes */}
                            <div className="space-y-3">
                                <div>
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-0.5">
                                        <Barcode className="w-4 h-4" />
                                        Scan Code
                                    </div>
                                    <div className="font-family-mono font-semibold text-gray-900">{assetData.scanCode || '-'}</div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 mb-0.5">
                                        <FileText className="w-4 h-4" />
                                        Inventory #
                                    </div>
                                    <div className="font-family-mono font-semibold text-gray-900">{assetData.inventoryNumber || '-'}</div>
                                </div>
                            </div>

                            {/* Column 4: Status */}
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                                    ${assetData.status === 'Operational' ? 'bg-green-100 text-green-800' : ''}
                                    ${assetData.status === 'Broken' ? 'bg-red-100 text-red-800' : ''}
                                    ${assetData.status === 'In Repair' ? 'bg-yellow-100 text-yellow-800' : ''}
                                    ${!['Operational', 'Broken', 'In Repair'].includes(assetData.status) ? 'bg-gray-100 text-gray-800' : ''}
                                `}>
                                    {assetData.status || '-'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Upcoming Services - Dark Active State */}
                        <div className="relative">
                            <button
                                onClick={() => setFilterType('Upcoming')}
                                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm
                                    ${filterType === 'Upcoming' ? 'bg-gray-800 text-white border border-gray-800' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                            >
                                Upcoming services
                                <ChevronDown className={`w-4 h-4 ${filterType === 'Upcoming' ? 'text-gray-300' : 'text-gray-500'}`} />
                            </button>
                        </div>

                        {/* Historic Services for switching */}
                        <div className="relative">
                            <button
                                onClick={() => setFilterType('Historic')}
                                className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors shadow-sm
                                    ${filterType === 'Historic' ? 'bg-gray-800 text-white border border-gray-800' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}
                            >
                                Historic services
                                <ChevronDown className={`w-4 h-4 ${filterType === 'Historic' ? 'text-gray-300' : 'text-gray-500'}`} />
                            </button>
                        </div>

                        {/* Other Filters (Visual Only for now based on mockup) */}
                        <div className="relative">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded shadow-sm hover:bg-gray-50 transition-colors">
                                Frequency
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <div className="relative">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded shadow-sm hover:bg-gray-50 transition-colors">
                                Attachments
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                        <div className="relative">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded shadow-sm hover:bg-gray-50 transition-colors">
                                Schedule date
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-4">
                    {loading ? (
                        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
                            Loading services...
                        </div>
                    ) : displayedServices.length === 0 ? (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="flex flex-col items-center justify-center p-12 text-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <img src="/tools icon.png" alt="Tools" className="w-8 h-8 object-contain opacity-60" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {filterType === 'Historic' ? 'No historic services found.' : 'No upcoming services found.'}
                                </h3>
                                <button
                                    className="flex items-center gap-2 px-4 py-2 bg-lime-600 text-white font-medium rounded-lg hover:bg-lime-700 transition-colors shadow-sm"
                                    onClick={handleAssignClick}
                                >
                                    <span className="text-lg leading-none">+</span>
                                    Assign
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            {/* Action Toolbar */}
                            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                                <div className="text-base font-bold text-gray-800">
                                    {displayedServices.length} {displayedServices.length === 1 ? 'Service' : 'Services'}
                                </div>

                                <div className="flex items-center gap-2">
                                    {/* Assign Button */}
                                    <button
                                        onClick={handleAssignClick}
                                        className="flex flex-col items-center gap-1 group px-3"
                                    >
                                        <Wrench className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                                        <span className="text-[10px] text-gray-500 group-hover:text-gray-900 font-medium">Assign</span>
                                    </button>

                                    {/* Edit Button */}
                                    <button
                                        disabled={!selectedService}
                                        className={`flex flex-col items-center gap-1 group px-3 ${!selectedService ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                    // Add edit logic here later
                                    >
                                        <Pencil className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                                        <span className="text-[10px] text-gray-500 group-hover:text-gray-900 font-medium">Edit</span>
                                    </button>

                                    {/* Complete Button */}
                                    <button
                                        disabled={!selectedService}
                                        className={`flex flex-col items-center gap-1 group px-3 ${!selectedService ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                    // Add complete logic here later
                                    >
                                        <ClipboardCheck className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                                        <span className="text-[10px] text-gray-500 group-hover:text-gray-900 font-medium">Complete</span>
                                    </button>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => {
                                            if (selectedService) {
                                                setIsDeleteModalOpen(true)
                                            }
                                        }}
                                        disabled={!selectedService}
                                        className={`flex flex-col items-center gap-1 group px-3 ${!selectedService ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <X className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                                        <span className="text-[10px] text-gray-500 group-hover:text-red-600 font-medium">Remove</span>
                                    </button>
                                </div>

                                <button className="flex flex-col items-center gap-1 group px-3">
                                    <ArrowUpDown className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                                    <span className="text-[10px] text-gray-500 group-hover:text-gray-900 font-medium">Sort</span>
                                </button>
                            </div>

                            {/* List View */}
                            <div className="divide-y divide-gray-100">
                                {displayedServices.map((service) => {
                                    const templateInfo = templateMap[service.service_name] || {}
                                    const frequencyDisplay = templateInfo.frequency || 'Recurrent'
                                    const attCount = templateInfo.attachmentCount || 0
                                    const descriptionDisplay = templateInfo.description || `${service.service_name} - ${service.category} service...`

                                    return (
                                        <div
                                            key={service.id}
                                            onClick={() => handleRowClick(service.id)}
                                            className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${selectedService === service.id
                                                ? 'bg-red-50 hover:bg-red-50 border-l-4 border-l-red-500 pl-[20px]'
                                                : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
                                                {/* Column 1: Date & Name */}
                                                <div className="col-span-3">
                                                    {/* Date formatting - assuming YYYY-MM-DD string */}
                                                    <TextTooltip text="Scheduled date" align="left">
                                                        <div className="text-red-500 text-sm font-medium mb-1 w-fit">
                                                            {new Date(service.next_service_date || service.scheduled_date || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </div>
                                                    </TextTooltip>
                                                    <TextTooltip text="Service name" align="left">
                                                        <div className="text-gray-900 font-bold text-base w-fit">
                                                            {service.service_name}
                                                        </div>
                                                    </TextTooltip>
                                                </div>

                                                {/* Column 2: Frequency & Attachments */}
                                                <div className="col-span-4">
                                                    <TextTooltip text="Service frequency">
                                                        <div className="text-gray-700 text-sm mb-1 w-fit">
                                                            {frequencyDisplay}
                                                        </div>
                                                    </TextTooltip>
                                                    <TextTooltip text="Attachments">
                                                        <div className="text-gray-500 text-sm w-fit">
                                                            {attCount > 0 ? `${attCount} Attachment${attCount > 1 ? 's' : ''}` : 'No attachments'}
                                                        </div>
                                                    </TextTooltip>
                                                </div>

                                                {/* Column 3: Description & Badge */}
                                                <div className="col-span-5 flex items-center justify-between">
                                                    <TextTooltip text="Service description">
                                                        <div className="text-gray-600 text-sm truncate pr-4 max-w-[250px]">
                                                            {descriptionDisplay}
                                                        </div>
                                                    </TextTooltip>

                                                    <TextTooltip text="Status">
                                                        <span className={`px-4 py-1 rounded-full text-sm font-medium whitespace-nowrap
                                                            ${(service.status === 'Completed') ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                                                         `}>
                                                            {service.status === 'Pending' ? 'Upcoming' : (service.status || 'Upcoming')}
                                                        </span>
                                                    </TextTooltip>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Footer Info */}
                            <div className="bg-gray-50 px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
                                    <div className="w-4 h-4 rounded-full bg-gray-300 text-white flex items-center justify-center text-[10px] font-bold">i</div>
                                    No more results to show.
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {
                isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsDeleteModalOpen(false)}></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <Info className="h-6 w-6 text-red-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                Remove Service
                                            </h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    Are you sure you want to remove this service? This action cannot be undone.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={handleDelete}
                                    >
                                        Remove
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setIsDeleteModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}
