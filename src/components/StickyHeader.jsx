import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter } from 'lucide-react';
import BrandLogo from './BrandLogo';
import ThemeToggle from './ThemeToggle';
import { useRef } from 'react';

const StickyHeader = ({
    headerHeight,
    headerPadding,
    logoScale,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    setIsFilterOpen,
    startExtras, // Optional: items to render before the standard actions
    endExtras,   // Optional: items to render after the standard actions
    customTitle,  // Optional: replace logo with a custom title (e.g. for MyAgenda)
    hideSearch = false,
    hideFilter = false
}) => {
    return (
        <motion.header
            style={{ height: headerHeight, paddingTop: headerPadding }}
            className="relative left-0 right-0 z-20 px-6 max-w-md mx-auto"
        >
            <div className="flex justify-between items-center mb-6 gap-4">
                <motion.div style={{ scale: logoScale }} className="origin-left">
                    {customTitle ? customTitle : <BrandLogo className="h-16 w-auto max-w-full text-foreground" />}
                </motion.div>

                <div className="flex items-center gap-3">
                    {startExtras}

                    <ThemeToggle />

                    {!hideSearch && (
                        <button
                            onClick={() => setIsSearchOpen(!isSearchOpen)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSearchOpen ? 'bg-primary text-white' : 'bg-muted/50 hover:bg-muted'}`}
                        >
                            {isSearchOpen ? <X className="w-4 h-4" /> : <Search className="w-4 h-4 opacity-40" />}
                        </button>
                    )}

                    {!hideFilter && (
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
                        >
                            <Filter className="w-4 h-4 opacity-40" />
                        </button>
                    )}

                    {endExtras}
                </div>
            </div>

            <AnimatePresence>
                {isSearchOpen && !hideSearch && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-muted/50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                                    >
                                        <X className="w-3 h-3 opacity-40" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setIsSearchOpen(false);
                                    setSearchQuery('');
                                }}
                                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
                            >
                                Cancelar
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
};

export default StickyHeader;
