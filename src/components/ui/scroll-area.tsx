"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "vertical" | "horizontal" | "both"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, orientation = "vertical", ...props }, ref) => {
    return (
      <div
        data-slot="scroll-area"
        className={cn("relative", className)}
        ref={ref}
        {...props}
      >
        <div
          data-slot="scroll-area-viewport"
          className={cn(
            "size-full rounded-[inherit] transition-[color,box-shadow] focus-visible:ring-4 focus-visible:outline-1",
            orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
            orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
            orientation === "both" && "overflow-auto"
          )}
        >
          {children}
        </div>
      </div>
    )
  }
)

ScrollArea.displayName = "ScrollArea"

// Custom ScrollBar component to visually replicate the scrollbar if needed
// (Note: This is a simplified version without the interactive behavior of Radix ScrollBar)
const ScrollBar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "vertical" | "horizontal" }
>(({ className, orientation = "vertical", ...props }, ref) => {
  return (
    <div
      data-slot="scroll-area-scrollbar"
      className={cn(
        "hidden", // Hidden by default since we're using native scrolling
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      ref={ref}
      {...props}
    >
      <div
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </div>
  )
})

ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }