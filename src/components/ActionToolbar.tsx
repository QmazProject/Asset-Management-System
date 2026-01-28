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

// Exporting the component to be used in other files.
// Props received:
// - onActionClick: Function to handle when a button is clicked
// - activeAction: The ID of the currently active action (e.g. 'add', 'edit')
// - totalItems: Total number of assets in the list
// - selectedCount: Number of assets currently selected by the checkbox
export const ActionToolbar = ({ onActionClick, activeAction: externalActiveAction, totalItems = 0, selectedCount = 0 }: ActionToolbarProps) => {
    // Internal state for active action if not controlled externally
    const [internalActiveAction, setInternalActiveAction] = useState<ActionId | null>(null)
    const activeAction = externalActiveAction ?? internalActiveAction

    // Handler for button clicks
    const handleActionClick = (actionId: ActionId) => {
        if (onActionClick) {
            onActionClick(actionId)
        } else {
            setInternalActiveAction(actionId)
            console.log(`Action clicked: ${actionId}`)
        }
    }

    // Dropdown state for the right-side menu (e.g. Export, Import)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    return (
        // Main toolbar container with light gray background and bottom border
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="w-full">
                <div className="flex items-center gap-0">
                    {/* 
                         SECTION 1: ITEMS COUNTER
                         Displays the total count of items or how many are selected (e.g. "1/20").
                         Visual style: Green background (lime-50) to stand out.
                    */}
                    <div className="flex flex-col items-center justify-center px-5 py-3 min-w-[70px] border-r border-gray-200 bg-lime-50 h-[62px]">
                        <span className="text-lg font-bold text-lime-700 leading-none">
                            {selectedCount > 0 ? `${selectedCount}/${totalItems}` : totalItems}
                        </span>
                        <span className="text-[10px] font-medium text-lime-600 leading-tight mt-1">
                            Items
                        </span>
                    </div>

                    {/* 
                        SECTION 2: ACTION BUTTONS LOOP
                        We map through the 'actionTabs' array (defined above) to create buttons for:
                        Add, Transfer, Status, Edit, Delete.
                    */}
                    {actionTabs.map((action) => {
                        let isDisabled = false
                        /*
                            ENABLE/DISABLE LOGIC
                            - Add: Disabled if ANY item is selected (can only add when nothing is selected).
                            - Edit: Enabled ONLY if EXACTLY 1 item is selected.
                            - Transfer/Status/Delete: Enabled if AT LEAST 1 item is selected.
                        */
                        if (action.id === 'add') {
                            isDisabled = selectedCount > 0
                        } else if (action.id === 'edit') {
                            isDisabled = selectedCount !== 1
                        } else {
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
                                        // Style for DISABLED state: Faded out, gray text
                                        ? 'opacity-50 cursor-not-allowed text-gray-400 bg-gray-50'
                                        : activeAction === action.id
                                            // Style for ACTIVE state: White background, dark text
                                            ? 'text-gray-900 bg-white'
                                            // Style for DEFAULT state: Gray text, green hover effect
                                            : 'text-gray-500 hover:text-lime-700 hover:bg-lime-50'
                                    }
                                `}
                            >
                                {/* Render the specific icon for this action */}
                                {action.icon}
                                {/* Render the label (Add, Edit, etc) */}
                                <span className="text-[10px] mt-1.5 font-normal text-center leading-tight">
                                    {action.label}
                                </span>
                            </button>
                        )
                    })}

                    {/* Spacer to push the dropdown to the far right */}
                    <div className="flex-1 bg-gray-50 h-[62px]"></div>

                    {/* 
                        SECTION 3: RIGHT DROPDOWN MENU 
                        Contains extra options like Import, Export, Customise view.
                    */}
                    <div className="relative border-l border-gray-200 bg-white h-[62px]">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="h-full px-4 flex items-center justify-center hover:bg-lime-50 hover:text-lime-700 transition-colors"
                        >
                            <ChevronDown className={`w-4 h-4 text-gray-900 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <>
                                {/* Click backdrop to close dropdown */}
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsDropdownOpen(false)}
                                ></div>
                                {/* Dropdown menu items */}
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
