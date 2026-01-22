import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const EditServiceTemplate = () => {
    const navigate = useNavigate()

    return (
        <div className="flex-1 h-full bg-gray-50 flex flex-col p-6">
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Service Template</h1>
                    <p className="text-gray-500">Edit existing service template details</p>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="text-center text-gray-500 py-12">
                    Form content will go here
                </div>
            </div>
        </div>
    )
}
