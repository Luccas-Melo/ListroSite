import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check } from "lucide-react"
import CheckboxParticles from "./CheckboxParticles"

const cn = (...classes: any[]) => {
  return classes.filter(Boolean).join(' ')
}

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  color?: string;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, color, ...props }, ref) => {
  const isDefaultColor = !color || color === '#84cc16';

  const normalizeColor = (col?: string) => {
    if (!col) return undefined;
    // Remove alpha if present (e.g., #RRGGBBAA)
    if (col.length === 9) {
      return col.substring(0, 7);
    }
    return col;
  };

  const dynamicStyles = color && color !== '#84cc16'
    ? {
        borderColor: normalizeColor(color),
        backgroundColor: props.checked ? normalizeColor(color) : 'transparent',
        color: '#fff',
      }
    : {};

  const defaultColorClasses = "border-brandGreen-300 data-[state=checked]:bg-brandGreen-500 data-[state=checked]:border-brandGreen-600 hover:border-brandGreen-400 dark:border-gray-500 dark:hover:border-brandGreen-400 dark:data-[state=unchecked]:bg-gray-700";

  const baseClasses = "peer flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm";

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        baseClasses,
        color && color !== '#84cc16' ? '' : defaultColorClasses,
        className
      )}
      style={dynamicStyles}
      {...props}
    >
      {/* Partículas animadas quando marcado */}
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center relative w-full h-full")}>  
        <CheckboxParticles isChecked={!!props.checked} color={color} />
        <Check className="h-4 w-4" color="#fff" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
