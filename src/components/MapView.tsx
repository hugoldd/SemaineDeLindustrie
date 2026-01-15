import { useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UiCompany, UiTheme } from '../lib/data/companies';

interface MapViewProps {
  companies: UiCompany[];
  themes: UiTheme[];
  selectedCompanyId: string | null;
  onCompanySelect: (id: string | null) => void;
}

export function MapView({ companies, themes, selectedCompanyId, onCompanySelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  // Simple map simulation - in a real app, use Mapbox or Leaflet
  return (
    <div ref={mapRef} className="relative w-full h-full bg-gray-100">
      {/* Map Background - simplified representation */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
        {/* Grid lines for map effect */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Map Pins */}
        <div className="absolute inset-0 overflow-hidden">
          {companies.map((company, index) => {
            // Position pins semi-randomly but consistently
            const top = 15 + (index * 17) % 70;
            const left = 10 + (index * 23) % 80;
            const isSelected = selectedCompanyId === company.id;

            return (
              <div
                key={company.id}
                className={`absolute transition-all duration-300 ${isSelected ? 'z-50 scale-125' : 'z-10'}`}
                style={{ 
                  top: `${top}%`, 
                  left: `${left}%`,
                  transform: 'translate(-50%, -100%)'
                }}
                onMouseEnter={() => onCompanySelect(company.id)}
                onMouseLeave={() => onCompanySelect(null)}
              >
                {/* Pin */}
                <div className="relative cursor-pointer group">
                  <svg
                    width="40"
                    height="50"
                    viewBox="0 0 40 50"
                    className="drop-shadow-lg"
                  >
                    <path
                      d="M20 0C8.954 0 0 8.954 0 20c0 11.046 20 30 20 30s20-18.954 20-30C40 8.954 31.046 0 20 0z"
                      fill={company.thematicColor || '#2C5F8D'}
                    />
                    <circle cx="20" cy="20" r="8" fill="white" />
                  </svg>

                  {/* Popup on hover */}
                  {isSelected && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-white rounded-lg shadow-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex items-start gap-3">
                        <img 
                          src={company.logo} 
                          alt={company.name}
                          className="w-12 h-12 object-contain rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-[#2D3748] mb-1 truncate">
                            {company.name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {company.city}
                          </p>
                          <Link
                            to={`/company/${company.id}`}
                            className="inline-block text-sm bg-[#2C5F8D] text-white px-4 py-1.5 rounded hover:bg-[#1e4161] transition-colors"
                          >
                            Voir la fiche
                          </Link>
                        </div>
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                        <div className="border-8 border-transparent border-t-white" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button 
            className="bg-white p-3 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            title="Me géolocaliser"
          >
            <Navigation className="w-5 h-5 text-[#2C5F8D]" />
          </button>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <button className="p-3 hover:bg-gray-50 border-b w-full text-[#2C5F8D] font-bold">
              +
            </button>
            <button className="p-3 hover:bg-gray-50 w-full text-[#2C5F8D] font-bold">
              -
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 max-w-xs">
          <h4 className="font-semibold text-[#2D3748] mb-3 text-sm">Légende</h4>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((theme) => (
              <div key={theme.id} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: theme.color }}
                />
                <span className="text-xs text-gray-700">{theme.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Company Count Badge */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF6B35]" />
            <span className="font-semibold text-[#2D3748]">
              {companies.length} entreprise{companies.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
