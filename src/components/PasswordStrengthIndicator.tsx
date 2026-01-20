import { checkPasswordStrength } from '../utils/validation'
import { Check, X } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
    password: string
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
    const { minLength, hasUppercase, hasNumber, hasSpecial, level } = checkPasswordStrength(password)

    const requirements = [
        { label: 'At least 8 characters', met: minLength },
        { label: 'One uppercase letter', met: hasUppercase },
        { label: 'One number', met: hasNumber },
        { label: 'One special character', met: hasSpecial },
    ]

    const strengthColors: Record<typeof level, string> = {
        none: 'bg-dark-700',
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-green-500',
    }

    const strengthWidth: Record<typeof level, string> = {
        none: 'w-0',
        weak: 'w-1/4',
        medium: 'w-2/4',
        strong: 'w-full',
    }

    if (!password) return null

    return (
        <div className="mt-2 space-y-2 animate-fade-in">
            {/* Strength bar */}
            <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-300 ${strengthColors[level]} ${strengthWidth[level]}`}
                    />
                </div>
                <span className="text-xs font-medium capitalize text-dark-300">
                    {level !== 'none' && level}
                </span>
            </div>

            {/* Requirements list */}
            <div className="space-y-1">
                {requirements.map((req) => (
                    <div
                        key={req.label}
                        className={`flex items-center gap-2 text-xs transition-colors ${req.met ? 'text-green-400' : 'text-dark-400'
                            }`}
                    >
                        {req.met ? (
                            <Check className="w-3 h-3" />
                        ) : (
                            <X className="w-3 h-3" />
                        )}
                        <span>{req.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
