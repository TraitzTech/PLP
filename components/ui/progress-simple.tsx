"use client"

import * as React from "react"
import {cn} from "@/lib/utils";

interface ProgressProps {
    value?: number
    className?: string
}

const ProgressSimple = React.forwardRef<
    HTMLDivElement,
    ProgressProps
>(({ className, value = 0, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, value))

    return (
        <div
            ref={ref}
            className={cn(
                "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
                className
            )}
            {...props}
        >
            <div
                className="h-full bg-primary transition-all"
                style={{ width: `${percentage}%` }}
            />
        </div>
    )
})
ProgressSimple.displayName = "Progress"

export { ProgressSimple }