interface CheckboxProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string
}

export const Checkbox = ({ label, checked, onChange, error }: CheckboxProps) => {
  return (
    <div className="mb-3">
      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
          className={`mt-1 w-5 h-5 rounded border-2 bg-white/5 border-white/20 text-primary focus:ring-primary focus:ring-offset-0 focus:ring-offset-transparent ${error ? 'border-red-500' : ''}`}
        />
        <span className={`text-sm ${error ? 'text-red-400' : 'text-brand-gray'}`}>{label}</span>
      </label>
      {error && <p className="text-red-400 text-sm mt-1 ml-8">{error}</p>}
    </div>
  )
}
