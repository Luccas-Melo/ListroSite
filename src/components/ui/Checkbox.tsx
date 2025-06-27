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

  // Função para garantir contraste mínimo na borda
  function getVisibleBorderColor(customColor?: string) {
    if (!customColor || customColor === '#84cc16') return undefined;
    // Se a cor for muito clara, usar um cinza visível
    const color = customColor.replace('#', '');
    if (color.length === 6) {
      const r = parseInt(color.substring(0, 2), 16);
      const g = parseInt(color.substring(2, 4), 16);
      const b = parseInt(color.substring(4, 6), 16);
      // Se a cor for muito clara (luminosidade alta), usar cinza
      if ((r * 0.299 + g * 0.587 + b * 0.114) > 200) {
        return (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) ? '#6b7280' : '#d1d5db';
      }
    }
    return customColor;
  }

  const dynamicStyles = color && color !== '#84cc16'
    ? {
        borderColor: props.checked ? normalizeColor(color) : getVisibleBorderColor(color),
        backgroundColor: props.checked ? normalizeColor(color) : 'transparent',
        color: '#fff',
      }
    : {};

  const defaultColorClasses = "border-brandGreen-300 data-[state=checked]:bg-brandGreen-500 data-[state=checked]:border-brandGreen-600 hover:border-brandGreen-400 dark:border-gray-500 dark:hover:border-brandGreen-400 dark:data-[state=unchecked]:bg-gray-700";

  const baseClasses = "peer flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 shadow-sm border-2";

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
