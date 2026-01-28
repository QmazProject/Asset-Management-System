

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { X, Info, FilePlus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const InfoTooltip = ({ text }: { text: string }) => (
    <div className="group relative flex items-center">
        <Info className="w-4 h-4 text-gray-400 fill-gray-600 cursor-help" />
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-2 bg-gray-900 text-white text-xs rounded shadow-lg z-50 text-center font-normal normal-case">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
    </div>
);

export const AddServiceTemplate = () => {
    const navigate = useNavigate();

    // State for service frequency inputs
    const [serviceType, setServiceType] = useState('Recurrent');
    const [basedOn, setBasedOn] = useState('Period');
    const [unitOfMeasurement, setUnitOfMeasurement] = useState('Days');
    const [frequencyNumber, setFrequencyNumber] = useState('');
    const [notificationNumber, setNotificationNumber] = useState(10);
    const [notificationUnit, setNotificationUnit] = useState('Days');
    const [numberError, setNumberError] = useState('');

    // Notification mode: 'automatic' or 'manual'
    const [notificationMode, setNotificationMode] = useState('automatic');
    const [manualNotificationNumber, setManualNotificationNumber] = useState('10');
    const [manualNotificationUnit, setManualNotificationUnit] = useState('Days');

    // State for general form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isCritical, setIsCritical] = useState(false);

    // State for files
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // File handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            setFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleComplete = async () => {
        try {
            setIsSubmitting(true);

            // Validation
            if (!name.trim()) {
                alert('Please fill in the required fields (Name)');
                setIsSubmitting(false);
                return;
            }

            if (serviceType === 'Recurrent' && !frequencyNumber) {
                alert('Please fill in the required fields (Number in Service frequency)');
                setIsSubmitting(false);
                return;
            }

            if (notificationMode === 'manual' && !manualNotificationNumber) {
                alert('Please fill in the required fields (Number in Notifications)');
                setIsSubmitting(false);
                return;
                if (notificationMode === 'manual' && !manualNotificationNumber) {
                    alert('Please fill in the required fields (Number in Notifications)');
                    setIsSubmitting(false);
                    return;
                }

            }

            // Check for duplicate Name only
            const { data: existing, error: checkError } = await supabase
                .from('service_templates')
                .select('id')
                .eq('name', name.trim()) // Check trimmed name
                // .eq('description', description) // Future: Un-comment to check description as well
                .limit(1);

            if (checkError) throw checkError;

            if (existing && existing.length > 0) {
                alert('A service template with this name already exists.');
                setIsSubmitting(false);
                return;
            }

            // 1. Insert Service Template
            const { data: templateData, error: templateError } = await supabase
                .from('service_templates')
                .insert({
                    name,
                    description,
                    is_critical: isCritical,
                    service_type: serviceType,
                    based_on: basedOn,
                    unit_of_measurement: basedOn === 'Period' ? unitOfMeasurement : null,
                    frequency_number: serviceType === 'Recurrent' && frequencyNumber ? parseInt(frequencyNumber) : null,
                    notification_mode: notificationMode,
                    notification_number: notificationMode === 'automatic' ? notificationNumber : parseInt(manualNotificationNumber),
                    notification_unit: notificationMode === 'automatic' ? notificationUnit : manualNotificationUnit
                })
                .select()
                .single();

            if (templateError) throw templateError;

            // 2. Upload Files and Insert Attachments
            if (files.length > 0 && templateData) {
                for (const file of files) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${Math.random()}.${fileExt}`;
                    const filePath = `${templateData.id}/${fileName}`;

                    // Upload to Storage
                    const { error: uploadError } = await supabase.storage
                        .from('service-attachments')
                        .upload(filePath, file);

                    if (uploadError) throw uploadError;

                    // Insert Attachment Record
                    const { error: attachmentError } = await supabase
                        .from('service_template_attachments')
                        .insert({
                            template_id: templateData.id,
                            file_name: file.name,
                            file_path: filePath,
                            file_type: file.type,
                            file_size: file.size
                        });

                    if (attachmentError) throw attachmentError;
                }
            }

            // Success
            navigate('/administration/service-templates');

        } catch (error: any) {
            console.error('Error creating service template:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validate and calculate notification number based on frequency inputs
    useEffect(() => {
        if (basedOn === 'Period') {
            setNotificationUnit('Days'); // Always show Days for all units

            // Handle "One time service" case
            if (serviceType === 'One time service') {
                setNotificationNumber(10);
                setNumberError(''); // Clear any errors
                return; // Skip other logic
            }

            const num = parseInt(frequencyNumber);

            // Validation: check for invalid input
            if (frequencyNumber !== '') {
                // Check if input contains decimal, negative, or non-numeric characters
                if (frequencyNumber.includes('.') || frequencyNumber.includes('-') || isNaN(num) || num <= 0) {
                    setNumberError('Special characters are not allowed and Please enter a number greater than 0');
                    setNotificationNumber(10); // Set to default on error
                    return;
                } else {
                    setNumberError(''); // Clear error if valid
                }
            } else {
                setNumberError(''); // Clear error when empty
            }

            if (unitOfMeasurement === 'Days') {
                if (!isNaN(num)) {
                    if (num >= 1 && num <= 9) {
                        setNotificationNumber(num); // 1-9 reflects the input
                    } else {
                        setNotificationNumber(10); // 10+ defaults to 10
                    }
                } else {
                    setNotificationNumber(10);
                }
            } else if (unitOfMeasurement === 'Weeks') {
                if (!isNaN(num)) {
                    if (num >= 1 && num <= 4) {
                        setNotificationNumber(num * 7); // 1 week = 7 days, 2 = 14, 3 = 21, 4 = 28
                    } else {
                        setNotificationNumber(30); // 5+ weeks defaults to 30
                    }
                } else {
                    setNotificationNumber(10);
                }
            } else if (unitOfMeasurement === 'Months') {
                if (!isNaN(num) && frequencyNumber !== '') {
                    setNotificationNumber(30); // Any input = 30 days
                } else {
                    setNotificationNumber(10); // No input = 10 days default
                }
            } else if (unitOfMeasurement === 'Years') {
                if (!isNaN(num) && frequencyNumber !== '') {
                    setNotificationNumber(30); // Any input = 30 days
                } else {
                    setNotificationNumber(10); // No input = 10 days default
                }
            }
        } else if (basedOn === 'Distance (Heavy equipment only)') {
            setNotificationUnit('Kilometers');

            if (serviceType === 'One time service') {
                setNotificationNumber(250);
                setNumberError('');
            } else if (serviceType === 'Recurrent') {
                // Recurrent Distance logic
                const num = parseInt(frequencyNumber);

                if (frequencyNumber !== '') {
                    // Validation for Distance
                    if (frequencyNumber.includes('.') || frequencyNumber.includes('-') || isNaN(num) || num <= 0) {
                        setNumberError('Special characters are not allowed and Please enter a number greater than 0');
                        setNotificationNumber(250);
                        return;
                    } else if (num > 250) {
                        setNumberError('Value cannot exceed 250');
                        setNotificationNumber(250);
                        return;
                    } else {
                        setNumberError('');
                        setNotificationNumber(num);
                    }
                } else {
                    setNumberError('');
                    setNotificationNumber(250); // Default to 250
                }
            }
        } else if (basedOn === 'Engine hours (Heavy equipment only)') {
            setNotificationUnit('Hours');

            if (serviceType === 'One time service') {
                setNotificationNumber(150);
                setNumberError('');
            } else if (serviceType === 'Recurrent') {
                // Recurrent Engine hours logic
                const num = parseInt(frequencyNumber);

                if (frequencyNumber !== '') {
                    // Validation for Engine hours
                    if (frequencyNumber.includes('.') || frequencyNumber.includes('-') || isNaN(num) || num <= 0) {
                        setNumberError('Special characters are not allowed and Please enter a number greater than 0');
                        setNotificationNumber(150);
                        return;
                    } else if (num > 150) {
                        setNumberError('Value cannot exceed 150');
                        setNotificationNumber(150);
                        return;
                    } else {
                        setNumberError('');
                        setNotificationNumber(num);
                    }
                } else {
                    setNumberError('');
                    setNotificationNumber(150); // Default to 150
                }
            }
        }
    }, [basedOn, unitOfMeasurement, frequencyNumber, serviceType]);

    return (
        <div className="h-screen overflow-hidden bg-gray-100 flex flex-col">
            {/* Header - Full Width, White */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-center">
                <div className="w-full max-w-5xl flex items-center justify-between">
                    <h1 className="text-sm font-bold text-gray-900">
                        Create service template
                    </h1>

                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main Content - Scrollable */}
            <div className="flex-1 p-8 flex flex-col items-center gap-4 overflow-y-auto">

                {/* Content Card 1 - Service details */}
                <div className="w-full max-w-5xl bg-white shadow-sm border border-gray-200 rounded-sm h-fit flex-shrink-0">
                    <div className="p-8">
                        <h2 className="text-sm font-bold text-gray-700 mb-6">Service details</h2>

                        {/* Name and Description Row */}
                        <div className="grid grid-cols-2 gap-8 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex. Service name"
                                    className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500 placeholder-gray-400"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex. Summary about the service"
                                    className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500 placeholder-gray-400"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Critical Radio Section */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-gray-500">Is this service template critical?</span>
                                <InfoTooltip text="Marking a service as critical helps prioritize it in the system." />
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer w-fit">
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="isCritical"
                                            className="peer w-4 h-4 text-gray-600 border-gray-300 focus:ring-black"
                                            checked={isCritical === false}
                                            onChange={() => setIsCritical(false)}
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600">No</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer w-fit">
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="isCritical"
                                            checked={isCritical === true}
                                            onChange={() => setIsCritical(true)}
                                            className="peer w-4 h-4 text-gray-600 border-gray-300 focus:ring-black"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600">Yes</span>
                                </label>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Content Card 2 - Service frequency */}
                <div className="w-full max-w-5xl bg-white shadow-sm border border-gray-200 rounded-sm h-fit flex-shrink-0">
                    <div className="p-8">
                        <h2 className="text-sm font-bold text-gray-700 mb-6">Service frequency</h2>

                        {/* Service Type */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-gray-500">Service type</span>
                                <InfoTooltip text="Choose whether this service happens once or repeats periodically." />
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer w-fit">
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="serviceType"
                                            value="One time service"
                                            checked={serviceType === 'One time service'}
                                            onChange={(e) => setServiceType(e.target.value)}
                                            className="peer w-4 h-4 text-gray-600 border-gray-300 focus:ring-black"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600">One time service</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer w-fit">
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="serviceType"
                                            value="Recurrent"
                                            checked={serviceType === 'Recurrent'}
                                            onChange={(e) => setServiceType(e.target.value)}
                                            className="peer w-4 h-4 text-gray-600 border-gray-300 focus:ring-black"
                                        />
                                    </div>
                                    <span className="text-sm text-gray-600">Recurrent</span>
                                </label>
                            </div>
                        </div>


                        {/* Based On - Always shown */}
                        <div className="mb-6 w-1/2 pr-4">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                Based on <span className="text-red-500">*</span>
                            </label>
                            <select
                                className="w-full border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500"
                                value={basedOn}
                                onChange={(e) => setBasedOn(e.target.value)}
                            >
                                <option>Period</option>
                                <option>Distance (Heavy equipment only)</option>
                                <option>Engine hours (Heavy equipment only)</option>
                            </select>
                        </div>

                        {/* Number - Only show for Recurrent */}
                        {serviceType === 'Recurrent' && (
                            <div className={basedOn === 'Period' ? 'grid grid-cols-2 gap-8' : 'w-1/2 pr-4'}>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Ex. 10"
                                            value={frequencyNumber}
                                            onChange={(e) => setFrequencyNumber(e.target.value)}
                                            className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500 placeholder-gray-400"
                                        />
                                        {(basedOn === 'Distance (Heavy equipment only)' || basedOn === 'Engine hours (Heavy equipment only)') && (
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                                                {basedOn === 'Distance (Heavy equipment only)' ? 'Kilometers' : 'Hours'}
                                            </span>
                                        )}
                                    </div>
                                    {numberError && (
                                        <p className="text-xs text-red-500 mt-1">{numberError}</p>
                                    )}
                                </div>

                                {/* Unit of measurement - Only show when Based on = Period */}
                                {basedOn === 'Period' && (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">
                                            Unit of measurement <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500"
                                            value={unitOfMeasurement}
                                            onChange={(e) => setUnitOfMeasurement(e.target.value)}
                                        >
                                            <option>Days</option>
                                            <option>Weeks</option>
                                            <option>Months</option>
                                            <option>Years</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

                {/* Content Card 3 - Notifications */}
                <div className="w-full max-w-5xl bg-white shadow-sm border border-gray-200 rounded-sm h-fit flex-shrink-0">
                    <div className="p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <h2 className="text-sm font-bold text-gray-700">Notifications</h2>
                            <InfoTooltip text="Set up advance notifications for upcoming service dates." />
                        </div>

                        {/* Mode Selection */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-gray-500">Notification mode</span>
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="notificationMode"
                                        value="automatic"
                                        checked={notificationMode === 'automatic'}
                                        onChange={(e) => setNotificationMode(e.target.value)}
                                        className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-black"
                                    />
                                    <span className="text-sm text-gray-600">Automatic</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="notificationMode"
                                        value="manual"
                                        checked={notificationMode === 'manual'}
                                        onChange={(e) => setNotificationMode(e.target.value)}
                                        className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-black"
                                    />
                                    <span className="text-sm text-gray-600">Manual</span>
                                </label>
                            </div>
                        </div>

                        {/* Automatic Mode - Display Only */}
                        {notificationMode === 'automatic' && (
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Number
                                    </label>
                                    <div className="text-sm font-medium text-gray-900">{notificationNumber}</div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Unit of measurement
                                    </label>
                                    <div className="text-sm font-bold text-gray-900">{notificationUnit}</div>
                                </div>
                            </div>
                        )}

                        {/* Manual Mode - Editable Fields */}
                        {notificationMode === 'manual' && (
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex. 10"
                                        value={manualNotificationNumber}
                                        onChange={(e) => setManualNotificationNumber(e.target.value)}
                                        className="w-full border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500 placeholder-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">
                                        Unit of measurement <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-500"
                                        value={manualNotificationUnit}
                                        onChange={(e) => setManualNotificationUnit(e.target.value)}
                                    >
                                        <option>Days</option>
                                        <option>Weeks</option>
                                        <option>Months</option>
                                        <option>Years</option>
                                        <option>Kilometers</option>
                                        <option>Hours</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Card 4 - Attachments */}
                <div className="w-full max-w-5xl bg-white shadow-sm border border-gray-200 rounded-sm h-fit flex-shrink-0">
                    <div className="p-8">
                        <h2 className="text-sm font-bold text-gray-700 mb-4">Attachments</h2>

                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            Add attachment(s)
                        </label>

                        <div
                            className="border-2 border-dashed border-gray-300 rounded-sm p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors relative"
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={handleFileChange}
                                multiple
                            />
                            <div className="mb-4">
                                <FilePlus className="w-12 h-12 text-gray-400" />
                            </div>
                            <span className="text-sm font-bold text-gray-700 mb-1">
                                {files.length > 0
                                    ? `${files.length} file(s) selected: ${files.map(f => f.name).join(', ')}`
                                    : 'Drag and drop file here or Click to browse'}
                            </span>
                            <span className="text-xs text-gray-500">20MB maximum file size, .pdf, .docx, .rtf, .odt, .xlsx, .txt, .png, .jpg, .jpeg, .bmp files only.</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Footer - Fixed at bottom */}
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-center">
                <div className="w-full max-w-5xl flex justify-end">
                    <button
                        className="bg-red-700 hover:bg-red-800 text-white text-sm font-medium px-6 py-2 rounded-sm transition-colors flex items-center gap-2"
                        onClick={handleComplete}
                        disabled={isSubmitting}
                    >
                        {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Complete
                    </button>
                </div>
            </div>
        </div>
    );
};
