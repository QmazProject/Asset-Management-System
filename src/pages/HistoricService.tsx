import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'

export const HistoricService = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const { assetId, assetData } = location.state || {}

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [service, setService] = useState('')
    const [status, setStatus] = useState('Historic')
    const [scheduledDate, setScheduledDate] = useState('')
    const [completionDate, setCompletionDate] = useState('')
    const [serviceResult, setServiceResult] = useState('Passed')
    const [cost, setCost] = useState('')
    const [currency, setCurrency] = useState('Philippine Peso')
    const [provider, setProvider] = useState('')
    const [notes, setNotes] = useState('')

    // Service Templates
    const [templates, setTemplates] = useState<any[]>([])

    useEffect(() => {
        const fetchTemplates = async () => {
            const { data } = await supabase
                .from('service_templates')
                .select(`
                    *,
                    service_template_attachments (count)
                `)
                .order('name')

            if (data) {
                // Remove duplicates if any
                const uniqueTemplates = Array.from(new Map(data.map(item => [item['name'], item])).values());
                setTemplates(uniqueTemplates);
            }
        }
        fetchTemplates()
    }, [])

    const handleAssign = async () => {
        if (!service || !scheduledDate || !completionDate || !serviceResult) return

        setIsSubmitting(true)
        try {
            const serviceData = {
                id: `temp-${Date.now()}`,
                asset_id: assetId,
                service_name: service,
                category: 'Historic',
                status: 'Completed',
                next_service_date: scheduledDate,
                completion_date: completionDate,
                provider: provider,
                cost: cost ? parseFloat(cost) : null,
                currency: currency,
                notes: notes,
                service_result: serviceResult
            }

            if (assetId) {
                const { error } = await supabase
                    .from('asset_services')
                    .insert([serviceData])

                if (error) throw error
            }

            navigate('/manage-services', {
                state: {
                    ...location.state,
                    refresh: !!assetId,
                    newService: !assetId ? serviceData : null
                }
            })
        } catch (error) {
            console.error('Error assigning service:', error)
            alert('Failed to assign service. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!assetData && !assetId) {
        return <div className="p-4">Error: No asset data found.</div>
    }

    // Find selected template details
    const selectedTemplate = templates.find(t => t.name === service)
    const frequencyDisplay = selectedTemplate ? `${selectedTemplate.frequency_number || 1} ${selectedTemplate.unit_of_measurement || 'Years'}` : ''
    const attCount = selectedTemplate?.service_template_attachments?.[0]?.count || 0

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <h1 className="text-xl font-bold text-gray-900">Assign Historic Service</h1>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">

                {/* Service Details Card */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Service details</h3>

                    <div className="space-y-6">
                        {/* Service Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service <span className="text-red-500">*</span></label>
                            <select
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm text-gray-900"
                                value={service}
                                onChange={(e) => setService(e.target.value)}
                            >
                                <option value="" disabled>Type or select...</option>
                                {templates.map(t => (
                                    <option key={t.id} value={t.name}>{t.name}</option>
                                ))}
                            </select>
                            {selectedTemplate && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-600 space-y-1 border border-gray-100">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-700">Frequency:</span>
                                        <span>Every {frequencyDisplay}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-700">Attachments:</span>
                                        <span>{attCount > 0 ? `${attCount} Attachment${attCount > 1 ? 's' : ''}` : 'No attachments'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Status (Radio) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status <span className="text-red-500">*</span></label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Upcoming"
                                        checked={status === 'Upcoming'}
                                        onChange={() => {
                                            setStatus('Upcoming')
                                            navigate('/assign-upcoming-service', { state: location.state })
                                        }}
                                        className="focus:ring-lime-500 h-4 w-4 text-lime-600 border-gray-300"
                                    />
                                    <span className="ml-3 block text-sm font-medium text-gray-700">Upcoming services</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="Historic"
                                        checked={status === 'Historic'}
                                        onChange={() => setStatus('Historic')}
                                        className="focus:ring-lime-500 h-4 w-4 text-lime-600 border-gray-300"
                                    />
                                    <span className="ml-3 block text-sm font-medium text-gray-700">Historic services</span>
                                </label>
                            </div>
                        </div>

                        {/* Dates Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm text-gray-900"
                                    value={scheduledDate}
                                    onChange={(e) => setScheduledDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Completion date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm text-gray-900"
                                    value={completionDate}
                                    onChange={(e) => setCompletionDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Service Result */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service result <span className="text-red-500">*</span></label>
                            <select
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm text-gray-900"
                                value={serviceResult}
                                onChange={(e) => setServiceResult(e.target.value)}
                            >
                                <option value="Passed">Passed</option>
                                <option value="Failed">Failed</option>
                                <option value="In Progress">In Progress</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Other Details Card */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-6">Other details</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                            <input
                                type="number"
                                placeholder="Ex. 100"
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm text-gray-900"
                                value={cost}
                                onChange={(e) => setCost(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cost currency</label>
                            <select
                                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm text-gray-900"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                <option value="Philippine Peso">Philippine Peso</option>
                                <option value="USD">USD</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                        <input
                            type="text"
                            placeholder="Enter provider"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm text-gray-900"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                        />
                    </div>
                </div>

                {/* Attachments Card - Placeholder for now as file upload logic is complex */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                            Drag and drop file here or Click to browse
                        </span>
                        <p className="mt-1 text-xs text-gray-500">
                            20MB maximum file size, .pdf, .docx, .rtf, .odt, .xlsx, .txt, .png, .jpg, .jpeg, .bmp files only.
                        </p>
                    </div>
                </div>

                {/* Additional Information Card */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Additional information</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm text-gray-900"
                            rows={3}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex justify-end">
                    <button
                        onClick={handleAssign}
                        disabled={isSubmitting || !service || !scheduledDate || !completionDate}
                        className="px-6 py-2 bg-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-400 disabled:opacity-50 transition-colors"
                    >
                        {isSubmitting ? 'Saving...' : 'Assign'}
                    </button>
                    {/* Note: The user screenshot shows 'Assign' button at bottom right, styled distinctly. I'm placing it here. */}
                </div>
            </div>
        </div>
    )
}
