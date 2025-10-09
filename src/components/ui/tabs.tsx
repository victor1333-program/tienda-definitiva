import { createContext, useContext, ReactNode } from 'react'
import { cn } from '@/lib/utils'

const TabsContext = createContext<{
  value?: string
  onValueChange?: (value: string) => void
}>({})

interface TabsProps {
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: ReactNode
}

export const Tabs = ({ value, onValueChange, className, children }: TabsProps) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div className={cn("w-full", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  className?: string
  children: ReactNode
}

export const TabsList = ({ className, children }: TabsListProps) => {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  className?: string
  children: ReactNode
  disabled?: boolean
}

export const TabsTrigger = ({ value, className, children, disabled }: TabsTriggerProps) => {
  const { value: selectedValue, onValueChange } = useContext(TabsContext)
  const isSelected = selectedValue === value

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onValueChange?.(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        isSelected ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-muted-foreground hover:bg-orange-50 hover:text-orange-600",
        className
      )}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children: ReactNode
}

export const TabsContent = ({ value, className, children }: TabsContentProps) => {
  const { value: selectedValue } = useContext(TabsContext)
  
  if (selectedValue !== value) {
    return null
  }

  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
    >
      {children}
    </div>
  )
}