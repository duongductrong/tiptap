import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

export interface InputProps extends ComponentProps<"input"> { }

const Input = ({ className, type, ref, ...props }: InputProps) => {
  return (
    <input
      {...props}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md",
        "border border-input bg-transparent px-3 py-1 text-base",
        "transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0",
        "focus-visible:border focus-visible:border-ring",
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
    />
  )
}
Input.displayName = "Input"

export { Input }
