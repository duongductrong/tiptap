"use client"

import * as LabelPrimitive from "@radix-ui/react-label"
import * as React from "react"
import { tv, type VariantProps } from "tailwind-variants"

import { cn } from "@/lib/utils"

export const labelVariants = tv({
  base: "text-sm font-medium leading-4 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
})

export interface LabelProps
  extends React.ComponentProps<typeof LabelPrimitive.Root>,
  VariantProps<typeof labelVariants> { }

const Label = ({ className, ref, ...props }: LabelProps) => (
  <LabelPrimitive.Root
    {...props}
    className={cn(labelVariants({ className: className }))}
    ref={ref}
  />
)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
