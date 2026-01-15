import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error) {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            if (isMounted) {
              navigate("/set-password", { replace: true });
            }
            return;
          }

          throw error;
        }

        if (isMounted) {
          navigate("/set-password", { replace: true });
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setStatus("error");
        setErrorMessage("Lien invalide ou expire. Reconnectez-vous.");
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        {status === "loading" ? (
          <>
            <h1 className="text-xl font-bold text-[#2D3748]">Validation du lien...</h1>
            <p className="text-sm text-gray-600 mt-2">Merci de patienter.</p>
          </>
        ) : (
          <>
            <h1 className="text-xl font-bold text-[#2D3748]">Echec de validation</h1>
            <p className="text-sm text-gray-600 mt-2">{errorMessage}</p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 px-4 py-2 rounded-lg bg-[#2C5F8D] text-white text-sm"
            >
              Retour a la connexion
            </button>
          </>
        )}
      </div>
    </div>
  );
}
