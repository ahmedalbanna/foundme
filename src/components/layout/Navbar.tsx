import { Link, useNavigate } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { useAuthState } from '@/hooks/useAuthState';
import { LogOut, ShoppingBag, Search, User, Menu, X, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user } = useAuthState();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navLinks = [
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Rare Collection', path: '/marketplace?rare=true' },
    { name: 'Celebrity Looks', path: '/celebrity-looks', icon: <Sparkles className="w-4 h-4 inline mr-1 text-purple-500" /> },
    { name: 'Virtual Try-On', path: '/try-on', icon: <Sparkles className="w-4 h-4 inline mr-1 text-fuchsia-500" /> },
  ];

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-500">
                FOUND ME.
              </span>
            </Link>
            <div className="hidden md:ml-8 md:flex md:space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-700 hover:text-black transition-colors"
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700">
              <Search className="w-5 h-5" />
            </button>
            <Link to="/marketplace?favorites=true" className="text-gray-500 hover:text-gray-700">
              <ShoppingBag className="w-5 h-5" />
            </Link>
            {user ? (
              <div className="flex items-center space-x-4">
                <Link to="/closet" className="text-sm font-medium text-gray-700 hover:text-black">
                  My Closet
                </Link>
                <div className="relative group">
                  <button className="flex items-center text-gray-500 hover:text-gray-700">
                    <User className="w-5 h-5" />
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Profile</Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Orders</Link>
                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-black hover:bg-gray-800 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t">
          <div className="pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-1">
                <Link to="/closet" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">My Closet</Link>
                <Link to="/profile" className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100">Profile</Link>
                <button onClick={() => { handleSignOut(); setIsMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-gray-100">Sign Out</button>
              </div>
            ) : (
              <div className="px-4 py-3">
                <Link
                  to="/login"
                  className="block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
