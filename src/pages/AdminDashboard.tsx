import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Users, BarChart3, Check, X, Eye } from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { supabase } from "../lib/supabase";
import { fetchThemes, type UiTheme } from "../lib/data/companies";

type AdminCompany = {
  id: string;
  name: string;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  themes: string[] | null;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  contact_phone: string | null;
  pmr_accessible: boolean | null;
  safety_measures: string | null;
  equipment_provided: string | null;
  equipment_required: string | null;
  contact_name: string | null;
  contact_email: string | null;
  siret: string | null;
  user_id: string | null;
  status: "pending" | "approved" | "rejected" | null;
  created_at: string | null;
};

type AdminBooking = {
  id: string;
  status: string | null;
  booking_type: string | null;
  number_of_participants: number | null;
  created_at: string | null;
  user:
    | {
        id: string;
        full_name: string | null;
        email: string | null;
        phone: string | null;
      }
    | null;
  time_slots:
    | {
        company_id: string | null;
        start_datetime: string | null;
        end_datetime: string | null;
      }
    | null;
};

type AdminUser = {
  id: string;
  email: string | null;
  role: string | null;
  full_name: string | null;
  phone: string | null;
  created_at: string | null;
};

type AdminSlot = {
  id: string;
  start_datetime: string | null;
  end_datetime: string | null;
  capacity: number | null;
  available_spots: number | null;
  visit_type: string | null;
  description: string | null;
  specific_instructions: string | null;
  requires_manual_validation: boolean | null;
  status: string | null;
};

type CompanyPhoto = {
  id: string;
  photo_url: string;
  order_index: number | null;
};

type TopCompany = {
  name: string;
  visits: number;
  students: number;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleDateString("fr-FR");
};

