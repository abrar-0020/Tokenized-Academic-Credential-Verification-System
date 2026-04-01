"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { motion } from "framer-motion"

interface HorizontalDockProps {
  className?: string
  items: {
    icon: React.ComponentType<{ className?: string }>
    label: string
    onClick?: () => void
  }[]
}

export default function HorizontalDock({ items, className }: HorizontalDockProps) {
  const [active, setActive] = React.useState<string | null>(null)
  const [hovered, setHovered] = React.useState<number | null>(null)

  return (
    <div className={cn("flex items-center justify-end gap-2 px-6", className)}>
      <TooltipProvider delayDuration={100}>
        {items.map((item, i) => {
          const isActive = active === item.label
          const isHovered = hovered === i

          return (
            <Tooltip key={item.label}>
              <TooltipTrigger asChild>
                <motion.div
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  animate={{
                    scale: isHovered ? 1.15 : 1,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative flex flex-col items-center"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-lg relative h-9 w-9",
                      "transition-colors",
                      isHovered && "shadow-lg shadow-[#8197ff]/20 bg-[#1f2020]"
                    )}
                    onClick={() => {
                      setActive(item.label)
                      item.onClick?.()
                    }}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isActive ? "text-[#8197ff]" : "text-[#e7e5e4]"
                      )}
                    />
                    {isHovered && (
                      <motion.span
                        layoutId="glow"
                        className="absolute inset-0 rounded-lg border border-[#8197ff]/40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </Button>

                  {isActive && (
                    <motion.div
                      layoutId="dot"
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-[#8197ff]"
                    />
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-[#252626] text-[#e7e5e4] border-[#484848]/30">
                {item.label}
              </TooltipContent>
            </Tooltip>
          )
        })}
      </TooltipProvider>
    </div>
  )
}
