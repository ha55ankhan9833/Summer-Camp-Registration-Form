import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    return (
      <div className={`mb-4 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-brand-gray mb-2">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          required={required}
          className={`glass-input w-full ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
          }`}
          {...props}
        />

        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'