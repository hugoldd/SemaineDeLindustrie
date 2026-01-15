import { useState, useMemo, useEffect } from 'react';
import { Filter, X, MapPin as MapPinIcon, List, RotateCcw, Search } from 'lucide-react';
import { CompanyCard } from '../components/CompanyCard';
import { MapView } from '../components/MapView';
import { fetchThemesAndCompanies, type UiCompany, type UiTheme } from '../lib/data/companies';

type ViewMode = 'map' | 'list' | 'split';

export function Map() {
  const [companies, setCompanies] = useState<UiCompany[]>([]);
  const [themes, setThemes] = useState<UiTheme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedThematics, setSelectedThematics] = useState<string[]>([]);
  const [maxDistance, setMaxDistance] = useState(100);
  const [postalCode, setPostalCode] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyPMR, setOnlyPMR] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'distance' | 'date' | 'places'>('relevance');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const { themes: loadedThemes, companies: loadedCompanies } = await fetchThemesAndCompanies();
        if (!isMounted) {
          return;
        }
        setThemes(loadedThemes);
        setCompanies(loadedCompanies);
      } catch (error) {
        if (isMounted) {
          setLoadError('Erreur de chargement des entreprises.');
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
  }, []);

  const toggleThematic = (thematicId: string) => {
    setSelectedThematics(prev => 
      prev.includes(thematicId) 
        ? prev.filter(id => id !== thematicId)
        : [...prev, thematicId]
    );
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedThematics([]);
    setMaxDistance(100);
    setPostalCode('');
    setOnlyAvailable(false);
    setOnlyPMR(false);
  };

  const filteredCompanies = useMemo(() => {
    let filtered = [...companies];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(company => 
        company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.city.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Thematic filter
    if (selectedThematics.length > 0) {
      filtered = filtered.filter(company => 
        selectedThematics.includes(company.thematic)
      );
    }

    // Available spots filter
    if (onlyAvailable) {
      filtered = filtered.filter(company => 
        company.visits.some(visit => visit.registered < visit.capacity)
      );
    }

    // PMR filter
    if (onlyPMR) {
      filtered = filtered.filter(company => company.accessibility.pmr);
    }

    // Sorting
    if (sortBy === 'date') {
      filtered.sort((a, b) => {
        const aDate = a.visits.length > 0 ? new Date(a.visits[0].date).getTime() : Infinity;
        const bDate = b.visits.length > 0 ? new Date(b.visits[0].date).getTime() : Infinity;
        return aDate - bDate;
      });
    } else if (sortBy === 'places') {
      filtered.sort((a, b) => {
        const aPlaces = a.visits.reduce((sum, v) => sum + (v.capacity - v.registered), 0);
        const bPlaces = b.visits.reduce((sum, v) => sum + (v.capacity - v.registered), 0);
        return bPlaces - aPlaces;
      });
    }

    return filtered;
  }, [companies, searchQuery, selectedThematics, onlyAvailable, onlyPMR, sortBy]);

  const activeFiltersCount = 
    (searchQuery ? 1 : 0) +
    selectedThematics.length +
    (onlyAvailable ? 1 : 0) +
    (onlyPMR ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      {/* Mobile View Tabs */}
      <div className="lg:hidden bg-white border-b sticky top-0 z-40">
        <div className="flex">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 ${
              viewMode === 'list' ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' : 'text-gray-600'
            }`}
          >
            <List className="w-5 h-5" />
            Liste
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 ${
              viewMode === 'map' ? 'text-[#FF6B35] border-b-2 border-[#FF6B35]' : 'text-gray-600'
            }`}
          >
            <MapPinIcon className="w-5 h-5" />
            Carte
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-64px)] lg:h-[calc(100vh-80px)]">
        {/* Filters & List Panel */}
        <div className={`
          ${viewMode === 'map' ? 'hidden lg:flex' : 'flex'}
          ${viewMode === 'list' ? 'w-full' : 'w-full lg:w-2/5'}
          flex-col bg-white border-r overflow-hidden
        `}>
          {/* Filters Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#2D3748]">Filtres</h2>
              <button
                onClick={resetFilters}
                className="text-sm text-[#FF6B35] hover:text-[#E85A2A] flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Réinitialiser
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher une entreprise ou ville..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>

            {/* Collapsible Filters Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between py-2.5 px-4 bg-[#F7FAFC] rounded-lg"
            >
              <span className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtres avancés
                {activeFiltersCount > 0 && (
                  <span className="bg-[#FF6B35] text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </span>
              <X className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-0' : 'rotate-45'}`} />
            </button>
          </div>

          {/* Filters Content */}
          <div className={`
            ${showFilters ? 'block' : 'hidden lg:block'}
            p-4 border-b space-y-4 overflow-y-auto
          `}>
            {/* Thematics */}
            <div>
              <h3 className="font-medium text-[#2D3748] mb-3 text-sm">Secteurs d'activité</h3>
              <div className="space-y-2">
                {themes.map((theme) => (
                  <label key={theme.id} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedThematics.includes(theme.id)}
                      onChange={() => toggleThematic(theme.id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="text-sm text-gray-700">{theme.name}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Distance (if postal code provided) */}
            <div>
              <h3 className="font-medium text-[#2D3748] mb-3 text-sm">Code postal</h3>
              <input
                type="text"
                placeholder="Ex: 75001"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35] text-sm"
              />
            </div>

            {postalCode && (
              <div>
                <h3 className="font-medium text-[#2D3748] mb-3 text-sm">
                  Distance max: {maxDistance} km
                </h3>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                  className="w-full accent-[#FF6B35]"
                />
              </div>
            )}

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Places disponibles uniquement</span>
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(e) => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-gray-700">Accessible PMR</span>
                <input
                  type="checkbox"
                  checked={onlyPMR}
                  onChange={(e) => setOnlyPMR(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#FF6B35] focus:ring-[#FF6B35]"
                />
              </label>
            </div>
          </div>

          {/* Results Header */}
          <div className="p-4 border-b flex items-center justify-between bg-white">
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-[#2C5F8D]">{filteredCompanies.length}</span> entreprise(s)
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
            >
              <option value="relevance">Pertinence</option>
              <option value="distance">Distance</option>
              <option value="date">Date</option>
              <option value="places">Places disponibles</option>
            </select>
          </div>

          {/* Companies List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {loadError}
              </div>
            )}
            {isLoading ? (
              <div className="text-center py-12 text-gray-600">Chargement...</div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-12">
                <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Aucune entreprise ne correspond Çÿ vos critères</p>
              </div>
            ) : (
              filteredCompanies.map(company => (
                <div 
                  key={company.id}
                  onMouseEnter={() => setSelectedCompanyId(company.id)}
                  onMouseLeave={() => setSelectedCompanyId(null)}
                >
                  <CompanyCard company={company} />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map Panel */}
        <div className={`
          ${viewMode === 'list' ? 'hidden lg:block' : 'block'}
          ${viewMode === 'map' ? 'w-full' : 'hidden lg:block lg:w-3/5'}
          relative
        `}>
          <MapView 
            companies={filteredCompanies} 
            themes={themes}
            selectedCompanyId={selectedCompanyId}
            onCompanySelect={setSelectedCompanyId}
          />
        </div>
      </div>
    </div>
  );
}

