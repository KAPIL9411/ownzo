import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/frontend/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B4332] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:     "bg-[#1B4332] text-white hover:bg-[#2D6A4F] shadow-sm",
        destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline:     "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-[#1B4332]/40",
        secondary:   "bg-gray-100 text-gray-800 hover:bg-gray-200",
        ghost:       "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
        link:        "text-[#1B4332] underline-offset-4 hover:underline",
        orange:      "bg-[#F97316] text-white hover:bg-[#EA580C] shadow-sm",
        success:     "bg-[#1B4332] text-white hover:bg-[#2D6A4F]",
      },
      size: {
        default:  "h-10 px-4 py-2",
        sm:       "h-8 rounded-md px-3 text-xs",
        lg:       "h-11 rounded-lg px-8",
        xl:       "h-12 rounded-lg px-10 text-base",
        icon:     "h-10 w-10",
        "icon-sm":"h-8 w-8",
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
