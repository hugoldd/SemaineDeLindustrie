import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function SetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!isMounted) {
        return;
      }
      setHasSession(Boolean(data.session));
    };
    check();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (!password || password.length < 6) {
      setError("Mot de passe trop court (6 caracteres minimum).");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setIsLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setIsLoading(false);
      setError("Impossible de mettre a jour le mot de passe.");
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;

    if (userId) {
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", userId)
        .single();

      if (profile?.role === "admin") {
        navigate("/admin-dashboard");
        return;
      }
      if (profile?.role === "company") {
        navigate("/company-dashboard");
        return;
      }
      if (profile?.role === "visitor") {
        navigate("/student-dashboard");
        return;
      }
    }

    setInfo("Mot de passe mis a jour. Vous pouvez vous connecter.");
    setTimeout(() => navigate("/login"), 1200);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2D3748]">Definir un mot de passe</h1>
          <p className="text-sm text-gray-600">
            Choisissez un mot de passe pour acceder a votre compte.
          </p>
        </div>

        {hasSession === false && (
          <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            Session invalide. Reconnectez-vous pour continuer.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#2D3748] mb-2">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              required
              disabled={hasSession === false}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3748] mb-2">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              required
              disabled={hasSession === false}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || hasSession === false}
            className="w-full bg-[#FF6B35] text-white py-2.5 rounded-lg hover:bg-[#E85A2A] transition-colors disabled:opacity-70"
          >
            {isLoading ? "Mise a jour..." : "Valider"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="mt-4 text-sm text-[#2C5F8D] hover:underline"
        >
          Retour a la connexion
        </button>
      </div>
    </div>
  );
}
