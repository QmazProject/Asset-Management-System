import { useState } from 'react'
import { Plus, ArrowRightLeft, CheckCircle, Pencil, Trash2, SlidersHorizontal, Upload, Download, ClipboardCheck, ChevronDown } from 'lucide-react'

type ActionId = 'add' | 'transfer' | 'status' | 'edit' | 'delete'

interface ActionTab {
    id: ActionId
    label: string
    icon: React.ReactNode
}

interface ActionToolbarProps {
    onActionClick?: (actionId: string) => void
    activeAction?: string | null
    totalItems?: number
    selectedCount?: number
}

const actionTabs: ActionTab[] = [
    { id: 'add', label: 'Add', icon: <Plus className="w-6 h-6" /> },
    { id: 'transfer', label: 'Transfer', icon: <ArrowRightLeft className="w-6 h-6" /> },
    { id: 'status', label: 'Status', icon: <CheckCircle className="w-6 h-6" /> },
    { id: 'edit', label: 'Edit', icon: <Pencil className="w-6 h-6" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="w-6 h-6" /> },
]

export const ActionToolbar = ({ onActionClick, activeAction: externalActiveAction, totalItems = 0, selectedCount = 0 }: ActionToolbarProps) => {
    const [internalActiveAction, setInternalActiveAction] = useState<ActionId | null>(null)
    const activeAction = externalActiveAction ?? internalActiveAction

    const handleActionClick = (actionId: ActionId) => {
        if (onActionClick) {
            onActionClick(actionId)
        } else {
            setInternalActiveAction(actionId)
            console.log(`Action clicked: ${actionId}`)
        }
    }

    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    return (
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="w-full">
                <div className="flex items-center gap-0">
                    {/* Items Counter */}
                    <div className="flex flex-col items-center justify-center px-5 py-3 min-w-[70px] border-r border-gray-200 bg-lime-50 h-[62px]">
                        <span className="text-lg font-bold text-lime-700 leading-none">
                            {selectedCount > 0 ? `${selectedCount}/${totalItems}` : totalItems}
                        </span>
                        <span className="text-[10px] font-medium text-lime-600 leading-tight mt-1">
                            Items
                        </span>
                    </div>

                    {actionTabs.map((action) => {
                        let isDisabled = false
                        /*
                            ENABLE/DISABLE LOGIC
                            This logic determines if an action button should be clickable based on the number of selected assets (selectedCount).
                        */
                        if (action.id === 'add') {
                            isDisabled = selectedCount > 0 // 'Add' is disabled when any assets are selected
                        } else if (action.id === 'edit') {
                            isDisabled = selectedCount !== 1 // 'Edit' works only when exactly 1 item is selected
                        } else {
                            // 'Transfer', 'Status', 'Delete' require at least 1 item to be selected
                            isDisabled = selectedCount === 0
                        }

                        return (
                            <button
                                key={action.id}
                                onClick={() => !isDisabled && handleActionClick(action.id)}
                                disabled={isDisabled}
                                className={`
                                    flex flex-col items-center justify-center px-5 py-3 min-w-[70px]
                                    transition-all border-r border-gray-200
                                    ${isDisabled
                                        ? 'opacity-50 cursor-not-allowed text-gray-400 bg-gray-50'
                                        : activeAction === action.id
                                            ? 'text-gray-900 bg-white'
                                            : 'text-gray-500 hover:text-lime-700 hover:bg-lime-50'
                                    }
                                `}
                            >
                                {action.icon}
                                <span className="text-[10px] mt-1.5 font-normal text-center leading-tight">
                                    {action.label}
                                </span>
                            </button>
                        )
                    })}

                    {/* Spacer to push dropdown to right */}
                    <div className="flex-1 bg-gray-50 h-[62px]"></div>

                    {/* Right Dropdown */}
                    <div className="relative border-l border-gray-200 bg-white h-[62px]">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="h-full px-4 flex items-center justify-center hover:bg-lime-50 hover:text-lime-700 transition-colors"
                        >
                            <ChevronDown className={`w-4 h-4 text-gray-900 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsDropdownOpen(false)}
                                ></div>
                                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 py-1">
                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                                        <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                                        Customise view
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                                        <Upload className="w-4 h-4 text-gray-500" />
                                        Import
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                                        <Download className="w-4 h-4 text-gray-500" />
                                        Export
                                    </button>
                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3">
                                        <ClipboardCheck className="w-4 h-4 text-gray-500" />
                                        Complete services
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
