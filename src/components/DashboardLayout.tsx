import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Factory } from "lucide-react";
import { supabase } from "../lib/supabase";

interface MenuItem {
  path: string;
  label: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  menuItems: MenuItem[];
  userType?: "student" | "company" | "admin";
}

export function DashboardLayout({ children, menuItems, userType = "student" }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#F7FAFC]">
      <div className="lg:hidden sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-[#2C5F8D] p-2 rounded-lg">
            <Factory className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-[#2D3748]">Semaine de l'Industrie</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex">
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-30 h-screen
            w-64 bg-white border-r flex flex-col
            transition-transform duration-300 lg:translate-x-0
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <div className="hidden lg:flex items-center gap-2 p-6 border-b">
            <div className="bg-[#2C5F8D] p-2 rounded-lg">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-[#2D3748] text-sm leading-tight">
                Semaine de l'Industrie
              </div>
              <div className="text-xs text-gray-500">
                {userType === "student"
                  ? "Espace lyceen"
                  : userType === "company"
                  ? "Espace entreprise"
                  : "Espace admin"}
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.path)
                        ? "bg-[#FF6B35] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.icon}
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#2C5F8D] flex items-center justify-center text-white font-semibold">
                {userType === "student" ? "LS" : userType === "company" ? "E" : "A"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#2D3748] text-sm truncate">
                  {userType === "student" ? "User" : userType === "company" ? "Company" : "Admin"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {userType === "student" ? "School" : userType === "company" ? "City" : "Admin"}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full text-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              Deconnexion
            </button>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          />
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
