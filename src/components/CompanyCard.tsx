import { MapPin, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { UiCompany } from '../lib/data/companies';

interface CompanyCardProps {
  company: UiCompany;
  onClick?: () => void;
}

export function CompanyCard({ company, onClick }: CompanyCardProps) {
  const nextVisit = [...company.visits].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )[0];

  const availableSpots = nextVisit ? nextVisit.capacity - nextVisit.registered : 0;
  const capacityPercentage = nextVisit ? (nextVisit.registered / nextVisit.capacity) * 100 : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden">
      <div className="relative h-48">
        <img 
          src={company.banner} 
          alt={company.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          {company.thematicName && (
            <span 
              className="px-3 py-1 rounded-full text-white text-sm font-medium"
              style={{ backgroundColor: company.thematicColor }}
            >
              {company.thematicName}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 bg-white rounded-lg p-1 shadow-lg">
          <img 
            src={company.logo} 
            alt={`${company.name} logo`}
            className="w-12 h-12 object-contain"
          />
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-[#2D3748] mb-2">{company.name}</h3>
        
        <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
          <MapPin className="w-4 h-4" />
          <span>{company.city}</span>
        </div>

        {nextVisit && (
          <>
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(nextVisit.date)} à {nextVisit.time}</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-1 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>Places disponibles</span>
                </div>
                <span className={`font-medium ${availableSpots > 0 ? 'text-[#34A853]' : 'text-red-500'}`}>
                  {availableSpots > 0 ? `${availableSpots} / ${nextVisit.capacity}` : 'Complet'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    capacityPercentage >= 100 ? 'bg-red-500' : 
                    capacityPercentage >= 75 ? 'bg-[#FF6B35]' : 
                    'bg-[#34A853]'
                  }`}
                  style={{ width: `${Math.min(capacityPercentage, 100)}%` }}
                />
              </div>
            </div>
          </>
        )}

        <Link
          to={`/company/${company.id}`}
          className="block w-full text-center bg-[#2C5F8D] text-white py-2.5 rounded-lg hover:bg-[#1e4161] transition-colors"
        >
          Voir les détails
        </Link>
      </div>
    </div>
  );
}
