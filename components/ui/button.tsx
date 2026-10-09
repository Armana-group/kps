import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Every button is a pill. Three fills (accent, ink, hairline) and a ghost.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold tracking-[-0.005em] transition-[background-color,border-color,color,opacity,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-ink focus-visible:outline-offset-3",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-ink hover:bg-[color-mix(in_srgb,var(--accent)_86%,white)]",
        secondary: "bg-ink text-paper hover:opacity-85",
        outline: "border border-line-strong text-ink hover:border-ink",
        ghost: "text-ink hover:bg-panel",
        destructive: "border border-danger text-danger hover:bg-danger hover:text-white",
        link: "text-ink underline underline-offset-4 decoration-1 hover:decoration-2 rounded-none h-auto px-0",
      },
      size: {
        default: "h-11 px-5 text-[15px]",
        sm: "h-9 px-4 text-sm",
        lg: "h-13 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

/** The small black circle with an arrow that sits inside accent pills. */
function ButtonArrow({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-grid size-[22px] shrink-0 place-items-center rounded-full bg-ink", className)}>
      <svg viewBox="0 0 24 24" className="size-3 stroke-paper fill-none" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </span>
  )
}

export { Button, ButtonArrow, buttonVariants }
