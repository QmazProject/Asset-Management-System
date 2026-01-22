
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Pencil, Trash2, ArrowUpDown, ChevronDown, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const ServiceTemplates = () => {
    // State for row selection
    const [selectedTemplateId, setSelectedTemplateId] = React.useState<number | null>(null);
    const navigate = useNavigate();

    const [templates, setTemplates] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(true);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('service_templates')
                .select(`
                    *,
                    service_template_attachments (count)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log("Fetched templates:", data); // Debugging

            const formattedData = data?.map(item => ({
                id: item.id,
                recurrence: item.service_type === 'Recurrent'
                    ? `Every ${item.frequency_number || '?'} ${item.unit_of_measurement || item.based_on?.split(' ')[0]}`
                    : 'One time service',
                name: item.name,
                // Logic for "Advance": if auto, use number+unit. If manual, use manual number+unit.
                advance: `${item.notification_number || 0} ${item.notification_unit || 'Days'} in advance`,
                attachments: item.service_template_attachments && item.service_template_attachments[0]?.count > 0
                    ? `${item.service_template_attachments[0].count} Attachment(s)`
                    : "No attachments",
                assets: "0 Assets", // Placeholder for now
                assetTemplates: "No asset templates",
                critical: item.is_critical
            })) || [];

            setTemplates(formattedData);
        } catch (error) {
            console.error('Error fetching templates:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchTemplates();
    }, []);

    return (
        <div className="flex-1 h-full bg-gray-50 flex flex-col">
            {/* Top Header / Filter Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
                <h1 className="text-xl font-bold text-gray-900 whitespace-nowrap">Service templates</h1>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search templates"
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded hover:border-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                            Based on
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="relative">
                        <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-200 transition-colors">
                            Critical Service
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <span className="text-sm font-semibold text-gray-700">{templates.length} Templates</span>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/administration/service-templates/add')}
                            className="flex flex-col items-center gap-1 group"
                        >
                            <Plus className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                            <span className="text-[10px] text-gray-500 group-hover:text-red-600 font-medium">Add</span>
                        </button>
                        <button
                            disabled={!selectedTemplateId}
                            onClick={() => selectedTemplateId && navigate(`/administration/service-templates/edit/${selectedTemplateId}`)}
                            className={`flex flex-col items-center gap-1 group ${!selectedTemplateId ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Pencil className={`w-5 h-5 text-gray-600 ${selectedTemplateId ? 'group-hover:text-red-600' : ''} transition-colors`} />
                            <span className={`text-[10px] text-gray-500 ${selectedTemplateId ? 'group-hover:text-red-600' : ''} font-medium`}>Edit</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 group">
                            <Trash2 className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                            <span className="text-[10px] text-gray-500 group-hover:text-red-600 font-medium">Delete</span>
                        </button>
                    </div>
                </div>

                <button className="flex flex-col items-center gap-1 group">
                    <ArrowUpDown className="w-5 h-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                    <span className="text-[10px] text-gray-500 group-hover:text-red-600 font-medium">Sort</span>
                </button>
            </div>

            {/* List Content */}
            <div className="flex-1 bg-gray-50 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-gray-500">Loading...</div>
                ) : (
                    templates.map((template) => (
                        <div
                            key={template.id}
                            onClick={() => setSelectedTemplateId(template.id)}
                            className={`bg-white border-b border-gray-200 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer group ${selectedTemplateId === template.id ? 'bg-red-50 hover:bg-red-50 border-l-4 border-l-red-500 pl-[20px]' : ''}`}
                        >
                            <div className="flex items-start justify-between">
                                {/* Column 1: Recurrence & Name */}
                                <div className="w-1/3 pr-4">
                                    <div className="text-red-500 text-sm mb-1">{template.recurrence}</div>
                                    <div className="font-bold text-gray-800 text-base">{template.name}</div>
                                </div>

                                {/* Column 2: Advance & Attachments */}
                                <div className="w-1/4">
                                    <div className="text-gray-600 text-sm mb-1">{template.advance}</div>
                                    <div className="text-gray-400 text-sm">{template.attachments}</div>
                                </div>

                                {/* Column 3: Assets & Asset Templates */}
                                <div className="w-1/4">
                                    <div className="text-gray-600 text-sm mb-1">{template.assets}</div>
                                    <div className="text-gray-400 text-sm">{template.assetTemplates}</div>
                                </div>

                                {/* Column 4: Critical Badge */}
                                <div className="w-1/6 flex justify-end items-center">
                                    {template.critical && (
                                        <span className="bg-amber-100 text-amber-800 text-xs px-3 py-1 rounded-full font-medium border border-amber-200">
                                            Critical
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {/* Footer Info */}
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Info className="w-5 h-5 mb-2" />
                    <span className="text-sm">No more results to show.</span>
                </div>
            </div>
        </div>
    );
};
