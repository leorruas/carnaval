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
    <nav className="fixed bottom-0 left-0 right-0 mx-auto max-w-md bg-white border-t border-gray-100 shadow-xl z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-all ${isActive
                ? 'text-carnival-purple'
                : 'text-gray-500 hover:text-carnival-purple'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-2' : ''}`} />
                <span className={`text-xs ${isActive ? 'font-bold' : ''}`}>
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
