import { X, ChevronRight, ChevronLeft, FileText, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface AssetDetailsPanelProps {
    asset: any;
    onClose: () => void;
}

interface Attachment {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
}

export const AssetDetailsPanel = ({ asset: propAsset, onClose }: AssetDetailsPanelProps) => {
    // 1. Internal State for Animation & Data Persistence
    const [activeAsset, setActiveAsset] = useState(propAsset);
    const [isVisible, setIsVisible] = useState(false);

    // 2. Handle Transition Logic
    useEffect(() => {
        if (propAsset) {
            // OPEN or SWITCH: Update data immediately
            setActiveAsset(propAsset);
            // Trigger slide-in animation (small delay to ensure render happens first if it was closed)
            setTimeout(() => setIsVisible(true), 10);
        } else {
            // CLOSE: Slide out, but don't clear activeAsset yet (so we see it leave)
            setIsVisible(false);
        }
    }, [propAsset]);

    // 3. Use activeAsset as the 'asset' for the rest of the component
    const asset = activeAsset;

    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [galleryImages, setGalleryImages] = useState<{ url: string; name: string }[]>([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
    const [serviceCounts, setServiceCounts] = useState({ upcoming: 0, historic: 0 });

    useEffect(() => {
        if (asset?.id) {
            const fetchServiceCounts = async () => {
                const { data } = await supabase
                    .from('asset_services')
                    .select('status')
                    .eq('asset_id', asset.id);

                if (data) {
                    // Deduplicate services before counting
                    const uniqueServices = data.reduce((acc: any[], service) => {
                        const isDuplicate = acc.some(s =>
                            s.status === service.status
                        );
                        // For service counts, we just need unique status values
                        // But we should dedupe by all properties to avoid counting duplicates
                        if (!isDuplicate) {
                            acc.push(service);
                        }
                        return acc;
                    }, []);

                    const upcoming = uniqueServices.filter(s => s.status !== 'Completed').length;
                    const historic = uniqueServices.filter(s => s.status === 'Completed').length;
                    setServiceCounts({ upcoming, historic });
                }
            };
            fetchServiceCounts();
        }
    }, [asset]);

    // 4. Track scroll position for dynamic panel positioning
    const [panelTop, setPanelTop] = useState(64); // Start at 64px (top-16)

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            if (scrollY > 64) {
                setPanelTop(0); // Slide to top edge
            } else {
                setPanelTop(64); // Return to below header
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Reset state when asset changes
    useEffect(() => {
        if (asset) {
            setAttachments([]);
            setGalleryImages([]);
            setCurrentImageIndex(0);
            fetchAttachments();
        }
    }, [asset]); // checks activeAsset

    const fetchAttachments = async () => {
        if (!asset?.id) return;

        setIsLoadingAttachments(true);
        try {
            const { data, error } = await supabase
                .from('asset_attachments')
                .select('*')
                .eq('asset_id', asset.id);

            if (error) throw error;

            if (data) {
                // Filter images and documents
                const imageAttachments = data.filter(item => item.file_type.startsWith('image/'));
                const docAttachments = data.filter(item => !item.file_type.startsWith('image/'));

                setAttachments(docAttachments);

                // Build Gallery: Main Image + Attached Images
                const images = [];
                if (asset.image_url) {
                    images.push({ url: asset.image_url, name: 'Main Image' });
                }

                imageAttachments.forEach(img => {
                    images.push({ url: img.file_path, name: img.file_name });
                });

                setGalleryImages(images);
            }
        } catch (error) {
            console.error('Error fetching attachments:', error);
        } finally {
            setIsLoadingAttachments(false);
        }
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
    };

    if (!asset) return null;

    // Helper to display value or "Not set"
    const displayValue = (val: string | null | undefined) => {
        if (val === null || val === undefined || val === '') return 'Not set';
        return val;
    };

    const currentImage = galleryImages[currentImageIndex];

    return (
        <div
            className={`fixed bottom-0 right-0 w-[480px] bg-white shadow-2xl transform transition-all duration-300 ease-in-out border-l border-t border-gray-400 z-50 flex flex-col ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ top: `${panelTop}px` }}
        >

            {/* 1. TOP HEADER: Title + Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900">Asset Details</h2>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* SCROLLABLE CONTENT AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-lime-500 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-lime-600">

                {/* 2. ASSET IMAGE GALLERY */}
                <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                    {galleryImages.length > 0 ? (
                        <>
                            <img
                                src={currentImage?.url}
                                alt={currentImage?.name}
                                className="w-full h-full object-contain bg-gray-900"
                            />

                            {/* Navigation Overlays */}
                            {galleryImages.length > 1 && (
                                <>
                                    <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                                            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                                            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                    {/* Image Counter Badge */}
                                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                        {currentImageIndex + 1} / {galleryImages.length}
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm truncate max-w-[200px]">
                                        {currentImage?.name}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50 flex-col gap-2">
                            <div className="p-3 bg-gray-100 rounded-full">
                                <FileText className="w-8 h-8 text-gray-300" />
                            </div>
                            <span className="text-sm">No image available</span>
                        </div>
                    )}
                </div>

                {/* 3. HEADER: General Information */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b-2 border-gray-200 pb-2">
                        General Information
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">Model</label>
                                <div className="text-sm font-semibold text-gray-900">{displayValue(asset.model)}</div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 font-medium block mb-1">Classification Type</label>
                                <div className="text-sm font-semibold text-gray-900">{displayValue(asset.label || 'Not set')}</div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-gray-500 font-medium block mb-1">Asset Name</label>
                            <div className="text-lg font-bold text-gray-900">{displayValue(asset.asset_name)}</div>
                        </div>

                        {/* Condition and Availability */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <label className="text-xs text-gray-500 font-medium block mb-1">Condition</label>
                                <div className={`text-sm font-semibold
                                    ${asset.condition === 'Operational' ? 'text-green-700' :
                                        asset.condition === 'Broken' ? 'text-red-700' :
                                            'text-yellow-700'}`}>
                                    {displayValue(asset.condition)}
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                <label className="text-xs text-gray-500 font-medium block mb-1">Availability</label>
                                <div className={`text-sm font-semibold
                                    ${asset.availability === 'Assigned' ? 'text-blue-700' :
                                        asset.availability === 'In Transit' ? 'text-orange-700' :
                                            'text-green-700'}`}>
                                    {displayValue(asset.availability)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. HEADER: Identification Numbers */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b-2 border-gray-200 pb-2">
                        Identification Numbers
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                        <div>
                            <label className="text-xs text-gray-500 block">Scan Code</label>
                            <div className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded inline-block mt-1">
                                {displayValue(asset.scan_code)}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Manufacturer</label>
                            <div className="text-sm text-gray-900 font-medium mt-1">{displayValue(asset.manufacturer)}</div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500 block">Inventory Number / Body Number</label>
                            <div className="text-sm text-gray-900 font-medium mt-1">{displayValue(asset.inventory_number)}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Plate Number</label>
                            <div className="text-sm text-gray-900 font-medium mt-1">{displayValue(asset.plate_number)}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">CS Number</label>
                            <div className="text-sm text-gray-900 font-medium mt-1">{displayValue(asset.cs_number)}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Serial / Chassis Number</label>
                            <div className="text-sm text-gray-900 font-medium mt-1">{displayValue(asset.serial_number)}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Engine Number</label>
                            <div className="text-sm text-gray-900 font-medium mt-1">{displayValue(asset.engine_number)}</div>
                        </div>
                    </div>
                </div>

                {/* 5. HEADER: Location & Responsibility */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b-2 border-gray-200 pb-2">
                        Location & Responsibility
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Asset Group</label>
                            <div className="text-sm text-gray-900">{displayValue(asset.asset_group)}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Description</label>
                            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-md">
                                {displayValue(asset.description)}
                            </p>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Assign to Current Location</label>
                            <div className="text-sm text-gray-900 font-medium flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-lime-500"></div>
                                {displayValue(asset.current_location)}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Responsible Employee</label>
                                <div className="text-sm text-gray-900 flex items-center gap-2">
                                    {asset.responsible_employee && (
                                        <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                                            {asset.responsible_employee.charAt(0)}
                                        </div>
                                    )}
                                    {displayValue(asset.responsible_employee)}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Owner</label>
                                <div className="text-sm text-gray-900">{displayValue(asset.owner)}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 6. HEADER: Ownership Details */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b-2 border-gray-200 pb-2">
                        Ownership Details
                    </h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                        <div>
                            <label className="text-xs text-gray-500 block">Ownership Type</label>
                            <div className="text-sm text-gray-900 mt-1">{displayValue(asset.ownership_type)}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Purchase Date</label>
                            <div className="text-sm text-gray-900 mt-1">{displayValue(asset.purchase_date)}</div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500 block">Vendor</label>
                            <div className="text-sm text-gray-900 mt-1">{displayValue(asset.vendor)}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Purchase Order No.</label>
                            <div className="text-sm text-gray-900 mt-1">{displayValue(asset.purchase_order_number)}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Cost Code</label>
                            <div className="text-sm text-gray-900 mt-1">{displayValue(asset.cost_code)}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Purchase Price</label>
                            <div className="text-sm text-gray-900 mt-1">{displayValue(asset.purchase_price)}</div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block">Replacement Cost</label>
                            <div className="text-sm text-gray-900 mt-1">{displayValue(asset.replacement_cost)}</div>
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-gray-500 block">Warranty Expiration Date</label>
                            <div className="text-sm text-gray-900 mt-1">{displayValue(asset.warranty_expiration_date)}</div>
                        </div>
                    </div>
                </div>

                {/* 7. HEADER: Services */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b-2 border-gray-200 pb-2">
                        Services
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-bold text-orange-600 mb-1">{serviceCounts.upcoming}</span>
                            <span className="text-xs font-medium text-orange-800 uppercase">Upcoming Services</span>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-bold text-gray-600 mb-1">{serviceCounts.historic}</span>
                            <span className="text-xs font-medium text-gray-500 uppercase">Historic Services</span>
                        </div>
                    </div>
                </div>

                {/* 8. HEADER: Attachments (Documents) */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b-2 border-gray-200 pb-2">
                        Attachments
                    </h3>
                    {isLoadingAttachments ? (
                        <div className="text-sm text-gray-500 flex items-center justify-center p-4">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-lime-600 mr-2"></div>
                            Loading...
                        </div>
                    ) : attachments.length > 0 ? (
                        <div className="space-y-2">
                            {attachments.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors group">
                                    <div className="flex items-center gap-3 truncate flex-1">
                                        <div className="p-2 bg-white rounded border border-gray-200">
                                            <FileText className="w-5 h-5 text-gray-500" />
                                        </div>
                                        <div className="flex flex-col truncate">
                                            <span className="text-sm font-medium text-gray-700 truncate">{doc.file_name}</span>
                                            <span className="text-[10px] text-gray-400">{(doc.file_size / 1024).toFixed(1)} KB</span>
                                        </div>
                                    </div>
                                    <a
                                        href={doc.file_path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-gray-400 hover:text-lime-600 hover:bg-lime-50 rounded transition-colors"
                                        title="View/Download"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-500 italic text-center p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                            No document attachments found.
                        </div>
                    )}
                </div>

                {/* 9. HEADER: Notes */}
                <div>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 border-b-2 border-gray-200 pb-2">
                        Notes
                    </h3>
                    <p className="text-sm text-gray-700 bg-yellow-50 p-4 rounded-md border border-yellow-100">
                        {displayValue(asset.notes)}
                    </p>
                </div>

                {/* Bottom Spacer */}
                <div className="h-10"></div>
            </div>
        </div>
    );
};
