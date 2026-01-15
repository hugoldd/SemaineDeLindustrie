import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  UserCheck,
  MapPin,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Plane,
  Car,
  Zap,
  Laptop,
  Pill,
  Wheat,
} from "lucide-react";
import { fetchThemes, type UiTheme } from "../lib/data/companies";
import { supabase } from "../lib/supabase";

type StatItem = {
  number: string;
  label: string;
  icon: string;
};

type TestimonialItem = {
  name: string;
  role: string;
  school: string;
  photo: string;
  quote: string;
};

export function Home() {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [themes, setThemes] = useState<UiTheme[]>([]);
  const [stats, setStats] = useState<StatItem[]>([
    { number: "0", label: "Entreprises participantes", icon: "C" },
    { number: "0", label: "Visites organisees", icon: "V" },
    { number: "0", label: "Lyceens participants", icon: "L" },
    { number: "0", label: "Secteurs disponibles", icon: "S" },
  ]);
  const testimonials: TestimonialItem[] = [];

  const [companyRequest, setCompanyRequest] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    postal_code: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    siret: "",
    themes: "",
  });
  const [companyRequestError, setCompanyRequestError] = useState<string | null>(null);
  const [companyRequestSuccess, setCompanyRequestSuccess] = useState<string | null>(null);
  const [companyRequestLoading, setCompanyRequestLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const [themesData, companyCountResult, slotCountResult] = await Promise.all([
          fetchThemes(),
          supabase.from("companies").select("id", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("time_slots").select("id", { count: "exact", head: true }).eq("status", "open"),
        ]);

        if (!isMounted) {
          return;
        }

        setThemes(themesData);

        const companyCount = companyCountResult.count ?? 0;
        const slotCount = slotCountResult.count ?? 0;
        const userCount = 0;

        setStats([
          { number: `${companyCount}+`, label: "Entreprises participantes", icon: "C" },
          { number: `${slotCount}+`, label: "Visites organisees", icon: "V" },
          { number: `${userCount}+`, label: "Lyceens participants", icon: "L" },
          { number: `${themesData.length}+`, label: "Secteurs disponibles", icon: "S" },
        ]);
      } catch (error) {
        if (isMounted) {
          setThemes([]);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasTestimonials = testimonials.length > 0;

  const nextTestimonial = () => {
    if (!hasTestimonials) {
      return;
    }
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    if (!hasTestimonials) {
      return;
    }
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const thematicIcons: Record<string, any> = {
    aerospace: Plane,
    automotive: Car,
    energy: Zap,
    digital: Laptop,
    pharma: Pill,
    agro: Wheat,
  };

  const handleCompanyRequestSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCompanyRequestError(null);
    setCompanyRequestSuccess(null);
    setCompanyRequestLoading(true);

    try {
      const payload = {
        name: companyRequest.name.trim(),
        description: companyRequest.description.trim() || null,
        address: companyRequest.address.trim() || null,
        city: companyRequest.city.trim() || null,
        postal_code: companyRequest.postal_code.trim() || null,
        contact_name: companyRequest.contact_name.trim() || null,
        contact_email: companyRequest.contact_email.trim() || null,
        contact_phone: companyRequest.contact_phone.trim() || null,
        siret: companyRequest.siret.trim() || null,
        themes: companyRequest.themes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        status: "pending",
      };

      const { error } = await supabase.from("companies").insert(payload);

      if (error) {
        throw error;
      }

      setCompanyRequestSuccess("Demande envoyee. Un administrateur validera votre entreprise.");
      setCompanyRequest({
        name: "",
        description: "",
        address: "",
        city: "",
        postal_code: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        siret: "",
        themes: "",
      });
    } catch (err) {
      setCompanyRequestError("Impossible d'envoyer la demande.");
    } finally {
      setCompanyRequestLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="relative bg-gradient-to-br from-[#2C5F8D] to-[#1e4161] text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1615990860014-99e51245218c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBpbmR1c3RyaWFsJTIwZmFjdG9yeXxlbnwxfHx8fDE3Njg0MTM0ODl8MA&ixlib=rb-4.1.0&q=80&w=1080)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative container mx-auto px-4 py-16 md:py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl lg:text-6xl mb-6">
              Decouvrez l'industrie de demain
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-100">
              Explorez les entreprises, rencontrez des professionnels passionnes et trouvez votre voie
              dans l'industrie francaise lors de la Semaine de l'Industrie.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/map"
                className="bg-[#FF6B35] text-white px-8 py-4 rounded-lg hover:bg-[#E85A2A] transition-colors text-center flex items-center justify-center gap-2"
              >
                Je suis lyceen
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#company-request"
                className="bg-white text-[#2C5F8D] px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors text-center"
              >
                Je suis entreprise
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-[#2C5F8D] mb-2">
                  {stat.number}
                </div>
                <div className="text-sm md:text-base text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="company-request" className="bg-[#F7FAFC] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-[#2D3748] mb-4">Vous etes une entreprise ?</h2>
              <p className="text-gray-600 mb-6">
                Rejoignez la Semaine de l'Industrie pour accueillir des lyceens et partager vos
                metiers. Votre demande sera validee par un administrateur du portail.
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Mettez en avant vos visites et ateliers.</li>
                <li>• Gerer vos creneaux en autonomie.</li>
                <li>• Touchez des lyceens motives.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <h3 className="text-[#2D3748] mb-4">Demande de creation d'entreprise</h3>
              {companyRequestError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {companyRequestError}
                </div>
              )}
              {companyRequestSuccess && (
                <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                  {companyRequestSuccess}
                </div>
              )}
              <form onSubmit={handleCompanyRequestSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={companyRequest.name}
                    onChange={(event) =>
                      setCompanyRequest((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={companyRequest.description}
                    onChange={(event) =>
                      setCompanyRequest((prev) => ({ ...prev, description: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">Ville</label>
                    <input
                      type="text"
                      value={companyRequest.city}
                      onChange={(event) =>
                        setCompanyRequest((prev) => ({ ...prev, city: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">Code postal</label>
                    <input
                      type="text"
                      value={companyRequest.postal_code}
                      onChange={(event) =>
                        setCompanyRequest((prev) => ({ ...prev, postal_code: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Adresse</label>
                  <input
                    type="text"
                    value={companyRequest.address}
                    onChange={(event) =>
                      setCompanyRequest((prev) => ({ ...prev, address: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Contact</label>
                  <input
                    type="text"
                    value={companyRequest.contact_name}
                    onChange={(event) =>
                      setCompanyRequest((prev) => ({ ...prev, contact_name: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Email contact</label>
                  <input
                    type="email"
                    value={companyRequest.contact_email}
                    onChange={(event) =>
                      setCompanyRequest((prev) => ({ ...prev, contact_email: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">Telephone</label>
                    <input
                      type="text"
                      value={companyRequest.contact_phone}
                      onChange={(event) =>
                        setCompanyRequest((prev) => ({ ...prev, contact_phone: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">SIRET</label>
                    <input
                      type="text"
                      value={companyRequest.siret}
                      onChange={(event) =>
                        setCompanyRequest((prev) => ({ ...prev, siret: event.target.value }))
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">
                    Themes (slugs, separes par des virgules)
                  </label>
                  <input
                    type="text"
                    value={companyRequest.themes}
                    onChange={(event) =>
                      setCompanyRequest((prev) => ({ ...prev, themes: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <button
                  type="submit"
                  disabled={companyRequestLoading}
                  className="w-full bg-[#FF6B35] text-white py-2.5 rounded-lg hover:bg-[#E85A2A] transition-colors disabled:opacity-70"
                >
                  {companyRequestLoading ? "Envoi..." : "Envoyer la demande"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#F7FAFC] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-4 text-[#2D3748]">Comment ca marche ?</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            En 3 etapes simples, trouvez et reservez votre visite d'entreprise
          </p>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-[#FF6B35] text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  1
                </div>
                <Search className="w-12 h-12 text-[#2C5F8D] mb-4" />
                <h3 className="mb-3 text-[#2D3748]">Recherchez</h3>
                <p className="text-gray-600">
                  Explorez la carte interactive et filtrez les entreprises par secteur, localisation et dates disponibles.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-[#FF6B35] text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  2
                </div>
                <UserCheck className="w-12 h-12 text-[#2C5F8D] mb-4" />
                <h3 className="mb-3 text-[#2D3748]">Inscrivez-vous</h3>
                <p className="text-gray-600">
                  Selectionnez un creneau qui correspond a votre emploi du temps et validez votre inscription en quelques clics.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="bg-[#FF6B35] text-white w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                  3
                </div>
                <MapPin className="w-12 h-12 text-[#2C5F8D] mb-4" />
                <h3 className="mb-3 text-[#2D3748]">Visitez</h3>
                <p className="text-gray-600">
                  Rendez-vous sur place le jour J pour decouvrir l'entreprise, ses metiers et ses innovations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-4 text-[#2D3748]">Explorez les entreprises participantes</h2>
          <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">
            Plus de 150 entreprises vous ouvrent leurs portes partout en France
          </p>

          <div className="relative bg-[#F7FAFC] rounded-xl p-8 md:p-12 text-center">
            <MapPin className="w-16 h-16 text-[#2C5F8D] mx-auto mb-6" />
            <h3 className="mb-4 text-[#2D3748]">Carte interactive</h3>
            <p className="text-gray-600 mb-6 max-w-xl mx-auto">
              Utilisez notre carte interactive pour visualiser toutes les entreprises participantes et trouver celles pres de chez vous.
            </p>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-8 py-3 rounded-lg hover:bg-[#E85A2A] transition-colors"
            >
              Voir toutes les entreprises
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F7FAFC] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-center mb-4 text-[#2D3748]">Decouvrez tous les secteurs</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            De l'aeronautique au numerique, explorez la diversite de l'industrie francaise
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {themes.map((theme) => {
              const Icon = thematicIcons[theme.id];
              return (
                <Link
                  key={theme.id}
                  to={`/map?thematic=${theme.id}`}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow group"
                >
                  <div
                    className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${theme.color}20` }}
                  >
                    {Icon ? <Icon className="w-8 h-8" style={{ color: theme.color }} /> : null}
                  </div>
                  <h4 className="font-semibold text-[#2D3748] text-sm md:text-base">{theme.name}</h4>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {hasTestimonials && (
        <section className="bg-white py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-center mb-4 text-[#2D3748]">Ils ont participe</h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Decouvrez les temoignages de lyceens et d'entreprises
            </p>

            <div className="max-w-4xl mx-auto relative">
              <div className="bg-[#F7FAFC] rounded-2xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <img
                    src={testimonials[currentTestimonial].photo}
                    alt={testimonials[currentTestimonial].name}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover"
                  />
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-lg md:text-xl text-[#2D3748] mb-6 italic">
                      "{testimonials[currentTestimonial].quote}"
                    </p>
                    <div>
                      <div className="font-semibold text-[#2D3748]">
                        {testimonials[currentTestimonial].name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonials[currentTestimonial].role}
                      </div>
                      <div className="text-sm text-[#FF6B35]">
                        {testimonials[currentTestimonial].school}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={prevTestimonial}
                  className="bg-white border-2 border-[#2C5F8D] text-[#2C5F8D] p-3 rounded-full hover:bg-[#2C5F8D] hover:text-white transition-colors"
                  aria-label="Temoignage precedent"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextTestimonial}
                  className="bg-white border-2 border-[#2C5F8D] text-[#2C5F8D] p-3 rounded-full hover:bg-[#2C5F8D] hover:text-white transition-colors"
                  aria-label="Temoignage suivant"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="flex justify-center gap-2 mt-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentTestimonial ? "bg-[#FF6B35] w-8" : "bg-gray-300"
                    }`}
                    aria-label={`Aller au temoignage ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="bg-gradient-to-r from-[#2C5F8D] to-[#1e4161] text-white py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4">Pret a decouvrir votre futur metier ?</h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-gray-100">
            Ne manquez pas cette opportunite unique de visiter les plus grandes entreprises industrielles de France.
          </p>
          <Link
            to="/map"
            className="inline-flex items-center gap-2 bg-[#FF6B35] text-white px-8 py-4 rounded-lg hover:bg-[#E85A2A] transition-colors text-lg"
          >
            Trouver ma visite
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
