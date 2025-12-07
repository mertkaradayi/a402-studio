import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-xl border border-white/12 bg-[#0c0c12]/80 px-3.5 py-2 text-sm text-white transition-colors placeholder:text-white/50 shadow-[0_16px_60px_-48px_rgba(0,0,0,0.8)] focus-visible:outline-none focus-visible:border-neon-cyan/40 focus-visible:ring-2 focus-visible:ring-neon-cyan/50 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = "Input"

export { Input }
