import React from 'react';
import { motion } from 'framer-motion';

const PillToggle = ({ options, value, onChange }) => {
    return (
        <div className="glass p-1 rounded-full shadow-sm inline-flex space-x-1">
            {options.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        key={option.value}
                        onClick={() => onChange(option.value)}
                        className={`
              relative px-6 py-3 rounded-full text-sm font-semibold transition-colors duration-200 z-10 flex items-center gap-2
              ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'}
            `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="pill-active-bg"
                                className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        {option.icon && <span>{option.icon}</span>}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default PillToggle;
