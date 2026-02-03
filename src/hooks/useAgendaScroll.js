import { useScroll, useTransform } from 'framer-motion';

export const useAgendaScroll = () => {
    const { scrollY } = useScroll();
    const headerHeight = useTransform(scrollY, [0, 100], [160, 100], { clamp: true });
    const headerPadding = useTransform(scrollY, [0, 100], [64, 24], { clamp: true });
    const logoScale = useTransform(scrollY, [0, 100], [1, 0.8], { clamp: true });

    return { scrollY, headerHeight, headerPadding, logoScale };
};