const formatTime = (value?: string | null) => {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

const pad = (value: number) => value.toString().padStart(2, "0");

const toLocalDateInput = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const toLocalTimeInput = (value?: string | null) => {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const buildIsoDateTime = (date: string, time: string) => {
  if (!date || !time) {
    return "";
  }
  return new Date(`${date}T${time}:00`).toISOString();
};

const toNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const csvEscape = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  if (text.includes('"') || text.includes(";") || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const DATAGOUV_FIELDS = [
  { field: "age", label: "Age" },
  { field: "geo", label: "Geo" },
  { field: "jour", label: "Jour" },
  { field: "slug", label: "slug" },
  { field: "titre", label: "Titre" },
  { field: "ville", label: "Ville" },
  { field: "etat", label: "Etat" },
  { field: "adresse", label: "Adresse" },
  { field: "timings", label: "timings" },
  { field: "latitude", label: "Latitude" },
  { field: "longitude", label: "Longitude" },
  { field: "date_range", label: "dateRange" },
  { field: "code_insee", label: "Code Insee" },
  { field: "lieu_id", label: "ID du lieu" },
  { field: "image_full", label: "Image full" },
  { field: "last_timing", label: "lastTiming" },
  { field: "next_timing", label: "nextTiming" },
  { field: "code_postal", label: "Code postal" },
  { field: "nom_lieu", label: "Nom du lieu" },
  { field: "first_timing", label: "firstTiming" },
  { field: "departement", label: "Departement" },
  { field: "organisateur", label: "Organisateur" },
  { field: "image_credits", label: "imageCredits" },
  { field: "registration", label: "registration" },
  { field: "image_base", label: "Image de base" },
  { field: "image_fichier", label: "Image fichier" },
  { field: "accessibilite", label: "Accessibilite" },
  { field: "event_id", label: "ID evenement" },
  { field: "image_vignette", label: "Image vignette" },
  { field: "publics_vises", label: "Publics vises" },
  { field: "accessibilite_alt", label: "Accessibilite.1" },
  { field: "site_web_lieu", label: "Site web du lieu" },
  { field: "online_access_link", label: "onlineAccessLink" },
  { field: "date_creation", label: "Date de creation" },
  { field: "description_courte", label: "Description courte" },
  { field: "type_evenement", label: "Type d'evenement" },
  { field: "telephone_lieu", label: "Telephone (lieu)" },
  { field: "conditions_acces", label: "Conditions d'acces" },
  { field: "mode_participation", label: "Mode de participation" },
  { field: "derniere_mise_a_jour", label: "Derniere mise a jour" },
  { field: "activites_industrielles", label: "Activites industrielles" },
  { field: "participants_attendus", label: "nombre-de-participants-attendus" },
  { field: "profil_organisateur", label: "Profil de l'organisateur de l'evenement" },
];

const DATA_SOURCES = [
  { id: "", label: "Non mappe" },
  { id: "static", label: "Valeur fixe" },
  { id: "company.name", label: "Entreprise: nom" },
  { id: "company.description", label: "Entreprise: description" },
  { id: "company.address", label: "Entreprise: adresse" },
  { id: "company.city", label: "Entreprise: ville" },
  { id: "company.postal_code", label: "Entreprise: code postal" },
  { id: "company.latitude", label: "Entreprise: latitude" },
  { id: "company.longitude", label: "Entreprise: longitude" },
  { id: "company.geo", label: "Entreprise: lat,lon" },
  { id: "company.themes", label: "Entreprise: themes" },
  { id: "company.logo_url", label: "Entreprise: logo" },
  { id: "company.banner_url", label: "Entreprise: bannere" },
  { id: "company.photo_first", label: "Entreprise: photo 1" },
  { id: "company.photo_all", label: "Entreprise: toutes photos" },
  { id: "company.contact_name", label: "Entreprise: contact nom" },
  { id: "company.contact_email", label: "Entreprise: contact email" },
  { id: "company.contact_phone", label: "Entreprise: contact telephone" },
  { id: "company.siret", label: "Entreprise: siret" },
  { id: "company.pmr_accessible", label: "Entreprise: pmr" },
  { id: "company.safety_measures", label: "Entreprise: securite" },
  { id: "company.equipment_provided", label: "Entreprise: equipement fourni" },
  { id: "company.equipment_required", label: "Entreprise: equipement requis" },
  { id: "slot.id", label: "Creneau: id" },
  { id: "slot.start_datetime", label: "Creneau: debut (ISO)" },
  { id: "slot.end_datetime", label: "Creneau: fin (ISO)" },
  { id: "slot.date", label: "Creneau: date" },
  { id: "slot.start_time", label: "Creneau: heure debut" },
  { id: "slot.end_time", label: "Creneau: heure fin" },
  { id: "slot.day_name", label: "Creneau: jour" },
  { id: "slot.date_range", label: "Creneau: dateRange" },
  { id: "slot.created_at", label: "Creneau: cree le" },
  { id: "slot.updated_at", label: "Creneau: maj le" },
  { id: "slot.capacity", label: "Creneau: capacite" },
  { id: "slot.available_spots", label: "Creneau: places restantes" },
  { id: "slot.visit_type", label: "Creneau: type visite" },
  { id: "slot.description", label: "Creneau: description" },
  { id: "slot.specific_instructions", label: "Creneau: instructions" },
  { id: "slot.status", label: "Creneau: statut" },
  { id: "slot.requires_manual_validation", label: "Creneau: validation manuelle" },
  { id: "slot.bookings_total", label: "Creneau: nb reservations" },
  { id: "slot.participants_total", label: "Creneau: participants total" },
  { id: "slot.participants_confirmed", label: "Creneau: participants confirmes" },
  { id: "slot.participants_pending", label: "Creneau: participants en attente" },
  { id: "slot.participants_cancelled", label: "Creneau: participants annules" },
];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export function AdminDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<
    "overview" | "companies" | "users" | "stats" | "datagouv"
  >("overview");
  const [companyTab, setCompanyTab] = useState<"pending" | "approved" | "all">("pending");
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [themes, setThemes] = useState<UiTheme[]>([]);
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [usersCount, setUsersCount] = useState<number>(0);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [exportMapping, setExportMapping] = useState<
    Record<string, { source: string; staticValue: string }>
  >({});
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSavedAt, setExportSavedAt] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    id: "",
    email: "",
    role: "visitor",
    full_name: "",
    phone: "",
    company_id: "",
  });
  const [userFormError, setUserFormError] = useState<string | null>(null);

  const [manageCompany, setManageCompany] = useState<AdminCompany | null>(null);
  const [manageTab, setManageTab] = useState<"presentation" | "slots" | "info" | "media">(
    "presentation"
  );
  const [manageLoading, setManageLoading] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);
  const [companySlots, setCompanySlots] = useState<AdminSlot[]>([]);
  const [companyPhotos, setCompanyPhotos] = useState<CompanyPhoto[]>([]);
  const [companyForm, setCompanyForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    postal_code: "",
    themes: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    siret: "",
    pmr_accessible: false,
    safety_measures: "",
    equipment_provided: "",
    equipment_required: "",
    logo_url: "",
    banner_url: "",
    user_id: "",
  });
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [slotForm, setSlotForm] = useState<{
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    capacity: string;
    visit_type: string;
    description: string;
    specific_instructions: string;
    requires_manual_validation: boolean;
    status: string;
  } | null>(null);

  const menuItems = [
    { path: "/admin-dashboard", label: "Vue d'ensemble", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/admin-dashboard/companies", label: "Entreprises", icon: <Building2 className="w-5 h-5" /> },
    { path: "/admin-dashboard/users", label: "Utilisateurs", icon: <Users className="w-5 h-5" /> },
    { path: "/admin-dashboard/stats", label: "Statistiques", icon: <BarChart3 className="w-5 h-5" /> },
    { path: "/admin-dashboard/datagouv", label: "Export DataGouv", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (location.pathname.endsWith("/companies")) {
      setActiveView("companies");
      return;
    }
    if (location.pathname.endsWith("/users")) {
      setActiveView("users");
      return;
    }
    if (location.pathname.endsWith("/stats")) {
      setActiveView("stats");
      return;
    }
    if (location.pathname.endsWith("/datagouv")) {
      setActiveView("datagouv");
      return;
    }
    setActiveView("overview");
  }, [location.pathname]);

  useEffect(() => {
    if (isAdmin) {
      loadExportMapping();
    }
  }, [isAdmin]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const { data: authResult } = await supabase.auth.getUser();
        const user = authResult.user;

        if (!user) {
          if (isMounted) {
            setIsAdmin(false);
            setIsLoading(false);
          }
          return;
        }

        const { data: userRow, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (userError) {
          throw userError;
        }

        if (!userRow || userRow.role !== "admin") {
          if (isMounted) {
            setIsAdmin(false);
            setIsLoading(false);
          }
          return;
        }

        if (isMounted) {
          setIsAdmin(true);
        }

        const [themesData, companiesResult, bookingsResult, usersCountResult, usersListResult] =
          await Promise.all([
            fetchThemes(),
            supabase
              .from("companies")
              .select(
                "id, name, city, address, postal_code, themes, description, logo_url, banner_url, contact_name, contact_email, contact_phone, siret, pmr_accessible, safety_measures, equipment_provided, equipment_required, user_id, status, created_at"
              ),
            supabase
              .from("bookings")
              .select(
                "id, status, booking_type, number_of_participants, created_at, user:users ( id, full_name, email, phone ), time_slots:time_slot_id ( company_id, start_datetime, end_datetime )"
              ),
            supabase.from("users").select("id", { count: "exact", head: true }),
          supabase
            .from("users")
            .select("id, email, role, full_name, phone, created_at")
              .order("created_at", { ascending: false })
              .limit(20),
          ]);

        if (!isMounted) {
          return;
        }

        if (companiesResult.error) {
          throw companiesResult.error;
        }

        if (bookingsResult.error) {
          throw bookingsResult.error;
        }

        if (usersListResult.error) {
          throw usersListResult.error;
        }

        setThemes(themesData);
        setCompanies(companiesResult.data ?? []);
        setBookings(bookingsResult.data ?? []);
        setUsersCount(usersCountResult.count ?? 0);
        setUsers(usersListResult.data ?? []);
      } catch (error) {
        if (isMounted) {
          setLoadError("Impossible de charger les donnees admin.");
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

  useEffect(() => {
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setIsAdmin(false);
      }
    });

    return () => {
      subscription?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isAdmin === false) {
      navigate("/login");
    }
  }, [isAdmin, navigate]);

  const themeMap = useMemo(() => {
    const map = new Map<string, UiTheme>();
    themes.forEach((theme) => {
      map.set(theme.id, theme);
    });
    return map;
  }, [themes]);

  const companyById = useMemo(() => {
    const map = new Map<string, AdminCompany>();
    companies.forEach((company) => {
      map.set(company.id, company);
    });
    return map;
  }, [companies]);

  const pendingCompanies = useMemo(() => {
    return companies.filter((company) => company.status === "pending");
  }, [companies]);

  const approvedCompanies = useMemo(() => {
    return companies.filter((company) => company.status === "approved");
  }, [companies]);

  const stats = useMemo(() => {
    const totalCompanies = approvedCompanies.length;
    const pendingValidations = pendingCompanies.length;
    const totalVisits = bookings.filter((booking) => booking.status === "confirmed").length;

    return {
      totalCompanies,
      totalStudents: usersCount,
      totalVisits,
      pendingValidations,
    };
  }, [approvedCompanies, pendingCompanies, bookings, usersCount]);

  const topCompanies: TopCompany[] = useMemo(() => {
    const companyMap = new Map<string, TopCompany>();

    bookings.forEach((booking) => {
      if (booking.status !== "confirmed") {
        return;
      }
      const companyId = booking.time_slots?.company_id;
      if (!companyId) {
        return;
      }
      const company = companies.find((item) => item.id === companyId);
      if (!company) {
        return;
      }
      const entry = companyMap.get(companyId) ?? {
        name: company.name,
        visits: 0,
        students: 0,
      };

      entry.visits += 1;
      const participants =
        booking.booking_type === "group" ? booking.number_of_participants ?? 0 : 1;
      entry.students += participants;
      companyMap.set(companyId, entry);
    });

    return Array.from(companyMap.values())
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5);
  }, [bookings, companies]);

  const updateCompanyStatus = async (companyId: string, status: "approved" | "rejected") => {
    try {
      setActionId(companyId);
      setActionError(null);
      setActionSuccess(null);

      const { error } = await supabase.from("companies").update({ status }).eq("id", companyId);

      if (error) {
        throw error;
      }

      setCompanies((prev) =>
        prev.map((company) => (company.id === companyId ? { ...company, status } : company))
      );

      setSelectedCompany((prev) => (prev && prev.id === companyId ? { ...prev, status } : prev));
    } catch (error) {
      setActionError("Impossible de mettre a jour le statut.");
    } finally {
      setActionId(null);
    }
  };

  const approveCompanyWithInvite = async (companyId: string) => {
    try {
      setActionId(companyId);
      setActionError(null);
      setActionSuccess(null);

      if (!supabaseUrl || !supabaseAnonKey) {
        setActionError("Configuration Supabase manquante.");
        return;
      }

      const { data: sessionData } = await supabase.auth.getSession();
      let accessToken = sessionData.session?.access_token;

      if (!accessToken) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        accessToken = refreshData.session?.access_token;
      }

      if (!accessToken) {
        setActionError("Session invalide. Reconnectez-vous.");
        return;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/approve_company`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
          apikey: supabaseAnonKey,
          "x-user-jwt": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ companyId }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw payload;
      }

      if (payload?.company) {
        setCompanies((prev) =>
          prev.map((company) => (company.id === companyId ? payload.company : company))
        );
        setActionSuccess("Entreprise validee et invitation envoyee.");
      } else {
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === companyId ? { ...company, status: "approved" } : company
          )
        );
        setActionSuccess("Entreprise validee.");
      }
    } catch (error) {
      setActionError("Impossible de valider et creer le compte.");
    } finally {
      setActionId(null);
    }
  };

  const loadCompanyAssets = async (companyId: string) => {
    const [slotsResult, photosResult] = await Promise.all([
      supabase
        .from("time_slots")
        .select(
          "id, start_datetime, end_datetime, capacity, available_spots, visit_type, description, specific_instructions, requires_manual_validation, status"
        )
        .eq("company_id", companyId)
        .order("start_datetime", { ascending: true }),
      supabase
        .from("company_photos")
        .select("id, photo_url, order_index")
        .eq("company_id", companyId)
        .order("order_index", { ascending: true }),
    ]);

    if (slotsResult.error) {
      throw slotsResult.error;
    }
    if (photosResult.error) {
      throw photosResult.error;
    }

    setCompanySlots(slotsResult.data ?? []);
    setCompanyPhotos(photosResult.data ?? []);
  };

  const openManageCompany = async (company: AdminCompany) => {
    setManageCompany(company);
    setManageTab("presentation");
    setManageError(null);
    setPhotoUrlInput("");
    setSlotForm(null);
    setCompanyForm({
      name: company.name ?? "",
      description: company.description ?? "",
      address: company.address ?? "",
      city: company.city ?? "",
      postal_code: company.postal_code ?? "",
      themes: company.themes?.join(", ") ?? "",
      contact_name: company.contact_name ?? "",
      contact_email: company.contact_email ?? "",
      contact_phone: company.contact_phone ?? "",
      siret: company.siret ?? "",
      pmr_accessible: company.pmr_accessible ?? false,
      safety_measures: company.safety_measures ?? "",
      equipment_provided: company.equipment_provided ?? "",
      equipment_required: company.equipment_required ?? "",
      logo_url: company.logo_url ?? "",
      banner_url: company.banner_url ?? "",
      user_id: company.user_id ?? "",
    });

    try {
      setManageLoading(true);
      await loadCompanyAssets(company.id);
    } catch (error) {
      setManageError("Impossible de charger les details.");
    } finally {
      setManageLoading(false);
    }
  };

  const closeManageCompany = () => {
    setManageCompany(null);
    setCompanySlots([]);
    setCompanyPhotos([]);
    setManageError(null);
    setSlotForm(null);
  };

  const saveCompanyForm = async () => {
    if (!manageCompany) {
      return;
    }
    try {
      setManageLoading(true);
      setManageError(null);
      const payload = {
        name: companyForm.name.trim(),
        description: toNullable(companyForm.description),
        address: toNullable(companyForm.address),
        city: toNullable(companyForm.city),
        postal_code: toNullable(companyForm.postal_code),
        themes: companyForm.themes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        contact_name: toNullable(companyForm.contact_name),
        contact_email: toNullable(companyForm.contact_email),
        contact_phone: toNullable(companyForm.contact_phone),
        siret: toNullable(companyForm.siret),
        pmr_accessible: companyForm.pmr_accessible,
        safety_measures: toNullable(companyForm.safety_measures),
        equipment_provided: toNullable(companyForm.equipment_provided),
        equipment_required: toNullable(companyForm.equipment_required),
        logo_url: toNullable(companyForm.logo_url),
        banner_url: toNullable(companyForm.banner_url),
        user_id: companyForm.user_id || null,
      };

      if (payload.user_id) {
        const linked = companies.find(
          (company) => company.user_id === payload.user_id && company.id !== manageCompany.id
        );
        if (linked) {
          setManageError("Cet utilisateur est deja associe a une autre entreprise.");
          setManageLoading(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from("companies")
        .update(payload)
        .eq("id", manageCompany.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCompanies((prev) =>
        prev.map((company) => (company.id === manageCompany.id ? data : company))
      );
      setManageCompany(data);
    } catch (error) {
      setManageError("Impossible d'enregistrer les modifications.");
    } finally {
      setManageLoading(false);
    }
  };

  const startEditSlot = (slot?: AdminSlot) => {
    if (!slot) {
      setSlotForm({
        date: "",
        startTime: "",
        endTime: "",
        capacity: "",
        visit_type: "",
        description: "",
        specific_instructions: "",
        requires_manual_validation: false,
        status: "open",
      });
      return;
    }
    setSlotForm({
      id: slot.id,
      date: toLocalDateInput(slot.start_datetime),
      startTime: toLocalTimeInput(slot.start_datetime),
      endTime: toLocalTimeInput(slot.end_datetime),
      capacity: slot.capacity?.toString() ?? "",
      visit_type: slot.visit_type ?? "",
      description: slot.description ?? "",
      specific_instructions: slot.specific_instructions ?? "",
      requires_manual_validation: slot.requires_manual_validation ?? false,
      status: slot.status ?? "open",
    });
  };

  const saveSlotForm = async () => {
    if (!manageCompany || !slotForm) {
      return;
    }
    const capacityValue = Number(slotForm.capacity || 0);
    const startDate = buildIsoDateTime(slotForm.date, slotForm.startTime);
    const endDate = buildIsoDateTime(slotForm.date, slotForm.endTime);

    if (!startDate || !endDate || Number.isNaN(capacityValue)) {
      setManageError("Veuillez renseigner la date, les heures et la capacite.");
      return;
    }

    try {
      setManageLoading(true);
      setManageError(null);

      if (slotForm.id) {
        const existing = companySlots.find((slot) => slot.id === slotForm.id);
        const { error } = await supabase
          .from("time_slots")
          .update({
            start_datetime: startDate,
            end_datetime: endDate,
            capacity: capacityValue,
            available_spots: existing?.available_spots ?? capacityValue,
            visit_type: slotForm.visit_type.trim(),
            description: slotForm.description.trim(),
            specific_instructions: slotForm.specific_instructions.trim(),
            requires_manual_validation: slotForm.requires_manual_validation,
            status: slotForm.status,
          })
          .eq("id", slotForm.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("time_slots").insert({
          company_id: manageCompany.id,
          start_datetime: startDate,
          end_datetime: endDate,
          capacity: capacityValue,
          available_spots: capacityValue,
          visit_type: slotForm.visit_type.trim(),
          description: slotForm.description.trim(),
          specific_instructions: slotForm.specific_instructions.trim(),
          requires_manual_validation: slotForm.requires_manual_validation,
          status: slotForm.status || "open",
        });

        if (error) {
          throw error;
        }
      }

      await loadCompanyAssets(manageCompany.id);
      setSlotForm(null);
    } catch (error) {
      setManageError("Impossible d'enregistrer le creneau.");
    } finally {
      setManageLoading(false);
    }
  };

  const deleteSlot = async (slotId: string) => {
    if (!manageCompany) {
      return;
    }
    if (!window.confirm("Supprimer ce creneau ?")) {
      return;
    }
    try {
      setManageLoading(true);
      setManageError(null);
      const { error } = await supabase.from("time_slots").delete().eq("id", slotId);
      if (error) {
        throw error;
      }
      await loadCompanyAssets(manageCompany.id);
    } catch (error) {
      setManageError("Impossible de supprimer le creneau.");
    } finally {
      setManageLoading(false);
    }
  };

  const addPhoto = async () => {
    if (!manageCompany || !photoUrlInput.trim()) {
      return;
    }
    try {
      setManageLoading(true);
      setManageError(null);
      const { data, error } = await supabase
        .from("company_photos")
        .insert({
          company_id: manageCompany.id,
          photo_url: photoUrlInput.trim(),
          order_index: companyPhotos.length,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCompanyPhotos((prev) => [...prev, data]);
      setPhotoUrlInput("");
    } catch (error) {
      setManageError("Impossible d'ajouter la photo.");
    } finally {
      setManageLoading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!manageCompany) {
      return;
    }
    try {
      setManageLoading(true);
      setManageError(null);
      const { error } = await supabase.from("company_photos").delete().eq("id", photoId);
      if (error) {
        throw error;
      }
      setCompanyPhotos((prev) => prev.filter((photo) => photo.id !== photoId));
    } catch (error) {
      setManageError("Impossible de supprimer la photo.");
    } finally {
      setManageLoading(false);
    }
  };

  const deleteCompany = async () => {
    if (!manageCompany) {
      return;
    }
    if (!window.confirm("Supprimer l'entreprise et ses donnees ?")) {
      return;
    }
    try {
      setManageLoading(true);
      setManageError(null);
      const { error } = await supabase.from("companies").delete().eq("id", manageCompany.id);
      if (error) {
        throw error;
      }
      setCompanies((prev) => prev.filter((company) => company.id !== manageCompany.id));
      closeManageCompany();
    } catch (error) {
      setManageError("Impossible de supprimer l'entreprise.");
    } finally {
      setManageLoading(false);
    }
  };

  const resetUserForm = () => {
    setUserForm({ id: "", email: "", role: "visitor", full_name: "", phone: "", company_id: "" });
    setUserFormError(null);
  };

  const startEditUser = (user: AdminUser) => {
    const linkedCompany = companies.find((company) => company.user_id === user.id);
    setUserForm({
      id: user.id,
      email: user.email ?? "",
      role: user.role ?? "visitor",
      full_name: user.full_name ?? "",
      phone: user.phone ?? "",
      company_id: linkedCompany?.id ?? "",
    });
    setUserFormError(null);
  };

  const saveUserForm = async () => {
    if (!userForm.email.trim()) {
      setUserFormError("Email requis.");
      return;
    }

    try {
      setManageLoading(true);
      setUserFormError(null);
      let savedUserId = userForm.id;
      let savedUser: AdminUser | null = null;

      if (userForm.id) {
        const { data, error } = await supabase
          .from("users")
          .update({
            email: userForm.email.trim(),
            role: userForm.role,
            full_name: toNullable(userForm.full_name),
            phone: toNullable(userForm.phone),
          })
          .eq("id", userForm.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        savedUserId = data.id;
        savedUser = data;
        setUsers((prev) => prev.map((item) => (item.id === userForm.id ? data : item)));
      } else {
        const { data, error } = await supabase
          .from("users")
          .insert({
            email: userForm.email.trim(),
            role: userForm.role,
            full_name: toNullable(userForm.full_name),
            phone: toNullable(userForm.phone),
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        savedUserId = data.id;
        savedUser = data;
        setUsers((prev) => [data, ...prev]);
        setUsersCount((prev) => prev + 1);
      }

      const linked = companies.find((company) => company.user_id === savedUserId);
      if (userForm.company_id) {
        const companyLinkedElsewhere = companies.find(
          (company) => company.id === userForm.company_id && company.user_id && company.user_id !== savedUserId
        );
        if (companyLinkedElsewhere) {
          setUserFormError("Cette entreprise est deja associee a un autre utilisateur.");
          setManageLoading(false);
          return;
        }
        await supabase
          .from("companies")
          .update({ user_id: savedUserId })
          .eq("id", userForm.company_id);
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === userForm.company_id ? { ...company, user_id: savedUserId } : company
          )
        );
      } else if (linked) {
        await supabase.from("companies").update({ user_id: null }).eq("id", linked.id);
        setCompanies((prev) =>
          prev.map((company) => (company.id === linked.id ? { ...company, user_id: null } : company))
        );
      }

      if (savedUser) {
        setUsers((prev) =>
          prev.map((item) => (item.id === savedUserId ? savedUser : item))
        );
      }

      resetUserForm();
    } catch (error) {
      setUserFormError("Impossible d'enregistrer l'utilisateur.");
    } finally {
      setManageLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) {
      return;
    }
    try {
      setManageLoading(true);
      setUserFormError(null);
      const { error } = await supabase.from("users").delete().eq("id", userId);
      if (error) {
        throw error;
      }
      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setUsersCount((prev) => Math.max(0, prev - 1));
      if (userForm.id === userId) {
        resetUserForm();
      }
    } catch (error) {
      setUserFormError("Impossible de supprimer l'utilisateur.");
    } finally {
      setManageLoading(false);
    }
  };

  async function loadExportMapping() {
    try {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("value, updated_at")
        .eq("key", "datagouv_mapping")
        .maybeSingle();

      if (error) {
        if (error.code !== "PGRST116") {
          setExportError("Impossible de charger le mapping.");
        }
        return;
      }

      if (data?.value) {
        setExportMapping(data.value);
        setExportSavedAt(data.updated_at ?? null);
      }
    } catch (error) {
      setExportError("Impossible de charger le mapping.");
    }
  }

  async function saveExportMapping() {
    try {
      setExportLoading(true);
      setExportError(null);
      const now = new Date().toISOString();
      const { error } = await supabase.from("admin_settings").upsert({
        key: "datagouv_mapping",
        value: exportMapping,
        updated_at: now,
      });

      if (error) {
        throw error;
      }
      setExportSavedAt(now);
    } catch (error) {
      setExportError("Impossible d'enregistrer le mapping.");
    } finally {
      setExportLoading(false);
    }
  }

  const getSourceValue = (sourceId: string, row: any) => {
    if (!sourceId) {
      return "";
    }
    if (sourceId === "static") {
      return "";
    }
    const company = row.company;
    const photos = row.companyPhotos ?? [];
    const stats = row.bookingStats ?? {};
    switch (sourceId) {
      case "company.name":
        return company?.name ?? "";
      case "company.description":
        return company?.description ?? "";
      case "company.address":
        return company?.address ?? "";
      case "company.city":
        return company?.city ?? "";
      case "company.postal_code":
        return company?.postal_code ?? "";
      case "company.latitude":
        return company?.latitude ?? "";
      case "company.longitude":
        return company?.longitude ?? "";
      case "company.geo":
        return company?.latitude && company?.longitude
          ? `${company.latitude},${company.longitude}`
          : "";
      case "company.themes":
        return Array.isArray(company?.themes) ? company.themes.join(", ") : "";
      case "company.logo_url":
        return company?.logo_url ?? "";
      case "company.banner_url":
        return company?.banner_url ?? "";
      case "company.photo_first":
        return photos[0]?.photo_url ?? "";
      case "company.photo_all":
        return photos.map((photo: any) => photo.photo_url).join(", ");
      case "company.contact_name":
        return company?.contact_name ?? "";
      case "company.contact_email":
        return company?.contact_email ?? "";
      case "company.contact_phone":
        return company?.contact_phone ?? "";
      case "company.siret":
        return company?.siret ?? "";
      case "company.pmr_accessible":
        return company?.pmr_accessible ? "true" : "false";
      case "company.safety_measures":
        return company?.safety_measures ?? "";
      case "company.equipment_provided":
        return company?.equipment_provided ?? "";
      case "company.equipment_required":
        return company?.equipment_required ?? "";
      case "slot.id":
        return row.id ?? "";
      case "slot.start_datetime":
        return row.start_datetime ?? "";
      case "slot.end_datetime":
        return row.end_datetime ?? "";
      case "slot.date":
        return toLocalDateInput(row.start_datetime);
      case "slot.start_time":
        return toLocalTimeInput(row.start_datetime);
      case "slot.end_time":
        return toLocalTimeInput(row.end_datetime);
      case "slot.day_name":
        return row.start_datetime
          ? new Date(row.start_datetime).toLocaleDateString("fr-FR", { weekday: "long" })
          : "";
      case "slot.date_range": {
        const start = toLocalDateInput(row.start_datetime);
        const end = toLocalDateInput(row.end_datetime);
        if (start && end && start !== end) {
          return `${start} - ${end}`;
        }
        return start || end || "";
      }
      case "slot.created_at":
        return row.created_at ?? "";
      case "slot.updated_at":
        return row.updated_at ?? "";
      case "slot.capacity":
        return row.capacity ?? "";
      case "slot.available_spots":
        return row.available_spots ?? "";
      case "slot.visit_type":
        return row.visit_type ?? "";
      case "slot.description":
        return row.description ?? "";
      case "slot.specific_instructions":
        return row.specific_instructions ?? "";
      case "slot.status":
        return row.status ?? "";
      case "slot.requires_manual_validation":
        return row.requires_manual_validation ? "true" : "false";
      case "slot.bookings_total":
        return stats.totalBookings ?? 0;
      case "slot.participants_total":
        return stats.totalParticipants ?? 0;
      case "slot.participants_confirmed":
        return stats.confirmedParticipants ?? 0;
      case "slot.participants_pending":
        return stats.pendingParticipants ?? 0;
      case "slot.participants_cancelled":
        return stats.cancelledParticipants ?? 0;
      default:
        return "";
    }
  };

  const handleExportDatagouv = async () => {
    try {
      setExportLoading(true);
      setExportError(null);

      const { data, error } = await supabase
        .from("time_slots")
        .select(
          "id, start_datetime, end_datetime, created_at, updated_at, capacity, available_spots, visit_type, description, specific_instructions, status, requires_manual_validation, company:companies ( id, name, description, address, city, postal_code, latitude, longitude, themes, logo_url, banner_url, contact_name, contact_email, contact_phone, siret, pmr_accessible, safety_measures, equipment_provided, equipment_required )"
        );

      if (error) {
        throw error;
      }

      const rows = data ?? [];
      const slotIds = rows.map((row) => row.id);
      const companyIds = rows
        .map((row) => row.company?.id)
        .filter((id: string | undefined) => Boolean(id)) as string[];

      const [bookingsResult, photosResult] = await Promise.all([
        slotIds.length > 0
          ? supabase
              .from("bookings")
              .select("time_slot_id, booking_type, number_of_participants, status")
              .in("time_slot_id", slotIds)
          : Promise.resolve({ data: [], error: null }),
        companyIds.length > 0
          ? supabase
              .from("company_photos")
              .select("company_id, photo_url, order_index")
              .in("company_id", companyIds)
          : Promise.resolve({ data: [], error: null }),
      ]);

      if (bookingsResult.error) {
        throw bookingsResult.error;
      }
      if (photosResult.error) {
        throw photosResult.error;
      }

      const bookingsBySlot = new Map<string, any[]>();
      (bookingsResult.data ?? []).forEach((booking: any) => {
        const key = booking.time_slot_id;
        if (!bookingsBySlot.has(key)) {
          bookingsBySlot.set(key, []);
        }
        bookingsBySlot.get(key).push(booking);
      });

      const photosByCompany = new Map<string, any[]>();
      (photosResult.data ?? []).forEach((photo: any) => {
        const key = photo.company_id;
        if (!photosByCompany.has(key)) {
          photosByCompany.set(key, []);
        }
        photosByCompany.get(key).push(photo);
      });

      rows.forEach((row: any) => {
        const bookings = bookingsBySlot.get(row.id) ?? [];
        const stats = {
          totalBookings: bookings.length,
          totalParticipants: 0,
          confirmedParticipants: 0,
          pendingParticipants: 0,
          cancelledParticipants: 0,
        };

        bookings.forEach((booking: any) => {
          const participants =
            booking.booking_type === "group" ? booking.number_of_participants ?? 0 : 1;
          stats.totalParticipants += participants;
          if (booking.status === "confirmed") {
            stats.confirmedParticipants += participants;
          } else if (booking.status === "pending") {
            stats.pendingParticipants += participants;
          } else if (booking.status === "cancelled") {
            stats.cancelledParticipants += participants;
          }
        });

        row.bookingStats = stats;
        row.companyPhotos = photosByCompany.get(row.company?.id) ?? [];
      });
      const headers = DATAGOUV_FIELDS.map((item) => item.label);
      const lines = [headers.map(csvEscape).join(";")];

      rows.forEach((row) => {
        const values = DATAGOUV_FIELDS.map((field) => {
          const mapping = exportMapping[field.field];
          if (!mapping || !mapping.source) {
            return "";
          }
          if (mapping.source === "static") {
            return mapping.staticValue ?? "";
          }
          return getSourceValue(mapping.source, row);
        });
        lines.push(values.map(csvEscape).join(";"));
      });

      const csvContent = `\uFEFF${lines.join("\n")}`;
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "datagouv_export.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError("Impossible de generer le CSV.");
    } finally {
      setExportLoading(false);
    }
  };


  if (isLoading && isAdmin === null) {
    return <div className="p-4 text-gray-600">Chargement...</div>;
  }

  if (isAdmin === false) {
    return null;
  }

  return (
    <DashboardLayout menuItems={menuItems} userType="admin">
      <div className="p-4 space-y-6">
        {loadError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {actionError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError}
          </div>
        )}
        {actionSuccess && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {actionSuccess}
          </div>
        )}

        {activeView === "overview" && (
          <section className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]">Vue d'ensemble</h1>
              <p className="text-gray-600">Tableau de bord administrateur</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-sm text-gray-600">Entreprises</div>
                <div className="text-2xl font-bold text-[#2D3748]">{stats.totalCompanies}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-sm text-gray-600">Lyceens</div>
                <div className="text-2xl font-bold text-[#2D3748]">{stats.totalStudents}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-sm text-gray-600">Visites organisees</div>
                <div className="text-2xl font-bold text-[#2D3748]">{stats.totalVisits}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-sm text-gray-600">En attente validation</div>
                <div className="text-2xl font-bold text-[#2D3748]">{stats.pendingValidations}</div>
              </div>
            </div>
          </section>
        )}

        {activeView === "companies" && (
          <section className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]">Gestion des entreprises</h1>
              <p className="text-gray-600">Validation et moderation des entreprises</p>
            </div>
            <div className="flex gap-4 border-b">
              {[
                { id: "pending", label: "En attente", count: pendingCompanies.length },
                { id: "approved", label: "Validees", count: approvedCompanies.length },
                { id: "all", label: "Toutes", count: companies.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCompanyTab(tab.id as "pending" | "approved" | "all")}
                  className={`pb-2 px-2 border-b-2 text-sm ${
                    companyTab === tab.id
                      ? "border-[#FF6B35] text-[#FF6B35]"
                      : "border-transparent text-gray-600 hover:text-[#2C5F8D]"
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {companyTab === "pending" && (
              <div className="space-y-3">
                {pendingCompanies.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 text-center shadow-md">
                    <p className="text-gray-600">Aucune entreprise en attente</p>
                  </div>
                ) : (
                  pendingCompanies.map((company) => {
                    const thematicName = themeMap.get(company.themes?.[0] ?? "")?.name ?? "Autre";
                    const isActionLoading = actionId === company.id;
                    return (
                      <div key={company.id} className="bg-white rounded-xl p-4 shadow-md">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="font-semibold text-[#2D3748]">{company.name}</div>
                            <div className="text-sm text-gray-600">
                              {company.city ?? "-"} - {thematicName}
                            </div>
                            <div className="text-xs text-gray-500">
                              Demande recue le {formatDate(company.created_at)}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => {
                                setSelectedCompany(company);
                                setShowValidationModal(true);
                              }}
                              className="px-3 py-1.5 bg-[#2C5F8D] text-white rounded-lg text-sm flex items-center gap-2"
                            >
                              <Eye className="w-4 h-4" />
                              Details
                            </button>
                            <button
                              onClick={() => approveCompanyWithInvite(company.id)}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 bg-[#34A853] text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-60"
                            >
                              <Check className="w-4 h-4" />
                              Valider + compte
                            </button>
                            <button
                              onClick={() => updateCompanyStatus(company.id, "rejected")}
                              disabled={isActionLoading}
                              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm flex items-center gap-2 disabled:opacity-60"
                            >
                              <X className="w-4 h-4" />
                              Refuser
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {companyTab === "approved" && (
              <div className="space-y-3">
                {approvedCompanies.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 text-center shadow-md">
                    <p className="text-gray-600">Aucune entreprise validee</p>
                  </div>
                ) : (
                  approvedCompanies.map((company) => (
                    <div key={company.id} className="bg-white rounded-xl p-4 shadow-md">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#2D3748]">{company.name}</div>
                          <div className="text-sm text-gray-600">{company.city ?? "-"}</div>
                        </div>
                        <button
                          onClick={() => openManageCompany(company)}
                          className="px-3 py-1.5 text-sm bg-[#2C5F8D] text-white rounded-lg"
                        >
                          Gerer
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {companyTab === "all" && (
              <div className="space-y-3">
                {companies.length === 0 ? (
                  <div className="bg-white rounded-xl p-6 text-center shadow-md">
                    <p className="text-gray-600">Aucune entreprise</p>
                  </div>
                ) : (
                  companies.map((company) => (
                    <div key={company.id} className="bg-white rounded-xl p-4 shadow-md">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="font-semibold text-[#2D3748]">{company.name}</div>
                          <div className="text-sm text-gray-600">
                            {company.city ?? "-"} - {company.status ?? "inconnu"}
                          </div>
                        </div>
                        {company.status === "approved" && (
                          <button
                            onClick={() => openManageCompany(company)}
                            className="px-3 py-1.5 text-sm bg-[#2C5F8D] text-white rounded-lg"
                          >
                            Gerer
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </section>
        )}

        {activeView === "users" && (
          <section className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]">Gestion des utilisateurs</h1>
              <p className="text-gray-600">Creer, modifier ou supprimer des utilisateurs</p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, role: event.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="visitor">visitor</option>
                    <option value="company">company</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Nom complet</label>
                  <input
                    type="text"
                    value={userForm.full_name}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, full_name: event.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Entreprise associee</label>
                  <select
                    value={userForm.company_id}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, company_id: event.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Aucune</option>
                    {companies.map((company) => {
                      const linked = company.user_id && company.user_id !== userForm.id;
                      const label = `${company.name}${linked ? " (deja liee)" : ""}`;
                      return (
                        <option key={company.id} value={company.id} disabled={linked}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Telephone</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(event) =>
                      setUserForm((prev) => ({ ...prev, phone: event.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
              {userFormError && <div className="text-sm text-red-600">{userFormError}</div>}
              <div className="flex gap-2">
                <button
                  onClick={resetUserForm}
                  className="px-3 py-2 text-sm text-gray-600"
                >
                  Annuler
                </button>
                <button
                  onClick={saveUserForm}
                  className="px-3 py-2 text-sm bg-[#2C5F8D] text-white rounded-lg"
                >
                  {userForm.id ? "Mettre a jour" : "Creer"}
                </button>
              </div>
            </div>

            {users.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center shadow-md">
                <p className="text-gray-600">Aucun utilisateur</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F7FAFC] text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Nom</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Entreprise</th>
                      <th className="px-4 py-3 font-medium">Telephone</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3">{user.full_name ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{user.email ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{user.role ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">
                          {companies.find((company) => company.user_id === user.id)?.name ?? "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600">{user.phone ?? "-"}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(user.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditUser(user)}
                              className="px-2 py-1 text-xs bg-[#F7FAFC] text-gray-700 rounded-lg"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="px-2 py-1 text-xs text-red-600"
                            >
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-4 py-3 text-xs text-gray-500 border-t">
                  {users.length} utilisateurs charges
                </div>
              </div>
            )}
          </section>
        )}


        {activeView === "stats" && (
          <section className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]">Statistiques</h1>
              <p className="text-gray-600">Synthese</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-sm text-gray-600">Entreprises valides</div>
                <div className="text-2xl font-bold text-[#2D3748]">{approvedCompanies.length}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-sm text-gray-600">Reservations confirmees</div>
                <div className="text-2xl font-bold text-[#2D3748]">{stats.totalVisits}</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-md">
                <div className="text-sm text-gray-600">Utilisateurs</div>
                <div className="text-2xl font-bold text-[#2D3748]">{usersCount}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <h3 className="font-semibold text-[#2D3748] mb-3">Top 5 entreprises</h3>
              <div className="space-y-3">
                {topCompanies.length === 0 ? (
                  <div className="text-sm text-gray-600">Aucune donnee</div>
                ) : (
                  topCompanies.map((company, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div>
                        <div className="font-medium text-[#2D3748]">
                          #{index + 1} {company.name}
                        </div>
                        <div className="text-gray-600">
                          {company.visits} visites - {company.students} lyceens
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {activeView === "datagouv" && (
          <section className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-[#2D3748]">Mapping DataGouv Export</h1>
              <p className="text-gray-600">
                Choisis la source pour chaque champ DataGouv puis exporte en CSV.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-md space-y-4">
              {exportError && <div className="text-sm text-red-600">{exportError}</div>}
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#F7FAFC] text-left text-gray-600">
                    <tr>
                      <th className="px-3 py-2 font-medium">Champ DataGouv</th>
                      <th className="px-3 py-2 font-medium">Source</th>
                      <th className="px-3 py-2 font-medium">Valeur fixe</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {DATAGOUV_FIELDS.map((field) => {
                      const mapping = exportMapping[field.field] ?? {
                        source: "",
                        staticValue: "",
                      };
                      return (
                        <tr key={field.field}>
                          <td className="px-3 py-2 text-gray-800">{field.label}</td>
                          <td className="px-3 py-2">
                            <select
                              value={mapping.source}
                              onChange={(event) =>
                                setExportMapping((prev) => ({
                                  ...prev,
                                  [field.field]: {
                                    source: event.target.value,
                                    staticValue: mapping.staticValue ?? "",
                                  },
                                }))
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm"
                            >
                              {DATA_SOURCES.map((source) => (
                                <option key={source.id} value={source.id}>
                                  {source.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              value={mapping.staticValue}
                              onChange={(event) =>
                                setExportMapping((prev) => ({
                                  ...prev,
                                  [field.field]: {
                                    source: mapping.source || "static",
                                    staticValue: event.target.value,
                                  },
                                }))
                              }
                              disabled={mapping.source !== "static"}
                              className="w-full px-2 py-1 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-gray-500">
                  Export base sur les creneaux et leurs entreprises associees.
                  {exportSavedAt ? ` Derniere sauvegarde: ${formatDate(exportSavedAt)}.` : ""}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveExportMapping}
                    disabled={exportLoading}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 disabled:opacity-60"
                  >
                    Enregistrer le mapping
                  </button>
                  <button
                    onClick={handleExportDatagouv}
                    disabled={exportLoading}
                    className="px-4 py-2 text-sm bg-[#2C5F8D] text-white rounded-lg disabled:opacity-60"
                  >
                    {exportLoading ? "Export..." : "Exporter CSV DataGouv"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {manageCompany && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-5xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-[#2D3748]">Gerer entreprise</h2>
                <p className="text-sm text-gray-500">{manageCompany.name}</p>
              </div>
              <button
                onClick={closeManageCompany}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-6 pt-4 space-y-4">
              <div className="flex flex-wrap gap-2 border-b pb-3">
                {[
                  { id: "presentation", label: "Presentation" },
                  { id: "info", label: "Infos pratiques" },
                  { id: "slots", label: "Creneaux" },
                  { id: "media", label: "Media" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() =>
                      setManageTab(tab.id as "presentation" | "info" | "slots" | "media")
                    }
                    className={`px-3 py-1.5 text-sm rounded-lg ${
                      manageTab === tab.id
                        ? "bg-[#FF6B35] text-white"
                        : "bg-[#F7FAFC] text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {manageError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {manageError}
                </div>
              )}

              {manageLoading && <div className="text-sm text-gray-500">Chargement...</div>}

              {manageTab === "presentation" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={companyForm.name}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={companyForm.description}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, description: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Themes (slugs, separes par des virgules)
                    </label>
                    <input
                      type="text"
                      value={companyForm.themes}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, themes: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {manageTab === "info" && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Compte associe
                    </label>
                    <select
                      value={companyForm.user_id}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, user_id: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Aucun</option>
                      {users.map((user) => {
                        const linkedCompany = companies.find(
                          (company) => company.user_id === user.id && company.id !== manageCompany?.id
                        );
                        const label = `${user.full_name ?? user.email ?? user.id}${
                          linkedCompany ? " (deja lie)" : ""
                        }`;
                        return (
                          <option key={user.id} value={user.id} disabled={Boolean(linkedCompany)}>
                            {label}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={companyForm.address}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, address: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">Ville</label>
                    <input
                      type="text"
                      value={companyForm.city}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, city: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Code postal
                    </label>
                    <input
                      type="text"
                      value={companyForm.postal_code}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, postal_code: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">Contact</label>
                    <input
                      type="text"
                      value={companyForm.contact_name}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, contact_name: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">Email</label>
                    <input
                      type="email"
                      value={companyForm.contact_email}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, contact_email: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Telephone
                    </label>
                    <input
                      type="text"
                      value={companyForm.contact_phone}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, contact_phone: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">SIRET</label>
                    <input
                      type="text"
                      value={companyForm.siret}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({ ...prev, siret: event.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 text-sm text-[#2D3748]">
                      <input
                        type="checkbox"
                        checked={companyForm.pmr_accessible}
                        onChange={(event) =>
                          setCompanyForm((prev) => ({
                            ...prev,
                            pmr_accessible: event.target.checked,
                          }))
                        }
                      />
                      Accessible PMR
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Mesures de securite
                    </label>
                    <textarea
                      rows={3}
                      value={companyForm.safety_measures}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          safety_measures: event.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Equipement fourni
                    </label>
                    <textarea
                      rows={2}
                      value={companyForm.equipment_provided}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          equipment_provided: event.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#2D3748] mb-2">
                      Equipement requis
                    </label>
                    <textarea
                      rows={2}
                      value={companyForm.equipment_required}
                      onChange={(event) =>
                        setCompanyForm((prev) => ({
                          ...prev,
                          equipment_required: event.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {manageTab === "slots" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#2D3748]">Creneaux</h3>
                    <button
                      onClick={() => startEditSlot()}
                      className="px-3 py-1.5 text-sm bg-[#FF6B35] text-white rounded-lg"
                    >
                      Nouveau creneau
                    </button>
                  </div>

                  {slotForm && (
                    <div className="rounded-lg border border-gray-200 p-4 space-y-3">
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Date</label>
                          <input
                            type="date"
                            value={slotForm.date}
                            onChange={(event) =>
                              setSlotForm((prev) =>
                                prev ? { ...prev, date: event.target.value } : prev
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Debut</label>
                          <input
                            type="time"
                            value={slotForm.startTime}
                            onChange={(event) =>
                              setSlotForm((prev) =>
                                prev ? { ...prev, startTime: event.target.value } : prev
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Fin</label>
                          <input
                            type="time"
                            value={slotForm.endTime}
                            onChange={(event) =>
                              setSlotForm((prev) =>
                                prev ? { ...prev, endTime: event.target.value } : prev
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Capacite</label>
                          <input
                            type="number"
                            value={slotForm.capacity}
                            onChange={(event) =>
                              setSlotForm((prev) =>
                                prev ? { ...prev, capacity: event.target.value } : prev
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Type</label>
                          <input
                            type="text"
                            value={slotForm.visit_type}
                            onChange={(event) =>
                              setSlotForm((prev) =>
                                prev ? { ...prev, visit_type: event.target.value } : prev
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Statut</label>
                          <select
                            value={slotForm.status}
                            onChange={(event) =>
                              setSlotForm((prev) =>
                                prev ? { ...prev, status: event.target.value } : prev
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="open">open</option>
                            <option value="full">full</option>
                            <option value="cancelled">cancelled</option>
                            <option value="completed">completed</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                        <textarea
                          rows={2}
                          value={slotForm.description}
                          onChange={(event) =>
                            setSlotForm((prev) =>
                              prev ? { ...prev, description: event.target.value } : prev
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Instructions</label>
                        <textarea
                          rows={2}
                          value={slotForm.specific_instructions}
                          onChange={(event) =>
                            setSlotForm((prev) =>
                              prev ? { ...prev, specific_instructions: event.target.value } : prev
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-sm text-[#2D3748]">
                        <input
                          type="checkbox"
                          checked={slotForm.requires_manual_validation}
                          onChange={(event) =>
                            setSlotForm((prev) =>
                              prev
                                ? { ...prev, requires_manual_validation: event.target.checked }
                                : prev
                            )
                          }
                        />
                        Validation manuelle
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSlotForm(null)}
                          className="px-3 py-1.5 text-sm text-gray-600"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={saveSlotForm}
                          className="px-3 py-1.5 text-sm bg-[#2C5F8D] text-white rounded-lg"
                        >
                          Enregistrer
                        </button>
                      </div>
                    </div>
                  )}

                  {companySlots.length === 0 ? (
                    <div className="text-sm text-gray-600">Aucun creneau</div>
                  ) : (
                    <div className="space-y-2">
                      {companySlots.map((slot) => (
                        <div key={slot.id} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="text-sm font-medium text-[#2D3748]">
                                {formatDate(slot.start_datetime)} {formatTime(slot.start_datetime)} -{" "}
                                {formatTime(slot.end_datetime)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {slot.visit_type ?? "-"} | {slot.capacity ?? 0} places
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditSlot(slot)}
                                className="px-3 py-1 text-xs bg-[#F7FAFC] text-gray-700 rounded-lg"
                              >
                                Modifier
                              </button>
                              <button
                                onClick={() => deleteSlot(slot.id)}
                                className="px-3 py-1 text-xs text-red-600"
                              >
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {manageTab === "media" && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#2D3748] mb-2">
                        Logo URL
                      </label>
                      <input
                        type="text"
                        value={companyForm.logo_url}
                        onChange={(event) =>
                          setCompanyForm((prev) => ({ ...prev, logo_url: event.target.value }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#2D3748] mb-2">
                        Banner URL
                      </label>
                      <input
                        type="text"
                        value={companyForm.banner_url}
                        onChange={(event) =>
                          setCompanyForm((prev) => ({ ...prev, banner_url: event.target.value }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#2D3748]">Galerie photos</h3>
                    </div>
                    <div className="flex flex-col md:flex-row gap-2">
                      <input
                        type="text"
                        value={photoUrlInput}
                        onChange={(event) => setPhotoUrlInput(event.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={addPhoto}
                        className="px-4 py-2 bg-[#2C5F8D] text-white rounded-lg text-sm"
                      >
                        Ajouter
                      </button>
                    </div>
                    {companyPhotos.length === 0 ? (
                      <div className="text-sm text-gray-600">Aucune photo</div>
                    ) : (
                      <div className="space-y-2">
                        {companyPhotos.map((photo) => (
                          <div
                            key={photo.id}
                            className="flex items-center justify-between gap-2 text-sm"
                          >
                            <span className="text-gray-700 truncate">{photo.photo_url}</span>
                            <button
                              onClick={() => deletePhoto(photo.id)}
                              className="text-red-600 text-xs"
                            >
                              Supprimer
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 p-6 border-t bg-[#F7FAFC]">
              <button onClick={deleteCompany} className="text-red-600 text-sm">
                Supprimer l'entreprise
              </button>
              <div className="flex gap-2">
                <button
                  onClick={closeManageCompany}
                  className="px-4 py-2 text-sm text-gray-600"
                >
                  Fermer
                </button>
                <button
                  onClick={saveCompanyForm}
                  className="px-4 py-2 text-sm bg-[#FF6B35] text-white rounded-lg"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showValidationModal && selectedCompany && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#2D3748]">Validation entreprise</h2>
              <button onClick={() => setShowValidationModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div>Nom: {selectedCompany.name}</div>
              <div>Ville: {selectedCompany.city ?? "-"}</div>
              <div>Adresse: {selectedCompany.address ?? "-"}</div>
              <div>Code postal: {selectedCompany.postal_code ?? "-"}</div>
              <div>Secteur: {themeMap.get(selectedCompany.themes?.[0] ?? "")?.name ?? "Autre"}</div>
              <div>SIRET: {selectedCompany.siret ?? "-"}</div>
              <div>Contact: {selectedCompany.contact_name ?? "-"}</div>
              <div>Email: {selectedCompany.contact_email ?? "-"}</div>
            </div>
            <div className="text-sm text-gray-700 whitespace-pre-line">
              {selectedCompany.description ?? "-"}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-4 py-2 text-sm text-gray-700"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  updateCompanyStatus(selectedCompany.id, "rejected");
                  setShowValidationModal(false);
                }}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg"
              >
                Refuser
              </button>
              <button
                onClick={() => {
                  approveCompanyWithInvite(selectedCompany.id);
                  setShowValidationModal(false);
                }}
                className="px-4 py-2 text-sm bg-[#34A853] text-white rounded-lg"
              >
                Valider + compte
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
