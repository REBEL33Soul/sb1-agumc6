import React from 'react';
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  active?: boolean;
}

export function ActionButton({
  label,
  description,
  icon,
  active = false,
  className,
  ...props
}: ActionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative w-full p-4 bg-gray-800/50 backdrop-blur-xl rounded-xl border",
        "transition-all duration-200 group hover:shadow-lg",
        active 
          ? "border-blue-500 shadow-blue-500/25" 
          : "border-gray-700 hover:border-gray-600",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-4">
        {icon && (
          <div className={cn(
            "p-2 rounded-lg transition-colors",
            active 
              ? "bg-blue-500/20 text-blue-400" 
              : "bg-gray-700/50 text-gray-400 group-hover:bg-gray-700 group-hover:text-gray-300"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1 text-left">
          <p className={cn(
            "font-medium transition-colors",
            active ? "text-blue-400" : "text-white"
          )}>
            {label}
          </p>
          {description && (
            <p className="mt-1 text-sm text-gray-400 group-hover:text-gray-300">
              {description}
            </p>
          )}
        </div>
      </div>

      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute inset-0 border-2 border-blue-500 rounded-xl"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}