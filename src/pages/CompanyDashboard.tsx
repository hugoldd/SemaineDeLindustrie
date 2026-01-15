import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Mail,
  Plus,
  Edit,
  Trash2,
  Users,
  Download,
  Printer,
  X,
  Check,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { supabase } from "../lib/supabase";

type CompanyRow = {
  id: string;
  name: string;
};

type SlotRow = {
  id: string;
  start_datetime: string;
  end_datetime: string;
  capacity: number;
  available_spots: number;
  visit_type: string | null;
  status: string | null;
  description: string | null;
  specific_instructions: string | null;
  requires_manual_validation: boolean | null;
};

type BookingRow = {
  id: string;
  status: string | null;
  booking_type: string | null;
  number_of_participants: number | null;
  time_slots:
    | {
        id: string;
        start_datetime: string;
        end_datetime: string;
        visit_type: string | null;
      }
    | null;
  user:
    | {
        full_name: string | null;
        email: string | null;
        phone: string | null;
      }
    | null;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
};

const formatTime = (value: string) => {
  const date = new Date(value);
  return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

const toDateInput = (value: string) => {
  const date = new Date(value);
  const pad = (num: number) => num.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export function CompanyDashboard() {
  const location = useLocation();
  const [activeView, setActiveView] = useState<"dashboard" | "slots" | "profile" | "messages">(
    "dashboard"
  );
  const [slotFilter, setSlotFilter] = useState<"all" | "upcoming" | "past" | "full">("all");
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<SlotRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyRow | null>(null);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [slotForm, setSlotForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    capacity: "",
    visit_type: "",
    description: "",
    specific_instructions: "",
    requires_manual_validation: false,
  });
  const [participantsSlotId, setParticipantsSlotId] = useState<string | null>(null);

  const menuItems = [
    { path: "/company-dashboard", label: "Tableau de bord", icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: "/company-dashboard/slots", label: "Mes creneaux", icon: <Calendar className="w-5 h-5" /> },
    { path: "/company-dashboard/profile", label: "Profil entreprise", icon: <Building2 className="w-5 h-5" /> },
    { path: "/company-dashboard/messages", label: "Messages", icon: <Mail className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (location.pathname.endsWith("/slots")) {
      setActiveView("slots");
      return;
    }
    if (location.pathname.endsWith("/profile")) {
      setActiveView("profile");
      return;
    }
    if (location.pathname.endsWith("/messages")) {
      setActiveView("messages");
      return;
    }
    setActiveView("dashboard");
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const { data: authResult } = await supabase.auth.getUser();
        const user = authResult.user;
        if (!user) {
          throw new Error("missing user");
        }

        const { data: companyRow, error: companyError } = await supabase
          .from("companies")
          .select("id, name")
          .eq("user_id", user.id)
          .single();

        if (companyError) {
          throw companyError;
        }

        const [slotsResult, bookingsResult] = await Promise.all([
          supabase
            .from("time_slots")
            .select(
              "id, start_datetime, end_datetime, capacity, available_spots, visit_type, status, description, specific_instructions, requires_manual_validation"
            )
            .eq("company_id", companyRow.id)
            .order("start_datetime", { ascending: true }),
          supabase
            .from("bookings")
            .select(
              "id, status, booking_type, number_of_participants, time_slots:time_slot_id ( id, start_datetime, end_datetime, visit_type ), user:users ( full_name, email, phone )"
            )
            .eq("time_slots.company_id", companyRow.id),
        ]);

        if (slotsResult.error) {
          throw slotsResult.error;
        }
        if (bookingsResult.error) {
          throw bookingsResult.error;
        }

        if (isMounted) {
          setCompany(companyRow);
          setSlots(slotsResult.data ?? []);
          setBookings(bookingsResult.data ?? []);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError("Impossible de charger les donnees entreprise.");
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

  const filteredSlots = useMemo(() => {
    const now = new Date();
    return slots.filter((slot) => {
      if (slotFilter === "all") {
        return true;
      }
      if (slotFilter === "full") {
        return slot.available_spots === 0;
      }
      const start = new Date(slot.start_datetime);
      if (slotFilter === "upcoming") {
        return start >= now;
      }
      if (slotFilter === "past") {
        return start < now;
      }
      return true;
    });
  }, [slotFilter, slots]);

  const kpis = useMemo(() => {
    const totalVisits = slots.length;
    const totalRegistered = bookings.reduce((sum, booking) => {
      const participants =
        booking.booking_type === "group" ? booking.number_of_participants ?? 0 : 1;
      return sum + participants;
    }, 0);
    const totalCapacity = slots.reduce((sum, slot) => sum + (slot.capacity ?? 0), 0);
    const averageFillRate = totalCapacity
      ? Math.round((totalRegistered / totalCapacity) * 100)
      : 0;
    const nextSlot = slots.find((slot) => new Date(slot.start_datetime) >= new Date());

    return {
      totalVisits,
      totalRegistered,
      averageFillRate,
      nextVisit: nextSlot ? formatDate(nextSlot.start_datetime) : "-",
    };
  }, [slots, bookings]);

  const openSlotModal = (slot?: SlotRow) => {
    if (!slot) {
      setEditingSlot(null);
      setSlotForm({
        date: "",
        startTime: "",
        endTime: "",
        capacity: "",
        visit_type: "",
        description: "",
        specific_instructions: "",
        requires_manual_validation: false,
      });
      setShowSlotModal(true);
      return;
    }
    setEditingSlot(slot);
    setSlotForm({
      date: toDateInput(slot.start_datetime),
      startTime: formatTime(slot.start_datetime),
      endTime: formatTime(slot.end_datetime),
      capacity: String(slot.capacity ?? ""),
      visit_type: slot.visit_type ?? "",
      description: slot.description ?? "",
      specific_instructions: slot.specific_instructions ?? "",
      requires_manual_validation: slot.requires_manual_validation ?? false,
    });
    setShowSlotModal(true);
  };

  const saveSlot = async () => {
    if (!company) {
      return;
    }
    const start = slotForm.date && slotForm.startTime ? `${slotForm.date}T${slotForm.startTime}:00` : "";
    const end = slotForm.date && slotForm.endTime ? `${slotForm.date}T${slotForm.endTime}:00` : "";
    const capacityValue = Number(slotForm.capacity || 0);

    try {
      if (editingSlot) {
        const { error } = await supabase
          .from("time_slots")
          .update({
            start_datetime: new Date(start).toISOString(),
            end_datetime: new Date(end).toISOString(),
            capacity: capacityValue,
            visit_type: slotForm.visit_type,
            description: slotForm.description,
            specific_instructions: slotForm.specific_instructions,
            requires_manual_validation: slotForm.requires_manual_validation,
          })
          .eq("id", editingSlot.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("time_slots").insert({
          company_id: company.id,
          start_datetime: new Date(start).toISOString(),
          end_datetime: new Date(end).toISOString(),
          capacity: capacityValue,
          available_spots: capacityValue,
          visit_type: slotForm.visit_type,
          description: slotForm.description,
          specific_instructions: slotForm.specific_instructions,
          requires_manual_validation: slotForm.requires_manual_validation,
          status: "open",
        });

        if (error) {
          throw error;
        }
      }

      const { data: updatedSlots } = await supabase
        .from("time_slots")
        .select(
          "id, start_datetime, end_datetime, capacity, available_spots, visit_type, status, description, specific_instructions, requires_manual_validation"
        )
        .eq("company_id", company.id)
        .order("start_datetime", { ascending: true });
      setSlots(updatedSlots ?? []);
      setShowSlotModal(false);
    } catch (error) {
      setLoadError("Impossible d'enregistrer le creneau.");
    }
  };

  const deleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase.from("time_slots").delete().eq("id", slotId);
      if (error) {
        throw error;
      }
      setSlots((prev) => prev.filter((slot) => slot.id !== slotId));
    } catch (error) {
      setLoadError("Impossible de supprimer le creneau.");
    }
  };

  const participantsForModal = useMemo(() => {
    if (!participantsSlotId) {
      return [];
    }
    return bookings.filter((booking) => booking.time_slots?.id === participantsSlotId);
  }, [bookings, participantsSlotId]);

  if (isLoading) {
    return (
      <DashboardLayout menuItems={menuItems} userType="company">
        <div className="p-4 text-gray-600">Chargement...</div>
      </DashboardLayout>
    );
  }

  if (loadError) {
    return (
      <DashboardLayout menuItems={menuItems} userType="company">
        <div className="p-4">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems} userType="company">
      <div className="p-4 md:p-8">
        {activeView === "dashboard" && (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-[#2D3748] mb-2">
                Tableau de bord
              </h1>
              <p className="text-gray-600">Bienvenue, {company?.name ?? "-"}</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-sm text-gray-600 mb-2">Total visites planifiees</div>
                <div className="text-3xl font-bold text-[#2C5F8D] mb-1">{kpis.totalVisits}</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-sm text-gray-600 mb-2">Total inscrits</div>
                <div className="text-3xl font-bold text-[#FF6B35] mb-1">{kpis.totalRegistered}</div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-sm text-gray-600 mb-2">Taux de remplissage moyen</div>
                <div className="text-3xl font-bold text-[#34A853] mb-1">
                  {kpis.averageFillRate}%
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <div className="text-sm text-gray-600 mb-2">Prochaine visite</div>
                <div className="text-xl font-bold text-[#2D3748] mb-1">{kpis.nextVisit}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-[#2D3748]">Prochaines visites</h3>
                <button
                  onClick={() => setActiveView("slots")}
                  className="text-sm text-[#2C5F8D] hover:text-[#1e4161]"
                >
                  Voir tout
                </button>
              </div>
              <div className="space-y-4">
                {slots
                  .filter((slot) => new Date(slot.start_datetime) >= new Date())
                  .slice(0, 3)
                  .map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-[#F7FAFC] rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-[#2D3748] mb-1">
                          {formatDate(slot.start_datetime)} - {formatTime(slot.start_datetime)}
                        </div>
                        <div className="text-sm text-gray-600">{slot.visit_type ?? "-"}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-[#2C5F8D]">
                          {slot.capacity - slot.available_spots}/{slot.capacity}
                        </div>
                        <div className="text-xs text-gray-600">inscrits</div>
                      </div>
                      <button
                        onClick={() => {
                          setParticipantsSlotId(slot.id);
                          setShowParticipantsModal(true);
                        }}
                        className="px-4 py-2 bg-[#2C5F8D] text-white rounded-lg hover:bg-[#1e4161] transition-colors text-sm"
                      >
                        Participants
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeView === "slots" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[#2D3748] mb-2">
                  Mes creneaux
                </h1>
                <p className="text-gray-600">Gerer vos visites et inscriptions</p>
              </div>
              <button
                onClick={() => openSlotModal()}
                className="flex items-center gap-2 px-6 py-3 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E85A2A] transition-colors"
              >
                <Plus className="w-5 h-5" />
                Creer un creneau
              </button>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto">
              {[
                { id: "all", label: "Tous" },
                { id: "upcoming", label: "A venir" },
                { id: "past", label: "Passes" },
                { id: "full", label: "Complets" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSlotFilter(filter.id as "all" | "upcoming" | "past" | "full")}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    slotFilter === filter.id
                      ? "bg-[#FF6B35] text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredSlots.map((slot) => {
                const registered = slot.capacity - slot.available_spots;
                return (
                  <div key={slot.id} className="bg-white rounded-xl p-6 shadow-md">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3 className="font-semibold text-[#2D3748]">
                            {formatDate(slot.start_datetime)}
                          </h3>
                          <span className="text-sm text-gray-600">
                            {formatTime(slot.start_datetime)} - {formatTime(slot.end_datetime)}
                          </span>
                          <span className="px-3 py-1 rounded-full text-sm bg-[#F7FAFC] text-gray-700">
                            {slot.status ?? "open"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{slot.visit_type ?? "-"}</p>
                        <div className="text-sm text-gray-700">
                          {registered}/{slot.capacity} inscrits
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setParticipantsSlotId(slot.id);
                            setShowParticipantsModal(true);
                          }}
                          className="px-4 py-2 bg-[#2C5F8D] text-white rounded-lg hover:bg-[#1e4161] transition-colors text-sm"
                        >
                          Participants
                        </button>
                        <button
                          onClick={() => openSlotModal(slot)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteSlot(slot.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showSlotModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-[#2D3748]">
                {editingSlot ? "Modifier le creneau" : "Creer un nouveau creneau"}
              </h2>
              <button
                onClick={() => setShowSlotModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">Date</label>
                  <input
                    type="date"
                    value={slotForm.date}
                    onChange={(event) =>
                      setSlotForm((prev) => ({ ...prev, date: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">
                    Nombre de places
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={slotForm.capacity}
                    onChange={(event) =>
                      setSlotForm((prev) => ({ ...prev, capacity: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">
                    Heure de debut
                  </label>
                  <input
                    type="time"
                    value={slotForm.startTime}
                    onChange={(event) =>
                      setSlotForm((prev) => ({ ...prev, startTime: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2D3748] mb-2">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    value={slotForm.endTime}
                    onChange={(event) =>
                      setSlotForm((prev) => ({ ...prev, endTime: event.target.value }))
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2">
                  Type de visite
                </label>
                <input
                  type="text"
                  value={slotForm.visit_type}
                  onChange={(event) =>
                    setSlotForm((prev) => ({ ...prev, visit_type: event.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2">
                  Description et instructions
                </label>
                <textarea
                  rows={4}
                  value={slotForm.description}
                  onChange={(event) =>
                    setSlotForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#2D3748] mb-2">
                  Instructions specifiques
                </label>
                <textarea
                  rows={3}
                  value={slotForm.specific_instructions}
                  onChange={(event) =>
                    setSlotForm((prev) => ({ ...prev, specific_instructions: event.target.value }))
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slotForm.requires_manual_validation}
                    onChange={(event) =>
                      setSlotForm((prev) => ({
                        ...prev,
                        requires_manual_validation: event.target.checked,
                      }))
                    }
                    className="w-5 h-5 text-[#FF6B35] rounded"
                  />
                  <span className="text-sm text-[#2D3748]">Validation manuelle</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t bg-[#F7FAFC]">
              <button
                onClick={() => setShowSlotModal(false)}
                className="px-6 py-2.5 text-[#2D3748] hover:bg-white rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={saveSlot}
                className="px-6 py-2.5 bg-[#FF6B35] text-white rounded-lg hover:bg-[#E85A2A] transition-colors"
              >
                {editingSlot ? "Enregistrer" : "Publier le creneau"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showParticipantsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full my-8">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold text-[#2D3748]">Liste des participants</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {participantsSlotId ? `Creneau ${participantsSlotId}` : ""}
                </p>
              </div>
              <button
                onClick={() => setShowParticipantsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-3 mb-6">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#2C5F8D] text-white rounded-lg hover:bg-[#1e4161] transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  Exporter (Excel)
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  <Printer className="w-4 h-4" />
                  Imprimer emargement
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#2D3748]">
                        Nom
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#2D3748]">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#2D3748]">
                        Telephone
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#2D3748]">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[#2D3748]">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {participantsForModal.map((participant) => (
                      <tr key={participant.id} className="border-b hover:bg-[#F7FAFC]">
                        <td className="py-3 px-4 text-sm">
                          {participant.user?.full_name ?? "-"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {participant.user?.email ?? "-"}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {participant.user?.phone ?? "-"}
                        </td>
                        <td className="py-3 px-4 text-sm">{participant.booking_type ?? "-"}</td>
                        <td className="py-3 px-4 text-sm">{participant.status ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
