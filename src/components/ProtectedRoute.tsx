import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: "admin" | "company" | "visitor";
};

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    let isMounted = true;

    const check = async () => {
      const { data: authResult } = await supabase.auth.getUser();
      const user = authResult.user;
      if (!user) {
        if (isMounted) {
          setIsAllowed(false);
          navigate("/login");
        }
        return;
      }

      if (!requiredRole) {
        if (isMounted) {
          setIsAllowed(true);
        }
        return;
      }

      const { data: userRow, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !userRow || userRow.role !== requiredRole) {
        if (isMounted) {
          setIsAllowed(false);
          navigate("/login");
        }
        return;
      }

      if (isMounted) {
        setIsAllowed(true);
      }
    };

    check();

    return () => {
      isMounted = false;
    };
  }, [navigate, requiredRole]);

  if (isAllowed === null) {
    return <div className="p-4 text-gray-600">Chargement...</div>;
  }

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
