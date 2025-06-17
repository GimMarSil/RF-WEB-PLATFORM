import * as React from "react"
import { useEffect, useRef, useImperativeHandle } from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { gsap } from "gsap"
import { cn } from "../lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const localRef = useRef<React.ElementRef<typeof TooltipPrimitive.Content>>(null)
  useImperativeHandle(ref, () => localRef.current)
  useEffect(() => {
    const el = localRef.current
    if (el) {
      gsap.fromTo(el, { opacity: 0, y: 4 }, { opacity: 1, y: 0 })
    }
    return () => {
      if (el) {
        gsap.to(el, { opacity: 0, y: -4 })
      }
    }
  }, [])

  return (
    <TooltipPrimitive.Content
      ref={localRef}
      sideOffset={sideOffset}
      className={cn(
        "z-50 overflow-hidden rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent }
