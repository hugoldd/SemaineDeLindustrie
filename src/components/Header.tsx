import { useState } from 'react';
import { Menu, X, Factory } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <div className="bg-[#2C5F8D] p-2 rounded-lg">
              <Factory className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <div className="font-bold text-[#2D3748] text-base md:text-lg leading-tight">
                Semaine de l'Industrie
              </div>
              <div className="text-xs text-gray-500 hidden sm:block">
                Decouvrez l'industrie de demain
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link 
              to="/" 
              className={`hover:text-[#FF6B35] transition-colors ${isActive('/') ? 'text-[#FF6B35]' : 'text-[#2D3748]'}`}
            >
              Decouvrir
            </Link>
            <Link 
              to="/map" 
              className={`hover:text-[#FF6B35] transition-colors ${isActive('/map') ? 'text-[#FF6B35]' : 'text-[#2D3748]'}`}
            >
              Entreprises
            </Link>
            <a href="#how-it-works" className="text-[#2D3748] hover:text-[#FF6B35] transition-colors">
              Comment ca marche
            </a>
            <Link to="/login" className="text-[#2D3748] hover:text-[#FF6B35] transition-colors">
              Connexion
            </Link>
            <button className="bg-[#FF6B35] text-white px-6 py-2.5 rounded-lg hover:bg-[#E85A2A] transition-colors">
              Inscription
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#2D3748]"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="lg:hidden pb-4 border-t mt-2 pt-4 space-y-3">
            <Link 
              to="/" 
              className={`block py-2 ${isActive('/') ? 'text-[#FF6B35]' : 'text-[#2D3748]'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Decouvrir
            </Link>
            <Link 
              to="/map" 
              className={`block py-2 ${isActive('/map') ? 'text-[#FF6B35]' : 'text-[#2D3748]'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Entreprises
            </Link>
            <a href="#how-it-works" className="block py-2 text-[#2D3748]">
              Comment ca marche
            </a>
            <Link to="/login" className="block w-full text-left py-2 text-[#2D3748]">
              Connexion
            </Link>
            <button className="block w-full bg-[#FF6B35] text-white px-6 py-2.5 rounded-lg">
              Inscription
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
