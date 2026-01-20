import { X, Plus, Info, FilePlus } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface AddAssetPageProps {
    onClose: (shouldRefresh?: boolean) => void
}

import { supabase } from '../lib/supabase'

export const AddAssetPage = ({ onClose }: AddAssetPageProps) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [currentStep, setCurrentStep] = useState(location.state?.returnFromManageServices ? 2 : 1)

    // Check for restored state from ManageServicePage
    const restoredData = location.state?.returnFromManageServices ? location.state.assetData : null
    const assignedServices = location.state?.returnFromManageServices ? location.state.assignedServices : []



    // State for Multi-Image and File Support
    interface AssetFile {
        id: string
        file?: File
        url?: string
        name: string
        size?: number
        type: 'image' | 'document'
        isMain?: boolean // Only for images
        isExisting?: boolean
    }

    const [images, setImages] = useState<AssetFile[]>(location.state?.images || [])
    const [docs, setDocs] = useState<AssetFile[]>(location.state?.docs || [])
    const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<string[]>(location.state?.deletedAttachmentIds || [])


    const [isUploading, setIsUploading] = useState(false)



    const [formData, setFormData] = useState(restoredData || {
        scanCode: '',
        inventoryNumber: '',
        serialNumber: '',
        csNumber: '',
        plateNumber: '',
        engineNumber: '',
        // Asset Details
        manufacturer: '',
        model: '',
        assetName: '',
        condition: '',
        availability: '',
        assetGroup: 'Ungrouped',
        description: '',
        label: '',
        // Step 2 Fields
        currentLocationType: 'Location',
        currentLocation: '',
        responsibleEmployee: '',
        owner: '',
        // Ownership Details
        ownershipType: 'Owned',
        vendor: '',
        purchaseDate: '',
        costCode: '',
        purchaseOrderNumber: '',
        purchasePrice: '',
        purchaseCurrency: 'Philippine Peso',
        warrantyExpirationDate: '',
        replacementCost: '',
        notes: ''
    })
    const [errors, setErrors] = useState({
        scanCode: false,
        inventoryNumber: false,
        currentLocation: false,
        responsibleEmployee: false,
        owner: false,
        ownershipType: false
    })
    const [errorMessages, setErrorMessages] = useState({
        scanCode: '',
        inventoryNumber: ''
    })

    const [isDirty, setIsDirty] = useState(false)
    const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
    // assetImage removed


    // Clear existing image if new one is selected
    const handleImageSelect = (files: File[]) => {
        if (!files.length) return

        // Calculate how many we can add
        const remainingSlots = 5 - images.length
        const toAdd = files.slice(0, remainingSlots)

        const newImages: AssetFile[] = toAdd.map(file => ({
            id: `new-${Date.now()}-${Math.random()}`,
            file: file,
            name: file.name,
            size: file.size,
            type: 'image',
            isMain: images.length === 0 // First one added is main if list was empty
        }))

        if (newImages.length > 0) {
            setImages(prev => [...prev, ...newImages])
            setIsDirty(true)
        }
    }

    const handleDocsSelect = (files: File[]) => {
        if (!files.length) return

        const remainingSlots = 5 - docs.length
        const toAdd = files.slice(0, remainingSlots)

        const newDocs: AssetFile[] = toAdd.map(file => ({
            id: `new-doc-${Date.now()}-${Math.random()}`,
            file: file,
            name: file.name,
            size: file.size,
            type: 'document'
        }))

        if (newDocs.length > 0) {
            setDocs(prev => [...prev, ...newDocs])
            setIsDirty(true)
        }
    }

    const handleRemoveImage = (index: number) => {
        setImages(prev => {
            const copy = [...prev]
            const removed = copy.splice(index, 1)[0]

            // If we removed a persisted item, track it
            if (removed.isExisting && removed.id !== 'main-image') {
                setDeletedAttachmentIds(ids => [...ids, removed.id])
            }
            // If main image was removed (id 'main-image' or just isMain)
            // Ideally we don't delete the main image record until save, but for UI we just remove it from list.
            // If it was the main image from DB (asset.image_url), we effectively want to set image_url to null or new image.

            // Re-assign main flag if needed
            if (removed.isMain && copy.length > 0) {
                copy[0].isMain = true
            }
            return copy
        })
        setIsDirty(true)
    }

    const handleRemoveDoc = (index: number) => {
        setDocs(prev => {
            const copy = [...prev]
            const removed = copy.splice(index, 1)[0]
            if (removed.isExisting) {
                setDeletedAttachmentIds(ids => [...ids, removed.id])
            }
            return copy
        })
        setIsDirty(true)
    }

    const handleInputChange = (field: string, value: string | boolean) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }))
        if (!isDirty) setIsDirty(true)

        // Clear error when user types
        if (typeof value === 'string' && value.trim() !== '') {
            setErrors((prev: any) => ({ ...prev, [field]: false }))
            // Clear custom error messages for scan code and inventory number
            if (field === 'scanCode' || field === 'inventoryNumber') {
                setErrorMessages((prev) => ({ ...prev, [field]: '' }))
            }
        }
    }

    const handleClose = () => {
        if (isDirty || assignedServices.length > 0) {
            setIsCloseModalOpen(true)
        } else {
            onClose()
        }
    }

    const confirmClose = () => {
        setIsCloseModalOpen(false)
        onClose()
    }

    const checkForDuplicates = async () => {
        try {
            // Check for duplicate scan code
            const { data: scanCodeData, error: scanCodeError } = await supabase
                .from('assets')
                .select('id')
                .eq('scan_code', formData.scanCode.trim())
                .limit(1)

            if (scanCodeError) throw scanCodeError

            // Check for duplicate inventory number
            const { data: inventoryData, error: inventoryError } = await supabase
                .from('assets')
                .select('id')
                .eq('inventory_number', formData.inventoryNumber.trim())
                .limit(1)

            if (inventoryError) throw inventoryError

            const hasDuplicateScanCode = scanCodeData && scanCodeData.length > 0
            const hasDuplicateInventory = inventoryData && inventoryData.length > 0

            if (hasDuplicateScanCode || hasDuplicateInventory) {
                setErrors({
                    ...errors,
                    scanCode: hasDuplicateScanCode,
                    inventoryNumber: hasDuplicateInventory
                })
                setErrorMessages({
                    scanCode: hasDuplicateScanCode ? 'This scan code already exists in the system' : '',
                    inventoryNumber: hasDuplicateInventory ? 'This inventory number already exists in the system' : ''
                })
                return false
            }

            return true
        } catch (error) {
            console.error('Error checking for duplicates:', error)
            alert('Error validating asset data. Please try again.')
            return false
        }
    }

    const validateStep1 = async () => {
        const newErrors = {
            ...errors,
            scanCode: formData.scanCode.trim() === '',
            inventoryNumber: formData.inventoryNumber.trim() === ''
        }
        setErrors(newErrors)

        // If basic validation fails, don't check for duplicates
        if (newErrors.scanCode || newErrors.inventoryNumber) {
            return false
        }

        // Check for duplicates in database
        return await checkForDuplicates()
    }

    const validateStep2 = () => {
        const newErrors = {
            ...errors,
            currentLocation: formData.currentLocation.trim() === '',
            responsibleEmployee: formData.responsibleEmployee.trim() === '',
            owner: formData.owner.trim() === ''
        }
        setErrors(newErrors)
        return !newErrors.currentLocation && !newErrors.responsibleEmployee && !newErrors.owner
    }

    const handleNext = async () => {
        if (currentStep === 1) {
            if (await validateStep1()) {
                setCurrentStep(2)
            }
        } else if (currentStep === 2) {
            if (validateStep2()) {
                // Submit to Supabase
                try {
                    setIsUploading(true)

                    let assetId

                    // Insert new asset
                    const { data: assetDataResponse, error: assetError } = await supabase
                        .from('assets')
                        .insert([{
                            scan_code: formData.scanCode,
                            inventory_number: formData.inventoryNumber,
                            serial_number: formData.serialNumber,
                            cs_number: formData.csNumber,
                            plate_number: formData.plateNumber,
                            engine_number: formData.engineNumber,
                            manufacturer: formData.manufacturer,
                            model: formData.model,
                            asset_name: formData.assetName,
                            condition: formData.condition,
                            availability: formData.availability,
                            asset_group: formData.assetGroup,
                            description: formData.description,
                            label: formData.label,
                            current_location_type: formData.currentLocationType,
                            current_location: formData.currentLocation,
                            responsible_employee: formData.responsibleEmployee,
                            owner: formData.owner,
                            ownership_type: formData.ownershipType,
                            vendor: formData.vendor,
                            purchase_date: formData.purchaseDate,
                            cost_code: formData.costCode,
                            purchase_order_number: formData.purchaseOrderNumber,
                            purchase_price: formData.purchasePrice,
                            purchase_currency: formData.purchaseCurrency,
                            warranty_expiration_date: formData.warrantyExpirationDate,
                            replacement_cost: formData.replacementCost,
                            notes: formData.notes
                        }])
                        .select()
                        .single()

                    if (assetError) throw assetError
                    assetId = assetDataResponse.id


                    // 1.5. Handle Images (Main + Gallery)
                    // Logic:
                    // 1. Identify valid Main Image (index 0)
                    // 2. Identify Gallery Images (index > 0)
                    // 3. Handle Deletions

                    // A. Process Deletions First (Attachments)
                    if (deletedAttachmentIds.length > 0) {
                        const { error: deleteError } = await supabase
                            .from('asset_attachments')
                            .delete()
                            .in('id', deletedAttachmentIds)

                        if (deleteError) console.error('Error deleting attachments:', deleteError)
                    }

                    // B. Process Main Image
                    // If images[0] exists, it's the main image.
                    let mainImageUrl: string | null = null

                    if (images.length > 0) {
                        const mainImg = images[0]

                        if (mainImg.file) {
                            // Upload new main image
                            // Use a consistent naming convention that doesn't conflict easily
                            const imageFileName = `${assetId}/main-image-${Date.now()}-${mainImg.name}`
                            const { error: imageUploadError } = await supabase.storage
                                .from('asset-attachments')
                                .upload(imageFileName, mainImg.file)

                            if (!imageUploadError) {
                                const { data: imageUrlData } = supabase.storage
                                    .from('asset-attachments')
                                    .getPublicUrl(imageFileName)
                                mainImageUrl = imageUrlData.publicUrl
                            }
                        } else if (mainImg.url) {
                            // Keep existing URL
                            mainImageUrl = mainImg.url
                        }
                    }

                    // Update asset with new Main Image URL (or null if all removed)
                    await supabase
                        .from('assets')
                        .update({ image_url: mainImageUrl })
                        .eq('id', assetId)


                    // C. Process Gallery Images (Index 1+)
                    const galleryImages = images.slice(1)
                    if (galleryImages.length > 0) {
                        for (const img of galleryImages) {
                            if (img.file) {
                                // Upload new gallery image
                                const fileName = `${assetId}/gallery-${Date.now()}-${img.name}`
                                const { error: uploadError } = await supabase.storage
                                    .from('asset-attachments')
                                    .upload(fileName, img.file)

                                if (!uploadError) {
                                    const { data: publicUrlData } = supabase.storage
                                        .from('asset-attachments')
                                        .getPublicUrl(fileName)

                                    await supabase.from('asset_attachments').insert([{
                                        asset_id: assetId,
                                        file_name: img.name,
                                        file_path: publicUrlData.publicUrl, // Store Public URL for consistency
                                        file_type: img.file.type || 'image/jpeg',
                                        file_size: img.size
                                    }])
                                }
                            } else if (img.isExisting && img.id === 'main-image') {
                                // THIS WAS PREVIOUSLY MAIN IMAGE, NOW DEMOTED TO ATTACHMENT
                                // We need to "move" it conceptually. Since we don't have the file, 
                                // we just create an attachment record pointing to the same URL.
                                await supabase.from('asset_attachments').insert([{
                                    asset_id: assetId,
                                    file_name: img.name,
                                    file_path: img.url,
                                    file_type: 'image/jpeg', // Best guess
                                    file_size: 0 // Unknown
                                }])
                            }
                            // Existing attachments stay as is (unless deleted via deletedAttachmentIds)
                        }
                    }


                    // 2. Handle Services
                    // For new assets, simply insert the assigned services



                    if (assignedServices.length > 0) {
                        const servicesToInsert = assignedServices.map((service: any) => ({
                            asset_id: assetId,
                            service_name: service.service,
                            category: service.category,
                            next_service_date: service.date,
                            status: service.status || 'Pending'
                        }))
                        const { error: serviceError } = await supabase
                            .from('asset_services')
                            .insert(servicesToInsert)

                        if (serviceError) throw serviceError
                    }

                    // 3. Document Attachments
                    if (docs.length > 0) {
                        for (const doc of docs) {
                            if (doc.file) {
                                const fileName = `${assetId}/doc-${Date.now()}-${doc.name}`
                                const { error: uploadError } = await supabase.storage
                                    .from('asset-attachments')
                                    .upload(fileName, doc.file)

                                if (uploadError) {
                                    console.error('Upload error:', uploadError)
                                    continue
                                }

                                const { data: publicUrlData } = supabase.storage
                                    .from('asset-attachments')
                                    .getPublicUrl(fileName)

                                await supabase.from('asset_attachments').insert([{
                                    asset_id: assetId,
                                    file_name: doc.name,
                                    file_path: publicUrlData.publicUrl,
                                    file_type: doc.file.type || 'application/octet-stream',
                                    file_size: doc.size
                                }])
                            }
                        }
                    }

                    console.log('Asset saved successfully!')
                    // Close the form and trigger a refresh of the dashboard list
                    // Passing 'true' tells the parent component (Dashboard) to re-fetch the assets
                    onClose(true)
                } catch (error: any) {
                    console.error('Error saving asset:', error)
                    alert(`Failed to save asset: ${error.message || JSON.stringify(error)}`)
                } finally {
                    setIsUploading(false)
                }
            }
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Title and Close Button */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-lime-100 rounded-lg">
                                <Plus className="w-6 h-6 text-lime-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                                Add new asset
                            </h1>
                        </div>
                        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center gap-8 py-4">
                        {/* Step 1 */}
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded border-2 flex items-center justify-center font-bold ${currentStep === 1
                                ? 'border-lime-600 text-lime-600'
                                : 'border-gray-300 text-gray-500'
                                }`}>
                                1
                            </div>
                            <span className={`font-bold ${currentStep === 1 ? 'text-lime-600' : 'text-gray-400'
                                }`}>
                                Enter asset details
                            </span>
                        </div>

                        {/* Step 2 */}
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded border-2 flex items-center justify-center font-bold ${currentStep === 2
                                ? 'border-lime-600 text-lime-600'
                                : 'border-gray-300 text-gray-500'
                                }`}>
                                2
                            </div>
                            <span className={`font-bold ${currentStep === 2 ? 'text-lime-600' : 'text-gray-400'
                                }`}>
                                Enter additional information
                            </span>

                        </div>
                    </div>
                </div>


                {/* Red underline aligned with content container */}
                {currentStep === 1 && (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="h-1 bg-lime-600 w-1/2"></div>
                    </div>
                )}
                {currentStep === 2 && (
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="h-1 bg-lime-600 w-full"></div>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-8">
                            {/* Identification Details Section */}
                            <h2 className="text-base font-semibold text-gray-900 mb-6">Identification details</h2>

                            <div className="space-y-5">
                                {/* Row 1: Scan Code and Inventory Number */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">
                                            Scan code <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.scanCode}
                                            onChange={(e) => handleInputChange('scanCode', e.target.value)}
                                            placeholder="EX. 123 456 789"
                                            className={`w-full px-3 py-2 border rounded text-sm text-gray-900 focus:outline-none focus:ring-2 ${errors.scanCode
                                                ? 'border-red-600 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-lime-600'
                                                }`}
                                        />
                                        {errors.scanCode && (
                                            <p className="text-red-600 text-xs mt-1">
                                                {errorMessages.scanCode || 'Please enter scan code'}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">
                                            Inventory Number/Body Number <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.inventoryNumber}
                                            onChange={(e) => handleInputChange('inventoryNumber', e.target.value)}
                                            placeholder="EX. 123456"
                                            className={`w-full px-3 py-2 border rounded text-sm text-gray-900 focus:outline-none focus:ring-2 ${errors.inventoryNumber
                                                ? 'border-red-600 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-lime-600'
                                                }`}
                                        />
                                        {errors.inventoryNumber && (
                                            <p className="text-red-600 text-xs mt-1">
                                                {errorMessages.inventoryNumber || 'Please enter inventory number'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Row 2: CS Number and Plate Number */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">CS Number</label>
                                        <input
                                            type="text"
                                            value={formData.csNumber}
                                            onChange={(e) => handleInputChange('csNumber', e.target.value)}
                                            placeholder="EX. CS123"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Plate Number</label>
                                        <input
                                            type="text"
                                            value={formData.plateNumber}
                                            onChange={(e) => handleInputChange('plateNumber', e.target.value)}
                                            placeholder="EX. ABC 1234"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Serial/Chasis Number and Engine Number */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">
                                            Serial/Chasis Number
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.serialNumber}
                                            onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                                            placeholder="EX. 123456"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">
                                            Engine Number
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.engineNumber}
                                            onChange={(e) => handleInputChange('engineNumber', e.target.value)}
                                            placeholder="EX. 123456"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Asset Details Section - Separate Card */}
                        <div className="bg-white rounded-lg shadow p-8">
                            <h2 className="text-base font-bold text-gray-900 mb-6">Asset details</h2>

                            <div className="space-y-6">
                                {/* Manufacturer and Model */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Manufacturer</label>
                                        <input
                                            type="text"
                                            list="manufacturers"
                                            placeholder="Type or select..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                            value={formData.manufacturer}
                                            onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                                        />
                                        <datalist id="manufacturers">
                                            <option value="Acer" />
                                            <option value="Lenovo" />
                                            <option value="HP" />
                                            <option value="Brother" />
                                            <option value="Komatsu" />
                                            <option value="Toyota" />
                                            <option value="Mitsubishi" />
                                            <option value="Nissan" />
                                        </datalist>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Model</label>
                                        <input
                                            type="text"
                                            placeholder="Ex. Model 123"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                            value={formData.model}
                                            onChange={(e) => handleInputChange('model', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        placeholder="EX. Rotary Hammers T1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                        value={formData.assetName}
                                        onChange={(e) => handleInputChange('assetName', e.target.value)}
                                    />
                                </div>

                                {/* Asset Image Upload */}
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Asset image</label>
                                    <input
                                        type="file"
                                        ref={(input) => {
                                            if (input) {
                                                (window as any).assetImageInput = input
                                            }
                                        }}
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                handleImageSelect(Array.from(e.target.files))
                                            }
                                        }}
                                        accept=".jpg,.gif,.bmp,.png,.jpeg"
                                        className="hidden"
                                        multiple
                                    />
                                    <div className="space-y-4">
                                        <input
                                            type="file"
                                            ref={(input) => {
                                                if (input) {
                                                    (window as any).assetImageInput = input
                                                }
                                            }}
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    handleImageSelect(Array.from(e.target.files))
                                                }
                                            }}
                                            accept=".jpg,.gif,.bmp,.png,.jpeg"
                                            className="hidden"
                                            multiple
                                        />
                                        {/* Image Dropzone */}
                                        <div
                                            onClick={() => images.length < 5 && (window as any).assetImageInput?.click()}
                                            className={`border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer ${images.length >= 5 ? 'opacity-50 pointer-events-none' : ''}`}
                                        >
                                            {images.length >= 5 ? (
                                                <div className="flex flex-col items-center">
                                                    <p className="text-sm text-gray-500">Maximum 5 images reached</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="relative mb-3">
                                                        <img src="/add image icon.png" alt="Add asset" className="w-16 h-16 object-contain" />
                                                    </div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {images.length >= 5 ? 'Maximum 5 images reached' : 'Drag and drop images here or Click to browse'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">20MB max per file. Up to 5 images. .jpg, .png, .jpeg only.</p>
                                                </>
                                            )}
                                        </div>

                                        {/* Image Grid */}
                                        {images.length > 0 && (
                                            <div className="grid grid-cols-5 gap-4">
                                                {images.map((img, index) => (
                                                    <div key={img.id || index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                        <img
                                                            src={img.url ? img.url : (img.file ? URL.createObjectURL(img.file) : '')}
                                                            alt={img.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {/* Main Image Label */}
                                                        {index === 0 && (
                                                            <div className="absolute top-0 left-0 w-full bg-lime-600 text-white text-[10px] font-bold py-1 text-center">
                                                                MAIN IMAGE
                                                            </div>
                                                        )}
                                                        {/* Delete Button */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleRemoveImage(index)
                                                            }}
                                                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Condition and Availability */}
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Condition Label */}
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Condition</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 appearance-none bg-gray-200"
                                                value={formData.condition}
                                                onChange={(e) => handleInputChange('condition', e.target.value)}
                                            >
                                                <option value="">Select Condition</option>
                                                <option value="Operational">Operational</option>
                                                <option value="Broken">Broken</option>
                                                <option value="In Repair">In Repair</option>
                                            </select>

                                            {formData.condition && (
                                                <button
                                                    onClick={() => handleInputChange('condition', '')}
                                                    className="absolute inset-y-0 right-8 flex items-center"
                                                    type="button"
                                                >
                                                    <div className="bg-gray-400 rounded-full p-0.5 hover:bg-gray-500 transition-colors">
                                                        <X className="w-3 h-3 text-white" />
                                                    </div>
                                                </button>
                                            )}

                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Availability */}
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Availability</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 appearance-none bg-gray-200"
                                                value={formData.availability}
                                                onChange={(e) => handleInputChange('availability', e.target.value)}
                                            >
                                                <option value="">Select Availability</option>
                                                <option value="Assigned">Assigned</option>
                                                <option value="In Transit">In Transit</option>
                                                <option value="Available/Free">Available/Free</option>
                                            </select>

                                            {formData.availability && (
                                                <button
                                                    onClick={() => handleInputChange('availability', '')}
                                                    className="absolute inset-y-0 right-8 flex items-center"
                                                    type="button"
                                                >
                                                    <div className="bg-gray-400 rounded-full p-0.5 hover:bg-gray-500 transition-colors">
                                                        <X className="w-3 h-3 text-white" />
                                                    </div>
                                                </button>
                                            )}

                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Asset Group */}
                                <div>
                                    <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                                        Asset group
                                        <div className="group relative">
                                            <Info className="w-4 h-4 text-gray-400 fill-gray-600 cursor-help" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 text-center font-normal normal-case">
                                                Asset group is derived from the template and can be updated only for asset group value as "ungrouped".
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 appearance-none bg-white font-medium"
                                            value={formData.assetGroup}
                                            onChange={(e) => handleInputChange('assetGroup', e.target.value)}
                                        >
                                            <option value="Ungrouped">Ungrouped</option>
                                            <option>Building</option>
                                            <option>Computer and IT Equipment</option>
                                            <option>Copyrights</option>
                                            <option>Office equipment</option>
                                            <option>Office furniture and fixtures</option>
                                            <option>Goodwill</option>
                                            <option>Heavy Equipment</option>
                                            <option>Laboratory Equipment</option>
                                            <option>Land</option>
                                            <option>Machinery and Equipment</option>
                                            <option>Medical Equipment</option>
                                            <option>Minor Tools and Equipment</option>
                                            <option>Office Equipment and Furniture</option>
                                            <option>Patents</option>
                                            <option>Software and Licenses</option>
                                            <option>Surveying Equipment</option>
                                            <option>Trucks</option>
                                            <option>Service Vehicles</option>

                                        </select>
                                        {formData.assetGroup !== 'Ungrouped' && (
                                            <button
                                                onClick={() => handleInputChange('assetGroup', 'Ungrouped')}
                                                className="absolute inset-y-0 right-8 flex items-center"
                                                type="button"
                                            >
                                                <div className="bg-gray-400 rounded-full p-0.5 hover:bg-gray-500 transition-colors">
                                                    <X className="w-3 h-3 text-white" />
                                                </div>
                                            </button>
                                        )}
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm text-gray-700 mb-2">Description</label>
                                    <textarea
                                        placeholder="Please enter the description"
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 resize-none"
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                    />
                                </div>

                                {/* Classification */}
                                <div>
                                    <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                                        Classification
                                        <div className="group relative">
                                            <Info className="w-4 h-4 text-gray-400 fill-gray-600 cursor-help" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 text-center font-normal normal-case">
                                                Choose in the Classification , Using this Drop Down.
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        </div>
                                    </label>
                                    {/* Classification Dropdown - User selects from predefined list */}
                                    <div className="relative">
                                        <select
                                            // Using standard select styling matching other fields
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 appearance-none bg-white"
                                            value={formData.label}
                                            onChange={(e) => handleInputChange('label', e.target.value)}
                                        >
                                            <option value="">Select Classification</option>
                                            {/* Classification Options */}
                                            <option value="Asphalt Distributor">Asphalt Distributor</option>
                                            <option value="Asphalt Paver">Asphalt Paver</option>
                                            <option value="Backhoe">Backhoe</option>
                                            <option value="Backhoe Truck">Backhoe Truck</option>
                                            <option value="Bobcat">Bobcat</option>
                                            <option value="Bulk Truck">Bulk Truck</option>
                                            <option value="Bucket Truck">Bucket Truck</option>
                                            <option value="Bulldozer">Bulldozer</option>
                                            <option value="Close Van Truck">Close Van Truck</option>
                                            <option value="Concrete Paver">Concrete Paver</option>
                                            <option value="Crane">Crane</option>
                                            <option value="Drill Rig">Drill Rig</option>
                                            <option value="Dump Truck">Dump Truck</option>
                                            <option value="Equipment">Equipment</option>
                                            <option value="Flat Truck">Flat Truck</option>
                                            <option value="Forklift">Forklift</option>
                                            <option value="Forward Truck">Forward Truck</option>
                                            <option value="Fuel Tanker Truck">Fuel Tanker Truck</option>
                                            <option value="Man Lift">Man Lift</option>
                                            <option value="Marker Truck">Marker Truck</option>
                                            <option value="Milling Machine">Milling Machine</option>
                                            <option value="Mini Dump Truck">Mini Dump Truck</option>
                                            <option value="Mobile Crusher">Mobile Crusher</option>
                                            <option value="Pay Loader">Pay Loader</option>
                                            <option value="PC200">PC200</option>
                                            <option value="PC210">PC210</option>
                                            <option value="PC70">PC70</option>
                                            <option value="Power Tools">Power Tools</option>
                                            <option value="Prime Mover">Prime Mover</option>
                                            <option value="Pumpcrete Truck">Pumpcrete Truck</option>
                                            <option value="Reefer Van Truck">Reefer Van Truck</option>
                                            <option value="Road Grader">Road Grader</option>
                                            <option value="Road Roller">Road Roller</option>
                                            <option value="Self Loading">Self Loading</option>
                                            <option value="Service Class A">Service Class A</option>
                                            <option value="Service Class B">Service Class B</option>
                                            <option value="Service Motorcycle">Service Motorcycle</option>
                                            <option value="Sweeper Truck">Sweeper Truck</option>
                                            <option value="Trailer">Trailer</option>
                                            <option value="Transit Mixer">Transit Mixer</option>
                                            <option value="Van Truck">Van Truck</option>
                                            <option value="Water Tanker Truck">Water Tanker Truck</option>
                                            <option value="Wheel Type Backhoe">Wheel Type Backhoe</option>
                                            <option value="Wing Van Truck">Wing Van Truck</option>
                                        </select>

                                        {formData.label && (
                                            <button
                                                onClick={() => handleInputChange('label', '')}
                                                className="absolute inset-y-0 right-8 flex items-center"
                                                type="button"
                                            >
                                                <div className="bg-gray-400 rounded-full p-0.5 hover:bg-gray-500 transition-colors">
                                                    <X className="w-3 h-3 text-white" />
                                                </div>
                                            </button>
                                        )}

                                        {/* Chevron Icon for Dropdown */}
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">


                        {/* Section 2: Assign to (Current location) */}
                        <div className="bg-white rounded-lg shadow p-8">
                            <h2 className="text-base font-bold text-gray-900 mb-6">Assign to (Current location)</h2>

                            <div className="space-y-6">


                                {/* Current Location */}
                                <div className="w-1/2 pr-3">
                                    <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                                        Current location <span className="text-red-500">*</span>
                                        <div className="group relative inline-block">
                                            <Info className="w-4 h-4 text-gray-400 fill-gray-600 cursor-help" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 text-center font-normal normal-case">
                                                Current location of the asset
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <select
                                            className={`w-full px-3 py-2 border rounded text-sm text-gray-900 focus:outline-none focus:ring-2 appearance-none bg-white ${errors.currentLocation
                                                ? 'border-red-600 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-lime-600'
                                                }`}
                                            value={formData.currentLocation}
                                            onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                                        >
                                            <option value="" disabled selected>Type or select...</option>
                                            <option value="Site A">Site A</option>
                                            <option value="Site B">Site B</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Employee details */}
                        <div className="bg-white rounded-lg shadow p-8">
                            <h2 className="text-base font-bold text-gray-900 mb-6">Employee details</h2>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                                        Responsible employee <span className="text-red-500">*</span>
                                        {/* This is the new tooltip block */}
                                        <div className="group relative inline-block">
                                            <Info className="w-4 h-4 text-gray-400 fill-gray-600 cursor-help" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 text-center font-normal normal-case">
                                                The employee responsible for this asset
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <select
                                            className={`w-full px-3 py-2 border rounded text-sm text-gray-900 focus:outline-none focus:ring-2 appearance-none bg-white ${errors.responsibleEmployee
                                                ? 'border-red-600 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-lime-600'
                                                }`}
                                            value={formData.responsibleEmployee}
                                            onChange={(e) => handleInputChange('responsibleEmployee', e.target.value)}
                                        >
                                            <option value="" disabled selected>Type or select...</option>
                                            <option value="Employee 1">Employee 1</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.responsibleEmployee && (
                                        <p className="text-red-600 text-xs mt-1">Please select a responsible employee</p>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center gap-1 text-sm text-gray-700 mb-2">
                                        Owner <span className="text-red-500">*</span>
                                        {/* This is the new tooltip block */}
                                        <div className="group relative inline-block">
                                            <Info className="w-4 h-4 text-gray-400 fill-gray-600 cursor-help" />
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 text-center font-normal normal-case">
                                                The worker who is in general responsible for the asset.
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                            </div>
                                        </div>
                                    </label>
                                    <div className="relative">
                                        <select
                                            className={`w-full px-3 py-2 border rounded text-sm text-gray-900 focus:outline-none focus:ring-2 appearance-none bg-white ${errors.owner
                                                ? 'border-red-600 focus:ring-red-500'
                                                : 'border-gray-300 focus:ring-lime-600'
                                                }`}
                                            value={formData.owner}
                                            onChange={(e) => handleInputChange('owner', e.target.value)}
                                        >
                                            <option value="" disabled selected>Type or select...</option>
                                            <option value="Owner 1">Owner 1</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                    {errors.owner && (
                                        <p className="text-red-600 text-xs mt-1">Please select an owner</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 4: Ownership details */}
                        <div className="bg-white rounded-lg shadow p-8">
                            <h2 className="text-base font-bold text-gray-900 mb-6">Ownership details</h2>

                            <div className="space-y-6">
                                {/* Row 1: Ownership type | Vendor */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">
                                            Ownership type <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                className={`w-full px-3 py-2 border rounded text-sm text-gray-900 focus:outline-none focus:ring-2 appearance-none bg-white ${errors.ownershipType
                                                    ? 'border-red-600 focus:ring-red-500'
                                                    : 'border-gray-300 focus:ring-lime-600'
                                                    }`}
                                                value={formData.ownershipType}
                                                onChange={(e) => handleInputChange('ownershipType', e.target.value)}
                                            >
                                                <option value="" disabled selected>Type or select...</option>
                                                <option value="Owned">Owned</option>
                                                <option value="Leased">Leased</option>
                                                <option value="Rented">Rented</option>
                                                <option value="Rented">Fleet</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        {errors.ownershipType && (
                                            <p className="text-red-600 text-xs mt-1">Please select an ownership type</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Vendor</label>
                                        <input
                                            type="text"
                                            placeholder="Ex. ABC AG"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                            value={formData.vendor}
                                            onChange={(e) => handleInputChange('vendor', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Row 2: Purchase date | Purchase order number */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Purchase date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                                value={formData.purchaseDate}
                                                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Purchase order number</label>
                                        <input
                                            type="text"
                                            placeholder="EX. ABC90001"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                            value={formData.purchaseOrderNumber}
                                            onChange={(e) => handleInputChange('purchaseOrderNumber', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Row 3: Cost code | Purchase price */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Cost code</label>
                                        <input
                                            type="text"
                                            placeholder="EX. CCH01"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                            value={formData.costCode}
                                            onChange={(e) => handleInputChange('costCode', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Purchase price</label>
                                        <input
                                            type="number"
                                            placeholder="Ex. 100"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                            value={formData.purchasePrice}
                                            onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Row 4: Replacement cost | Warranty expiration date */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Replacement cost</label>
                                        <input
                                            type="number"
                                            placeholder="EX. 120"
                                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                            value={formData.replacementCost}
                                            onChange={(e) => handleInputChange('replacementCost', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-700 mb-2">Warranty expiration date</label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600"
                                                value={formData.warrantyExpirationDate}
                                                onChange={(e) => handleInputChange('warrantyExpirationDate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* Section 5: Services */}
                        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-gray-900 flex items-center">
                                    Services
                                    {assignedServices.length > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-lime-100 text-lime-700 text-xs font-bold rounded-full">
                                            {assignedServices.length}
                                        </span>
                                    )}
                                </h2>
                                {/* This is the new tooltip block */}
                                <div className="group relative inline-block">
                                    <Info className="w-4 h-4 text-gray-400 fill-gray-600 cursor-help" />
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 text-center font-normal normal-case">
                                        Manage services that are associated with this asset.
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                </div>
                            </div>
                            <div className="group relative inline-block">
                                <button
                                    onClick={() => navigate('/manage-services', {
                                        state: {
                                            assetData: formData,
                                            assignedServices: assignedServices,
                                            // Pass persistence data for add mode
                                            isEditMode: false,
                                            // Pass images and docs
                                            images: images,
                                            docs: docs,
                                            deletedAttachmentIds: deletedAttachmentIds
                                        }
                                    })}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded text-sm hover:bg-gray-300 transition-colors"
                                >
                                    Manage services
                                </button>
                                <div className="absolute top-full right-0 mt-2 hidden group-hover:block w-96 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 text-center font-normal normal-case">
                                    Manage services that are associated with this asset. Services being added via an associated asset template can be managed on the asset directly after the add asset screens.
                                    <div className="absolute bottom-full right-8 border-4 border-transparent border-b-gray-900"></div>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Attachments */}
                        <div className="bg-white rounded-lg shadow p-8">
                            <h2 className="text-base font-bold text-gray-900 mb-6">Attachments</h2>

                            <div>
                                <label className="block text-sm text-gray-700 mb-2">Add attachment(s) (Max 5)</label>
                                <div
                                    className={`border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer ${docs.length >= 5 ? 'opacity-50 pointer-events-none' : ''}`}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        multiple
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                handleDocsSelect(Array.from(e.target.files))
                                            }
                                        }}
                                        accept=".pdf,.docx,.rtf,.odt,.xlsx,.txt"
                                    />
                                    <div className="relative mb-3">
                                        <div className="bg-gray-600 p-2 rounded">
                                            <FilePlus className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {docs.length >= 5
                                            ? 'Maximum 5 files reached'
                                            : 'Drag and drop file here or Click to browse'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">20MB maximum file size, .pdf, .docx, .rtf, .odt, .xlsx, .txt only.</p>

                                    {/* Docs List */}
                                    {docs.length > 0 && (
                                        <div className="mt-4 w-full text-left">
                                            <div className="space-y-2">
                                                {docs.map((doc, index) => (
                                                    <div key={doc.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                                                        <div className="flex items-center gap-2 truncate">
                                                            <FilePlus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                            <span className="text-sm text-gray-700 truncate">{doc.name}</span>
                                                            <span className="text-xs text-gray-400">({doc.isExisting ? 'Existing' : 'New'})</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleRemoveDoc(index)
                                                            }}
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section 7: Notes */}
                        <div className="bg-white rounded-lg shadow p-8">
                            <h2 className="text-base font-bold text-gray-900 mb-6">Notes</h2>

                            <div>
                                <textarea
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-lime-600 resize-none h-32"
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>

            {/* Fixed Footer with Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
                <div className="max-w-4xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Back Button */}
                    <div>
                        {currentStep > 1 && (
                            <button
                                onClick={handleBack}
                                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
                            >
                                Back to previous step
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={isUploading}
                        className={`px-8 py-2.5 bg-lime-600 text-white font-medium rounded hover:bg-lime-700 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isUploading ? 'Saving...' : (currentStep === 1 ? 'Next' : 'Complete')}
                    </button>
                </div>

                {/* Unsaved Changes Modal */}
                {isCloseModalOpen && (
                    <div className="fixed inset-0 z-[60] overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsCloseModalOpen(false)}></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                                            <Info className="h-6 w-6 text-yellow-600" aria-hidden="true" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">Unsaved Changes</h3>
                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    You have unsaved changes. Leaving this page will discard these changes. Are you sure you want to leave?
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="button"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={confirmClose}
                                    >
                                        Leave & Discard
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        onClick={() => setIsCloseModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
