import { Factory, Mail, Phone, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-[#2D3748] text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#FF6B35] p-2 rounded-lg">
                <Factory className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg">Semaine de l'Industrie</span>
            </div>
            <p className="text-gray-300 text-sm">
              Découvrez les métiers et les innovations de l'industrie française. 
              Une initiative pour rapprocher les jeunes du monde industriel.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h3 className="font-semibold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-[#FF6B35] transition-colors">Accueil</Link></li>
              <li><Link to="/map" className="hover:text-[#FF6B35] transition-colors">Carte des entreprises</Link></li>
              <li><a href="#how-it-works" className="hover:text-[#FF6B35] transition-colors">Comment ça marche</a></li>
              <li><a href="#" className="hover:text-[#FF6B35] transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-[#FF6B35] transition-colors">Espace entreprise</a></li>
            </ul>
          </div>

          {/* Informations légales */}
          <div>
            <h3 className="font-semibold mb-4">Informations légales</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-[#FF6B35] transition-colors">Mentions légales</a></li>
              <li><a href="#" className="hover:text-[#FF6B35] transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="hover:text-[#FF6B35] transition-colors">CGU</a></li>
              <li><a href="#" className="hover:text-[#FF6B35] transition-colors">Accessibilité</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:contact@semaine-industrie.fr" className="hover:text-[#FF6B35] transition-colors">
                  contact@semaine-industrie.fr
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <a href="tel:0800123456" className="hover:text-[#FF6B35] transition-colors">
                  0800 123 456
                </a>
              </li>
            </ul>
            
            {/* Social Media */}
            <div className="mt-6">
              <h4 className="font-semibold mb-3 text-sm">Suivez-nous</h4>
              <div className="flex gap-3">
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-[#FF6B35] transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-[#FF6B35] transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-[#FF6B35] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="bg-white/10 p-2 rounded-lg hover:bg-[#FF6B35] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2026 Semaine de l'Industrie. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
