import { supabase } from "../supabase";
import type { Database } from "../supabase";

type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
type PhotoRow = Database["public"]["Tables"]["company_photos"]["Row"];
type SlotRow = Database["public"]["Tables"]["time_slots"]["Row"];

export type UiTheme = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
};

export type UiVisit = {
  id: string;
  date: string;
  time: string;
  duration: number;
  capacity: number;
  registered: number;
  type: string;
};

export type UiCompany = {
  id: string;
  name: string;
  city: string;
  address: string;
  postalCode: string;
  lat: number;
  lng: number;
  thematic: string;
  thematicName: string;
  thematicColor: string;
  description: string;
  logo: string;
  banner: string;
  photos: string[];
  whatYouWillDiscover: string[];
  jobs: string[];
  accessibility: {
    pmr: boolean;
    parking: boolean;
  };
  safety: string[];
  equipmentProvided: string[];
  equipmentToBring: string[];
  contact: {
    name: string;
    email: string;
    phone: string;
  };
  visits: UiVisit[];
};

const fallbackLogo = "https://placehold.co/200x200?text=Logo";
const fallbackBanner = "https://placehold.co/1200x600?text=Company";

const listFromText = (value: string | null) => {
  if (!value) {
    return [];
  }
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
};

const toVisit = (slot: SlotRow): UiVisit => {
  const start = new Date(slot.start_datetime);
  const end = new Date(slot.end_datetime);
  const duration = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
  const available = slot.available_spots ?? 0;
  const registered = Math.max(0, (slot.capacity ?? 0) - available);

  return {
    id: slot.id,
    date: start.toISOString().slice(0, 10),
    time: start.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    duration,
    capacity: slot.capacity ?? 0,
    registered,
    type: slot.visit_type ?? "Visit",
  };
};

const buildThemeMap = (themes: UiTheme[]) => {
  const map = new Map<string, UiTheme>();
  themes.forEach((theme) => {
    map.set(theme.id, theme);
  });
  return map;
};

const buildCompany = (
  company: CompanyRow,
  themesMap: Map<string, UiTheme>,
  slots: SlotRow[],
  photos: PhotoRow[]
): UiCompany => {
  const themeId = company.themes?.[0] ?? "other";
  const theme = themesMap.get(themeId);

  return {
    id: company.id,
    name: company.name,
    city: company.city ?? "",
    address: company.address ?? "",
    postalCode: company.postal_code ?? "",
    lat: company.latitude ?? 0,
    lng: company.longitude ?? 0,
    thematic: themeId,
    thematicName: theme?.name ?? "Other",
    thematicColor: theme?.color ?? "#2C5F8D",
    description: company.description ?? "",
    logo: company.logo_url ?? fallbackLogo,
    banner: company.banner_url ?? fallbackBanner,
    photos: photos
      .slice()
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((photo) => photo.photo_url),
    whatYouWillDiscover: [],
    jobs: [],
    accessibility: {
      pmr: company.pmr_accessible ?? false,
      parking: false,
    },
    safety: listFromText(company.safety_measures),
    equipmentProvided: listFromText(company.equipment_provided),
    equipmentToBring: listFromText(company.equipment_required),
    contact: {
      name: company.contact_name ?? "",
      email: company.contact_email ?? "",
      phone: company.contact_phone ?? "",
    },
    visits: slots.map(toVisit),
  };
};

export const fetchThemes = async (): Promise<UiTheme[]> => {
  const { data, error } = await supabase
    .from("themes")
    .select("name, slug, icon, color")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((theme) => ({
    id: theme.slug,
    name: theme.name,
    color: theme.color ?? "#2C5F8D",
    icon: theme.icon ?? null,
  }));
};

const fetchSlotsForCompanies = async (companyIds: string[]) => {
  if (companyIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("time_slots")
    .select("id, company_id, start_datetime, end_datetime, capacity, available_spots, visit_type")
    .in("company_id", companyIds);

  if (error) {
    throw error;
  }

  return data ?? [];
};

const fetchPhotosForCompanies = async (companyIds: string[]) => {
  if (companyIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("company_photos")
    .select("id, company_id, photo_url, order_index")
    .in("company_id", companyIds);

  if (error) {
    return [];
  }

  return data ?? [];
};

const fetchCompaniesByFilter = async (filter: (query: any) => any): Promise<UiCompany[]> => {
  const { data, error } = await filter(
    supabase
      .from("companies")
      .select(
        "id, name, description, address, city, postal_code, latitude, longitude, logo_url, banner_url, themes, safety_measures, equipment_provided, equipment_required, pmr_accessible, contact_name, contact_email, contact_phone, status"
      )
  );

  if (error) {
    throw error;
  }

  const companies = data ?? [];
  const themes = await fetchThemes();
  const themeMap = buildThemeMap(themes);
  const companyIds = companies.map((company) => company.id);
  const slots = await fetchSlotsForCompanies(companyIds);
  const photos = await fetchPhotosForCompanies(companyIds);

  return companies.map((company) =>
    buildCompany(
      company,
      themeMap,
      slots.filter((slot) => slot.company_id === company.id),
      photos.filter((photo) => photo.company_id === company.id)
    )
  );
};

export const fetchThemesAndCompanies = async () => {
  const themes = await fetchThemes();
  const themeMap = buildThemeMap(themes);
  const { data, error } = await supabase
    .from("companies")
    .select(
      "id, name, description, address, city, postal_code, latitude, longitude, logo_url, banner_url, themes, safety_measures, equipment_provided, equipment_required, pmr_accessible, contact_name, contact_email, contact_phone, status"
    )
    .eq("status", "approved");

  if (error) {
    throw error;
  }

  const companies = data ?? [];
  const companyIds = companies.map((company) => company.id);
  const slots = await fetchSlotsForCompanies(companyIds);
  const photos = await fetchPhotosForCompanies(companyIds);

  const uiCompanies = companies.map((company) =>
    buildCompany(
      company,
      themeMap,
      slots.filter((slot) => slot.company_id === company.id),
      photos.filter((photo) => photo.company_id === company.id)
    )
  );

  return { themes, companies: uiCompanies };
};

export const fetchCompanies = async () => {
  return fetchCompaniesByFilter((query) => query.eq("status", "approved"));
};

export const fetchCompaniesByIds = async (companyIds: string[]) => {
  if (companyIds.length === 0) {
    return [];
  }
  return fetchCompaniesByFilter((query) => query.in("id", companyIds).eq("status", "approved"));
};

export const fetchCompanyById = async (companyId: string) => {
  const companies = await fetchCompaniesByFilter((query) =>
    query.eq("id", companyId).eq("status", "approved")
  );
  return companies[0] ?? null;
};
