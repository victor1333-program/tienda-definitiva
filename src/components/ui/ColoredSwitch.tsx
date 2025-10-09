"use client"

import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface ColoredSwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  activeColor?: 'green' | 'blue' | 'purple' | 'orange'
  inactiveColor?: 'gray' | 'red'
}

const ColoredSwitch = forwardRef<HTMLButtonElement, ColoredSwitchProps>(
  ({ 
    className, 
    checked, 
    onCheckedChange, 
    disabled, 
    activeColor = 'green', 
    inactiveColor = 'gray',
    ...props 
  }, ref) => {
    
    const getActiveClasses = () => {
      switch (activeColor) {
        case 'green':
          return 'bg-green-500 border-green-500'
        case 'blue':
          return 'bg-blue-500 border-blue-500'
        case 'purple':
          return 'bg-purple-500 border-purple-500'
        case 'orange':
          return 'bg-orange-500 border-orange-500'
        default:
          return 'bg-green-500 border-green-500'
      }
    }

    const getInactiveClasses = () => {
      switch (inactiveColor) {
        case 'gray':
          return 'bg-gray-300 border-gray-300'
        case 'red':
          return 'bg-red-300 border-red-300'
        default:
          return 'bg-gray-300 border-gray-300'
      }
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        ref={ref}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          checked ? getActiveClasses() : getInactiveClasses(),
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    )
  }
)

ColoredSwitch.displayName = "ColoredSwitch"

export { ColoredSwitch }