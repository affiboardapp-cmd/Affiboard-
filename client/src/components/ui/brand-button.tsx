import * as React from "react";
import { cn } from "@/lib/utils";
import { Button as BaseButton, ButtonProps } from "@/components/ui/button";

// Omit variant from ButtonProps to avoid conflict
interface BrandButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "destructive";
}

export const BrandButton = React.forwardRef<HTMLButtonElement, BrandButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const variants = {
      primary: "bg-[#1BC1A1] text-white hover:bg-gradient-brand shadow-brand border-0 hover:opacity-100 transition-all duration-200",
      secondary: "bg-transparent border border-[#1BC1A1] text-[#1BC1A1] hover:bg-[#1BC1A1]/15 hover:text-[#1BC1A1]",
      outline: "border-input bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      link: "text-primary underline-offset-4 hover:underline",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    };

    // Map our variants to BaseButton variants where possible, or default to "default"
    // We primarily use className to style, so the base variant matters less for visuals 
    // but we want to avoid passing invalid variants to BaseButton if it checks.
    // However, BaseButton styles might conflict. 
    // For 'primary' (our custom), we pass 'default' to BaseButton but override classes.
    
    const baseVariant = 
      variant === "primary" ? "default" :
      variant === "secondary" ? "outline" : // Use outline as base for secondary to get border structure if needed, but we override
      variant === "destructive" ? "destructive" :
      variant === "outline" ? "outline" :
      variant === "ghost" ? "ghost" :
      variant === "link" ? "ghost" : "default"; // Map link to ghost since Button doesn't have link variant

    return (
      <BaseButton
        ref={ref}
        variant={baseVariant}
        className={cn(
          "font-medium tracking-wide transition-all duration-200",
          // We need to override BaseButton's default styles if they conflict
          variant === "primary" && "bg-[#1BC1A1] hover:bg-[#1BC1A1] text-white border-0", 
          // Apply our custom classes
          variants[variant] || variants.primary,
          className
        )}
        {...props}
      />
    );
  }
);
BrandButton.displayName = "BrandButton";
