import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import CheckboxParticles from "./CheckboxParticles"

const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ')
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-brandGreen-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-brandGreen-500 data-[state=checked]:border-brandGreen-600 transition-all duration-200 shadow-sm hover:border-brandGreen-400 dark:border-gray-500 dark:hover:border-brandGreen-400 dark:data-[state=unchecked]:bg-gray-700",
      className
    )}
    {...props}
  >
    {/* Partículas animadas quando marcado */}
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-white relative w-full h-full")}>  
      <CheckboxParticles isChecked={!!props.checked} />
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
