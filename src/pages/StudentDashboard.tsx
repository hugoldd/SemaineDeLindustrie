import { useState, useEffect } from 'react';
import { Calendar, Heart, User, Download, QrCode, Clock, X, Trash2 } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { CompanyCard } from '../components/CompanyCard';
import { supabase } from '../lib/supabase';
import { fetchCompaniesByIds, type UiCompany } from '../lib/data/companies';

type TabType = 'upcoming' | 'past';

type Reservation = {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  type: string;
  registrationType: 'individual' | 'group';
  studentCount?: number;
  qrCode?: string;
  instructions?: string;
};

export function StudentDashboard() {
  const [activeView, setActiveView] = useState<'reservations' | 'favorites' | 'profile'>('reservations');
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [favoriteCompanies, setFavoriteCompanies] = useState<UiCompany[]>([]);
  const [favoriteCompanyIds, setFavoriteCompanyIds] = useState<string[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const { data: userResult } = await supabase.auth.getUser();
      const user = userResult.user;

      if (!user) {
        if (isMounted) {
          setReservations([]);
          setFavoriteCompanies([]);
          setFavoriteCompanyIds([]);
          setCurrentUserId(null);
        }
        return;
      }

      setCurrentUserId(user.id);

      const { data: bookingRows } = await supabase
        .from('bookings')
        .select(`
          id,
          status,
          booking_type,
          number_of_participants,
          time_slots:time_slot_id (
            id,
            start_datetime,
            end_datetime,
            visit_type,
            company_id,
            companies:company_id (
              id,
              name,
              logo_url
            )
          )
        `)
        .eq('user_id', user.id);

      if (isMounted) {
        const mappedReservations = (bookingRows ?? []).map((row: any) => {
          const slot = row.time_slots;
          const company = slot?.companies;
          const start = slot?.start_datetime ? new Date(slot.start_datetime) : new Date();
          const end = slot?.end_datetime ? new Date(slot.end_datetime) : start;
          const duration = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
          const status = row.status === 'confirmed' ? 'confirmed' : row.status === 'pending' ? 'pending' : 'cancelled';

          return {
            id: row.id,
            companyId: slot?.company_id ?? '',
            companyName: company?.name ?? 'Company',
            companyLogo: company?.logo_url ?? 'https://placehold.co/200x200?text=Logo',
            date: start.toISOString().slice(0, 10),
            time: start.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            duration,
            status,
            type: slot?.visit_type ?? 'Visit',
            registrationType: row.booking_type ?? 'individual',
            studentCount: row.booking_type === 'group' ? row.number_of_participants : undefined,
          } as Reservation;
        });

        setReservations(mappedReservations);
      }

      const { data: favoriteRows } = await supabase
        .from('favorites')
        .select('company_id')
        .eq('user_id', user.id);

      const favoriteIds = (favoriteRows ?? []).map((row) => row.company_id);

      if (isMounted) {
        setFavoriteCompanyIds(favoriteIds);
      }

      if (favoriteIds.length > 0) {
        const companies = await fetchCompaniesByIds(favoriteIds);
        if (isMounted) {
          setFavoriteCompanies(companies);
        }
      } else if (isMounted) {
        setFavoriteCompanies([]);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  const menuItems = [
    {
      path: '/student-dashboard',
      label: 'Mes réservations',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      path: '/student-dashboard/favorites',
      label: 'Mes favoris',
      icon: <Heart className="w-5 h-5" />,
    },
    {
      path: '/student-dashboard/profile',
      icon: <User className="w-5 h-5" />,
      label: 'Mon profil',
    },
  ];

  const today = new Date();
  const upcomingReservations = reservations.filter(
    res => new Date(res.date) >= today && res.status !== 'cancelled'
  );
  const pastReservations = reservations.filter(
    res => new Date(res.date) < today || res.status === 'cancelled'
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const canCancel = (reservation: Reservation) => {
    const visitDate = new Date(reservation.date);
    const hoursUntilVisit = (visitDate.getTime() - today.getTime()) / (1000 * 60 * 60);
    return hoursUntilVisit >= 48 && reservation.status === 'confirmed';
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-3 py-1 bg-[#34A853] text-white text-sm rounded-full">Confirmée</span>;
      case 'pending':
        return <span className="px-3 py-1 bg-[#FF6B35] text-white text-sm rounded-full">En attente</span>;
      case 'cancelled':
        return <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full">Annulée</span>;
    }
  };

  const removeFavorite = async (companyId: string) => {
    setFavoriteCompanyIds(prev => prev.filter(id => id !== companyId));
    setFavoriteCompanies(prev => prev.filter(company => company.id !== companyId));

    if (!currentUserId) {
      return;
    }

    await supabase
      .from('favorites')
      .delete()
      .match({ user_id: currentUserId, company_id: companyId });
  };

  return (
    <DashboardLayout menuItems={menuItems} userType="student">
      <div className="p-4 md:p-8">
        {/* Reservations View */}
        {activeView === 'reservations' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2D3748] mb-2">
                Mes réservations
              </h1>
              <p className="text-gray-600">Gérez vos visites d'entreprises</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b mb-6">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-gray-600 hover:text-[#2C5F8D]'
                }`}
              >
                À venir ({upcomingReservations.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`pb-3 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === 'past'
                    ? 'border-[#FF6B35] text-[#FF6B35]'
                    : 'border-transparent text-gray-600 hover:text-[#2C5F8D]'
                }`}
              >
                Passées ({pastReservations.length})
              </button>
            </div>

            {/* Reservations List */}
            <div className="space-y-4">
              {(activeTab === 'upcoming' ? upcomingReservations : pastReservations).length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-md">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-[#2D3748] mb-2">
                    {activeTab === 'upcoming' 
                      ? 'Aucune réservation Çÿ venir' 
                      : 'Aucune réservation passée'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {activeTab === 'upcoming' 
                      ? 'Explorez les entreprises et réservez votre première visite !' 
                      : 'Vos visites passées apparaîtront ici.'}
                  </p>
                  {activeTab === 'upcoming' && (
                    <a
                      href="/map"
                      className="inline-block bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#E85A2A] transition-colors"
                    >
                      Découvrir les entreprises
                    </a>
                  )}
                </div>
              ) : (
                (activeTab === 'upcoming' ? upcomingReservations : pastReservations).map(reservation => (
                  <div key={reservation.id} className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Company Logo */}
                      <div className="flex-shrink-0">
                        <img
                          src={reservation.companyLogo}
                          alt={reservation.companyName}
                          className="w-16 h-16 object-contain rounded-lg"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-[#2D3748] mb-1">
                              {reservation.companyName}
                            </h3>
                            <p className="text-sm text-gray-600">{reservation.type}</p>
                          </div>
                          {getStatusBadge(reservation.status)}
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(reservation.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{reservation.time} ({reservation.duration} min)</span>
                          </div>
                        </div>

                        {reservation.registrationType === 'group' && (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full mb-4">
                            Inscription groupe ({reservation.studentCount} élèves)
                          </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => setSelectedReservation(reservation)}
                            className="px-4 py-2 bg-[#2C5F8D] text-white rounded-lg hover:bg-[#1e4161] transition-colors text-sm"
                          >
                            Voir les détails
                          </button>
                          {canCancel(reservation) && (
                            <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm">
                              Annuler
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Favorites View */}
        {activeView === 'favorites' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2D3748] mb-2">
                Mes favoris
              </h1>
              <p className="text-gray-600">
                {favoriteCompanies.length} entreprise{favoriteCompanies.length > 1 ? 's' : ''} en favoris
              </p>
            </div>

            {favoriteCompanies.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center shadow-md">
                <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-[#2D3748] mb-2">
                  Aucun favori
                </h3>
                <p className="text-gray-600 mb-6">
                  Ajoutez des entreprises Çÿ vos favoris pour les retrouver facilement.
                </p>
                <a
                  href="/map"
                  className="inline-block bg-[#FF6B35] text-white px-6 py-3 rounded-lg hover:bg-[#E85A2A] transition-colors"
                >
                  Découvrir les entreprises
                </a>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteCompanies.map(company => (
                  <div key={company.id} className="relative">
                    <button
                      onClick={() => removeFavorite(company.id)}
                      className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-lg"
                      title="Retirer des favoris"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <CompanyCard company={company} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile View */}
        {activeView === 'profile' && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2D3748] mb-2">
                Mon profil
              </h1>
              <p className="text-gray-600">Gérez vos informations personnelles</p>
            </div>

            <div className="max-w-2xl">
              <div className="bg-white rounded-xl p-6 shadow-md mb-6">
                <h3 className="font-semibold text-[#2D3748] mb-4">Informations personnelles</h3>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D3748] mb-2">Prénom</label>
                      <input
                        type="text"
                        defaultValue="Lucas"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2D3748] mb-2">Nom</label>
                      <input
                        type="text"
                        defaultValue="Martin"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">Email</label>
                    <input
                      type="email"
                      defaultValue="lucas.martin@lycee.fr"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">Téléphone</label>
                    <input
                      type="tel"
                      defaultValue="06 12 34 56 78"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">Établissement</label>
                    <input
                      type="text"
                      defaultValue="Lycée Gustave Eiffel"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">Niveau</label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]">
                      <option value="seconde">Seconde</option>
                      <option value="premiere" selected>Première</option>
                      <option value="terminale">Terminale</option>
                    </select>
                  </div>
                </div>
                <button className="mt-6 px-6 py-2.5 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E85A2A] transition-colors">
                  Enregistrer les modifications
                </button>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="font-semibold text-[#2D3748] mb-4">Sécurité</h3>
                <button className="text-[#2C5F8D] hover:text-[#1e4161]">
                  Changer le mot de passe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-[#2D3748]">Détails de la réservation</h2>
              <button
                onClick={() => setSelectedReservation(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* QR Code */}
              {selectedReservation.qrCode && (
                <div className="bg-[#F7FAFC] rounded-lg p-6 text-center">
                  <div className="w-48 h-48 bg-white mx-auto mb-4 flex items-center justify-center border-2 border-gray-200 rounded-lg">
                    <QrCode className="w-32 h-32 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Présentez ce QR code Çÿ l'accueil le jour de la visite
                  </p>
                  <button className="inline-flex items-center gap-2 text-[#2C5F8D] hover:text-[#1e4161]">
                    <Download className="w-4 h-4" />
                    Télécharger le QR code
                  </button>
                </div>
              )}

              {/* Instructions */}
              {selectedReservation.instructions && (
                <div>
                  <h3 className="font-semibold text-[#2D3748] mb-3">Instructions</h3>
                  <p className="text-gray-700 bg-blue-50 p-4 rounded-lg">
                    {selectedReservation.instructions}
                  </p>
                </div>
              )}

              {/* Company Info */}
              <div>
                <h3 className="font-semibold text-[#2D3748] mb-3">Entreprise</h3>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedReservation.companyLogo}
                    alt={selectedReservation.companyName}
                    className="w-16 h-16 object-contain rounded-lg"
                  />
                  <div>
                    <div className="font-medium text-[#2D3748]">{selectedReservation.companyName}</div>
                    <a
                      href={`/company/${selectedReservation.companyId}`}
                      className="text-sm text-[#2C5F8D] hover:underline"
                    >
                      Voir la fiche complète
                    </a>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold text-[#2D3748] mb-3">Documents</h3>
                <button className="flex items-center gap-3 p-4 w-full bg-[#F7FAFC] hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-[#2C5F8D]" />
                  <div className="text-left">
                    <div className="font-medium text-[#2D3748] text-sm">Autorisation parentale</div>
                    <div className="text-xs text-gray-600">PDF - 245 Ko</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


