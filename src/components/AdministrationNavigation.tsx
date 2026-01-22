import { X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface AdministrationNavigationProps {
    onClose: () => void
}

export const AdministrationNavigation = ({ onClose }: AdministrationNavigationProps) => {
    const navigate = useNavigate()
    const sections = [
        {
            title: 'Assets',
            items: [
                'Groups',
                'Manufacturers',
                'Service templates',
                'Templates',
                'Circularity report'
            ]
        },
        {
            title: 'Locations',
            items: [
                'Hierarchy',
                'Archived locations',
                'Cost location settings'
            ]
        },
        {
            title: 'Employees',
            items: [
                'Certificate templates',
                'Roles'
            ]
        },
        {
            title: 'General',
            items: [
                'Alert settings',
                'Labels',
                'Transfer history',
                'Unit management',
                'Gateway report settings'
            ]
        }
    ]

    return (
        /* 
           MEGA MENU OVERLAY CONTAINER
           - absolute top-[142px]: Positions the menu exactly below the navigation tabs (Header 64px + Tabs 54px).
           - z-50: Ensures it overlays on top of all other content (like the Asset Table).
           - pointer-events-none: Crucial! Allows clicks to pass through empty spaces to the underlying content
             if the menu wasn't fullscreen, but here we use it on the wrapper to be safe.
        */
        <div className="absolute top-[142px] left-0 right-0 z-50 flex justify-center px-4 sm:px-6 lg:px-8 pointer-events-none">

            {/* 
                BACKDROP (Click to Close)
                - fixed inset-0: Covers the entire screen.
                - z-40: sits just below the menu card but above page content.
                - pointer-events-auto: Re-enables clicks so we can catch them to close the menu.
                - bg-black/50: Dims the background content.
            */}
            <div className="fixed inset-0 top-[118px] z-40 pointer-events-auto bg-black/50 transition-opacity" onClick={onClose}></div>

            {/* 
               POINTER / CARET
               - Moved outside the centered card so it stays fixed relative to the screen/tabs.
               - absolute -top-2: Positions it just above the menu line.
               - left-[780px]: Precise alignment to the 'Administration' tab.
               - z-index needs to be above card border? Same level.
            */}
            <div className="absolute -top-2 left-[780px] w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45 z-50"></div>

            {/* 
                MENU CARD
                - relative z-50: Sits above the backdrop.
                - pointer-events-auto: Allows interaction with menu items.
            */}
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl border border-gray-200 p-6 relative z-50 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>


                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-8">
                    {sections.map((section) => (
                        <div key={section.title} className="space-y-4">
                            <h3 className="text-base font-bold text-gray-900 pb-2 border-b border-gray-200">
                                {section.title}
                            </h3>
                            <ul className="space-y-3">
                                {section.items.map((item) => (
                                    <li key={item}>
                                        <button
                                            className="text-sm text-gray-600 hover:text-red-600 hover:underline decoration-2 underline-offset-4 transition-colors text-left w-full block"
                                            onClick={() => {
                                                if (item === 'Service templates') {
                                                    navigate('/administration/service-templates')
                                                    onClose()
                                                } else {
                                                    console.log(`Clicked ${item}`)
                                                }
                                            }}
                                        >
                                            {item}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
