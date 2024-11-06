import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ToggleButtonProps {
  isActive: boolean;
  onToggle: () => void;
  activeIcon?: React.ReactNode;
  inactiveIcon?: React.ReactNode;
  activeLabel?: string;
  inactiveLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function ToggleButton({
  isActive,
  onToggle,
  activeIcon,
  inactiveIcon,
  activeLabel,
  inactiveLabel,
  size = 'md',
  disabled = false,
  className
}: ToggleButtonProps) {
  const sizes = {
    sm: "h-6 w-12",
    md: "h-8 w-16",
    lg: "h-10 w-20"
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileTap={disabled ? undefined : { scale: 0.95 }}
        onClick={onToggle}
        className={cn(
          "relative rounded-full transition-colors duration-200",
          isActive 
            ? "bg-gradient-to-r from-blue-600 to-blue-400" 
            : "bg-gray-700",
          disabled && "opacity-50 cursor-not-allowed",
          sizes[size],
          className
        )}
        disabled={disabled}
      >
        <motion.div
          className={cn(
            "absolute top-1 rounded-full bg-white shadow-lg",
            size === 'sm' && "h-4 w-4",
            size === 'md' && "h-6 w-6",
            size === 'lg' && "h-8 w-8"
          )}
          animate={{
            x: isActive 
              ? size === 'sm' ? 24 : size === 'md' ? 32 : 40
              : 4
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {isActive ? (
            activeIcon && (
              <div className={cn(
                "absolute inset-0 flex items-center justify-center text-blue-600",
                iconSizes[size]
              )}>
                {activeIcon}
              </div>
            )
          ) : (
            inactiveIcon && (
              <div className={cn(
                "absolute inset-0 flex items-center justify-center text-gray-600",
                iconSizes[size]
              )}>
                {inactiveIcon}
              </div>
            )
          )}
        </motion.div>
      </motion.button>
      
      {(activeLabel || inactiveLabel) && (
        <span className={cn(
          "text-sm font-medium transition-colors",
          isActive ? "text-blue-400" : "text-gray-400"
        )}>
          {isActive ? activeLabel : inactiveLabel}
        </span>
      )}
    </div>
  );
}