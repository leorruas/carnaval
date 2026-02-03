import { Navigation, Car, Bus } from 'lucide-react';

const BlockCardActions = ({
    theme,
    countdown,
    route,
    loadingRoute,
    uberPrice,
    onCalculateDistance,
    onOpenUber,
    onOpenMaps
}) => {
    const isExpanded = (countdown && !countdown.isPast) || route;

    if (isExpanded) {
        return (
            <div className="pt-8 border-t border-border/20 space-y-6">
                <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center justify-center gap-3">
                        {countdown && !countdown.isPast && (
                            <div
                                className="flex items-center gap-2 px-4 py-2 rounded-2xl border transition-colors duration-500"
                                style={{
                                    backgroundColor: `${theme.color}15`, // 10% opacity
                                    borderColor: `${theme.color}30`, // 20% opacity
                                }}
                            >
                                <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.color }} />
                                <span className="font-bricolage text-[10px] uppercase font-black tracking-tight" style={{ color: theme.color }}>
                                    Falta: {countdown.formatted}
                                </span>
                            </div>
                        )}
                    </div>
                    {route && (
                        <span
                            className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full font-bricolage"
                            style={{
                                backgroundColor: `${theme.color}10`,
                                color: theme.color
                            }}
                        >
                            {route.distanceKm}KM • {route.durationText}
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <button
                        onClick={onCalculateDistance}
                        className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/30 transition-all group/btn gap-2 hover:bg-[var(--theme-color)]/10`}
                        style={{ '--theme-color': theme.color }}
                    >
                        <Navigation className="w-5 h-5 opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100 transition-all" />
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100">
                            {loadingRoute ? '...' : 'Rota'}
                        </span>
                    </button>

                    <button
                        onClick={onOpenUber}
                        className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/30 transition-all group/btn gap-2 hover:bg-[var(--theme-color)]/10`}
                        style={{ '--theme-color': theme.color }}
                    >
                        <Car className="w-5 h-5 opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100 transition-all" />
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100">
                            {uberPrice ? uberPrice.formatted : 'Uber'}
                        </span>
                    </button>

                    <button
                        onClick={onOpenMaps}
                        className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/30 transition-all group/btn gap-2 hover:bg-[var(--theme-color)]/10`}
                        style={{ '--theme-color': theme.color }}
                    >
                        <Bus className="w-5 h-5 opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100 transition-all" />
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-60 text-[var(--theme-color)] group-hover/btn:opacity-100">Bus</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-4 border-t border-border/10">
            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={onCalculateDistance}
                    className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/10 transition-all group/btn gap-1 hover:bg-[var(--theme-color)]/10 hover:text-[var(--theme-color)]`}
                    style={{ '--theme-color': theme.color }}
                >
                    <Navigation className="w-4 h-4 opacity-40 group-hover/btn:opacity-100 transition-all" />
                    <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover/btn:opacity-100">
                        {loadingRoute ? '...' : 'Rota'}
                    </span>
                </button>

                <button
                    onClick={onOpenUber}
                    className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/10 transition-all group/btn gap-1 hover:bg-[var(--theme-color)]/10 hover:text-[var(--theme-color)]`}
                    style={{ '--theme-color': theme.color }}
                >
                    <Car className="w-4 h-4 opacity-40 group-hover/btn:opacity-100 transition-all" />
                    <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover/btn:opacity-100">
                        {uberPrice ? uberPrice.formatted : 'Uber'}
                    </span>
                </button>

                <button
                    onClick={onOpenMaps}
                    className={`flex flex-col items-center justify-center py-4 rounded-3xl bg-muted/10 transition-all group/btn gap-1 hover:bg-[var(--theme-color)]/10 hover:text-[var(--theme-color)]`}
                    style={{ '--theme-color': theme.color }}
                >
                    <Bus className="w-4 h-4 opacity-40 group-hover/btn:opacity-100 transition-all" />
                    <span className="text-[7px] font-black uppercase tracking-widest opacity-40 group-hover/btn:opacity-100">Bus</span>
                </button>
            </div>
        </div>
    );
};

export default BlockCardActions;
