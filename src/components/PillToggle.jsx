import React from 'react';
import { motion } from 'framer-motion';

const PillToggle = ({ options, value, onChange }) => {
    return (
        <div className="glass p-1 rounded-full inline-flex space-x-1">
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`
              relative px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-colors duration-200 flex items-center gap-2 font-bricolage
              ${isActive ? 'text-primary z-20' : 'text-muted-foreground hover:text-foreground z-10'}
            `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="pill-active-bg"
                                className="absolute inset-0 bg-background rounded-full shadow-sm border border-border/50"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        {option.icon && <span>{option.icon}</span>}
                        <span className="relative z-20">{option.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default PillToggle;
