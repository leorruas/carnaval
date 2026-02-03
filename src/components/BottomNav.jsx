import { Home, Calendar, Map, User } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const BottomNav = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', icon: Home },
    { path: '/agenda', icon: Calendar },
    { path: '/mapa', icon: Map },
    { path: '/perfil', icon: User },
  ];

  return (
    <nav className="fixed bottom-6 left-6 right-6 mx-auto max-w-sm bg-background/80 backdrop-blur-2xl border border-border/40 rounded-full z-50 overflow-hidden shadow-2xl">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ path, icon: Icon }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className="relative group flex items-center justify-center flex-1 h-full transition-all duration-300"
            >
              <div className="relative z-10 p-2">
                <Icon
                  className={`w-5 h-5 transition-all duration-300 ${isActive ? 'text-primary stroke-[2.5px]' : 'text-muted-foreground group-hover:text-primary stroke-[1.5px]'
                    }`}
                />
              </div>

              {isActive && (
                <motion.div
                  layoutId="bottom-nav-bg"
                  className="absolute inset-y-2 inset-x-1 bg-primary/10 rounded-full border border-primary/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
