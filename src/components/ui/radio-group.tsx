"use client"

import { forwardRef, InputHTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface RadioGroupProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: ReactNode
  name?: string
}

interface RadioGroupItemProps {
  value: string
  id: string
  className?: string
  name?: string
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  name?: string
}>({ value: undefined, onValueChange: undefined, name: undefined })

const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, name, ...props }, ref) => {
    const groupName = name || `radio-group-${Math.random().toString(36).substr(2, 9)}`
    
    console.log('🔘 RadioGroup render:', { value, groupName })
    
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, name: groupName }}>
        <div
          className={cn("grid gap-2", className)}
          role="radiogroup"
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = forwardRef<HTMLInputElement, RadioGroupItemProps & InputHTMLAttributes<HTMLInputElement>>(
  ({ className, value, id, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    const isChecked = context.value === value
    
    console.log('🔘 RadioGroupItem render:', { value, isChecked, contextValue: context.value })
    
    return (
      <input
        type="radio"
        ref={ref}
        id={id}
        name={context.name}
        value={value}
        checked={isChecked}
        onChange={(e) => {
          console.log('🔘 RadioGroupItem onChange:', { value, checked: e.target.checked })
          if (e.target.checked) {
            context.onValueChange?.(value)
          }
        }}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-orange-500 text-orange-600 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }