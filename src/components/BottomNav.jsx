import { Home, Calendar, Map, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const BottomNav = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Blocos' },
    { path: '/agenda', icon: Calendar, label: 'Agenda' },
    { path: '/mapa', icon: Map, label: 'Mapa' },
    { path: '/perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-6 left-6 right-6 mx-auto max-w-sm bg-background/80 backdrop-blur-2xl border border-border/40 rounded-full shadow-2xl z-50 overflow-hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `group flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 ${isActive
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10' : 'group-hover:bg-muted'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 transition-all ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
