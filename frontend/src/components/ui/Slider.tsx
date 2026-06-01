import { type InputHTMLAttributes, useCallback } from 'react'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label?: string
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  displayValue?: string
}

export default function Slider({
  label,
  value,
  min = 0,
  max = 100,
  onChange,
  displayValue,
  className = '',
  ...props
}: SliderProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value))
    },
    [onChange],
  )

  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className={`grid grid-cols-[110px_1fr_45px] gap-2.5 items-center ${className}`}>
      {label && (
        <label className="text-xs text-text-secondary">{label}</label>
      )}
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="
            w-full h-1 appearance-none cursor-pointer
            bg-glass-thin rounded-full
            accent-accent-cyan
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-accent-cyan
            [&::-webkit-slider-thumb]:shadow-[0_0_8px_hsla(189,100%,56%,0.5)]
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:hover:scale-110
          "
          style={{
            background: `linear-gradient(to right, #06b6d4 ${pct}%, hsla(0,0%,100%,0.08) ${pct}%)`,
          }}
          {...props}
        />
      </div>
      <span className="text-right text-sm font-semibold text-accent-cyan font-mono">
        {displayValue ?? value}
      </span>
    </div>
  )
}
