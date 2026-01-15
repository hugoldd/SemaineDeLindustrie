import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Heart, 
  Share2, 
  Clock, 
  Users, 
  Calendar,
  HardHat,
  Shield,
  Accessibility,
  Phone,
  Mail,
  Navigation,
  CheckCircle,
  X
} from 'lucide-react';
import { RegistrationModal } from '../components/RegistrationModal';
import { fetchCompanyById, type UiCompany, type UiVisit } from '../lib/data/companies';

type TabType = 'presentation' | 'visits' | 'practical' | 'gallery';

export function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<UiCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('presentation');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState<UiVisit | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError(null);
        const data = await fetchCompanyById(id);
        if (!isMounted) {
          return;
        }
        setCompany(data);
      } catch (error) {
        if (isMounted) {
          setLoadError('Erreur de chargement de la fiche entreprise.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2D3748] mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">{loadError}</p>
          <Link to="/map" className="text-[#FF6B35] hover:underline">
            Retour a la carte
          </Link>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#2D3748] mb-4">Entreprise non trouvee</h2>
          <Link to="/map" className="text-[#FF6B35] hover:underline">
            Retour a la carte
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const handleRegister = (visit: UiVisit) => {
    setSelectedVisit(visit);
    setRegistrationModalOpen(true);
  };

  const tabs = [
    { id: 'presentation' as TabType, label: 'Présentation' },
    { id: 'visits' as TabType, label: 'Visites disponibles' },
    { id: 'practical' as TabType, label: 'Infos pratiques' },
    { id: 'gallery' as TabType, label: 'Galerie' },
  ];

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Header with Banner */}
      <div className="relative h-64 md:h-96 bg-gray-900">
        <img 
          src={company.banner} 
          alt={company.name}
          className="w-full h-full object-cover opacity-80"
        />
        
        {/* Back Button */}
        <Link
          to="/map"
          className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Retour</span>
        </Link>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`bg-white/90 backdrop-blur-sm p-3 rounded-lg transition-colors ${
              isFavorite ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          <button className="bg-white/90 backdrop-blur-sm p-3 rounded-lg hover:bg-white transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Company Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-8">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
              <div className="bg-white p-2 rounded-lg shadow-lg">
                <img 
                  src={company.logo} 
                  alt={`${company.name} logo`}
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                />
              </div>
              <div className="flex-1 text-white">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-4xl">{company.name}</h1>
                  {company.thematicName && (
                    <span 
                      className="px-3 py-1 rounded-full text-white text-sm font-medium"
                      style={{ backgroundColor: company.thematicColor }}
                    >
                      {company.thematicName}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-200">
                  <MapPin className="w-5 h-5" />
                  <span>{company.city}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-gray-600 hover:text-[#2C5F8D]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Presentation Tab */}
        {activeTab === 'presentation' && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-md">
              <h2 className="mb-4 text-[#2D3748]">À propos</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                {company.description}
              </p>

              <h3 className="mb-4 text-[#2D3748]">Ce que vous découvrirez</h3>
              <ul className="space-y-3">
                {company.whatYouWillDiscover.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#34A853] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-xl p-6 md:p-8 shadow-md">
              <h3 className="mb-4 text-[#2D3748]">Métiers présentés</h3>
              <div className="flex flex-wrap gap-2">
                {company.jobs.map((job, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-[#F7FAFC] text-[#2D3748] rounded-full text-sm border border-gray-200"
                  >
                    {job}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Visits Tab */}
        {activeTab === 'visits' && (
          <div className="max-w-4xl mx-auto">
            {company.visits.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-md">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucune visite disponible pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {company.visits
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map(visit => {
                    const availableSpots = visit.capacity - visit.registered;
                    const isFull = availableSpots <= 0;
                    const capacityPercentage = (visit.registered / visit.capacity) * 100;

                    return (
                      <div key={visit.id} className="bg-white rounded-xl p-6 shadow-md">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <div className="text-2xl font-bold text-[#2C5F8D]">
                                {formatDate(visit.date)}
                              </div>
                              <span className="px-3 py-1 bg-[#F7FAFC] text-gray-700 rounded-full text-sm">
                                {visit.type}
                              </span>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Clock className="w-5 h-5" />
                                <span>{visit.time} ({visit.duration} min)</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="w-5 h-5" />
                                <span>{visit.capacity} places</span>
                              </div>
                              <div className={`flex items-center gap-2 font-medium ${
                                isFull ? 'text-red-500' : 'text-[#34A853]'
                              }`}>
                                <span>
                                  {isFull ? 'Complet' : `${availableSpots} place${availableSpots > 1 ? 's' : ''} restante${availableSpots > 1 ? 's' : ''}`}
                                </span>
                              </div>
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

                          <button
                            disabled={isFull}
                            onClick={() => handleRegister(visit)}
                            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                              isFull
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-[#34A853] text-white hover:bg-[#2d8e45]'
                            }`}
                          >
                            {isFull ? 'Complet' : 'S\'inscrire'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Practical Info Tab */}
        {activeTab === 'practical' && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Address & Map */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-md">
              <h3 className="mb-4 text-[#2D3748] flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#FF6B35]" />
                Adresse
              </h3>
              <p className="text-gray-700 mb-4">
                {company.address}<br />
                {company.postalCode} {company.city}
              </p>
              <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address + ' ' + company.city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#2C5F8D] hover:text-[#1e4161]"
              >
                <Navigation className="w-5 h-5" />
                Obtenir l'itinéraire
              </a>
            </div>

            {/* Safety */}
            {company.safety.length > 0 && (
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-md">
                <h3 className="mb-4 text-[#2D3748] flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#FF6B35]" />
                  Mesures de sécurité
                </h3>
                <ul className="space-y-2">
                  {company.safety.map((item, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <HardHat className="w-5 h-5 text-[#FF6B35]" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Equipment */}
            <div className="grid md:grid-cols-2 gap-6">
              {company.equipmentProvided.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="mb-4 text-[#2D3748]">Équipement fourni</h3>
                  <ul className="space-y-2">
                    {company.equipmentProvided.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-[#34A853]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {company.equipmentToBring.length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h3 className="mb-4 text-[#2D3748]">À apporter</h3>
                  <ul className="space-y-2">
                    {company.equipmentToBring.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-[#FF6B35]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Accessibility */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-md">
              <h3 className="mb-4 text-[#2D3748] flex items-center gap-2">
                <Accessibility className="w-6 h-6 text-[#FF6B35]" />
                Accessibilité
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  {company.accessibility.pmr ? (
                    <CheckCircle className="w-5 h-5 text-[#34A853]" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-gray-700">Accessible PMR</span>
                </div>
                <div className="flex items-center gap-3">
                  {company.accessibility.parking ? (
                    <CheckCircle className="w-5 h-5 text-[#34A853]" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                  <span className="text-gray-700">Parking disponible</span>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl p-6 md:p-8 shadow-md">
              <h3 className="mb-4 text-[#2D3748]">Contact référent</h3>
              <div className="space-y-3">
                <div className="font-medium text-gray-900">{company.contact.name}</div>
                <a 
                  href={`mailto:${company.contact.email}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-[#2C5F8D]"
                >
                  <Mail className="w-5 h-5" />
                  {company.contact.email}
                </a>
                <a 
                  href={`tel:${company.contact.phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-gray-700 hover:text-[#2C5F8D]"
                >
                  <Phone className="w-5 h-5" />
                  {company.contact.phone}
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.photos.map((photo, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImage(photo)}
                  className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                >
                  <img
                    src={photo}
                    alt={`${company.name} - Photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>

            {company.photos.length === 0 && (
              <div className="bg-white rounded-xl p-12 text-center shadow-md">
                <p className="text-gray-600">Aucune photo disponible</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Registration Modal */}
      {selectedVisit && (
        <RegistrationModal
          isOpen={registrationModalOpen}
          onClose={() => {
            setRegistrationModalOpen(false);
            setSelectedVisit(null);
          }}
          visit={selectedVisit}
          company={company}
        />
      )}
    </div>
  );
}

