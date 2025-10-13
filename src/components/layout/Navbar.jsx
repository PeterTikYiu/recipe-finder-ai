import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Heart, Calculator, Menu, X, UtensilsCrossed, Star, User } from 'lucide-react';
import { cn } from '../../utils/helpers';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/favorites', label: 'Favorites', icon: Heart },
  { to: '/calculator', label: 'AI Calculator', icon: Calculator },
  { to: '/recommended', label: 'Recommended', icon: Star },
  { to: '/profile', label: 'Profile', icon: User },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const NavLinkItem = (props) => (
    <NavLink
      to={props.to}
      className={({ isActive }) =>
        cn(
          'nav-link',
          isActive ? 'active' : ''
        )
      }
      onClick={props.onClick}
    >
      <props.icon className="h-5 w-5" />
      <span className="hidden md:inline">{props.label}</span>
    </NavLink>
  );

  return (
    <nav className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 w-full border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <UtensilsCrossed className="h-7 w-7 text-primary-500" />
            <span className="text-gradient">RecipeAI</span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <NavLinkItem key={item.to} {...item} />
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="btn-ghost p-2 rounded-md"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden animate-in px-4 pb-4 space-y-2">
          {navItems.map((item) => (
            <NavLinkItem
              key={item.to}
              {...item}
              onClick={() => setIsOpen(false)}
            />
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
