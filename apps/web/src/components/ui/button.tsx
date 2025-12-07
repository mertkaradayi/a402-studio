import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.985] border border-transparent",
    {
        variants: {
            variant: {
                default:
                    "bg-[#12131a] text-white border-white/12 shadow-[0_14px_50px_-40px_rgba(0,0,0,0.9)] hover:border-neon-cyan/30 hover:bg-[#141623]",
                destructive:
                    "bg-destructive/85 text-destructive-foreground border-destructive/40 shadow-[0_10px_40px_-28px_rgba(255,77,79,0.35)] hover:bg-destructive hover:border-destructive/60",
                outline:
                    "border border-white/15 bg-[#0f1016] text-white hover:border-neon-cyan/40 hover:text-white",
                secondary:
                    "bg-white/6 text-white border-white/10 shadow-[0_12px_40px_-36px_rgba(0,0,0,0.85)] hover:border-neon-cyan/30 hover:bg-white/10",
                ghost: "text-muted-foreground hover:text-white hover:bg-white/4 border-transparent",
                link: "text-primary underline-offset-4 hover:underline",
                neon: "bg-gradient-to-r from-neon-pink/85 via-neon-yellow/80 to-neon-cyan/80 text-black font-semibold shadow-[0_10px_40px_-30px_rgba(255,0,237,0.35)] hover:shadow-[0_12px_44px_-30px_rgba(4,217,255,0.35)]",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-lg px-3 text-xs",
                lg: "h-12 rounded-xl px-6",
                icon: "h-10 w-10",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }
