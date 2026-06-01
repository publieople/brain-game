import { type InputHTMLAttributes } from 'react'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function FormInput({ label, className = '', ...props }: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 text-sm text-text-primary
          bg-glass-thin backdrop-blur-md
          border border-glass-border rounded-lg
          placeholder:text-text-tertiary
          transition-[border,box-shadow] duration-250 ease-out
          focus:outline-none focus:border-primary-400
          focus:shadow-[0_0_0_3px_hsla(228,89%,66%,0.2)]
          ${className}
        `}
        {...props}
      />
    </div>
  )
}
