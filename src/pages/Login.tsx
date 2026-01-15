import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setInfo(null);
    setIsLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setIsLoading(false);
      setError('Identifiants invalides.');
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      setIsLoading(false);
      setError('Profil utilisateur introuvable.');
      return;
    }

    if (profile.role === 'admin') {
      navigate('/admin-dashboard');
    } else if (profile.role === 'company') {
      navigate('/company-dashboard');
    } else {
      navigate('/student-dashboard');
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim()) {
      setError("Renseignez votre email pour recevoir le lien.");
      return;
    }
    setIsResetting(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (resetError) {
      setError("Impossible d'envoyer le lien.");
    } else {
      setInfo("Lien de reinitialisation envoye par email.");
    }
    setIsResetting(false);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#2D3748]">Connexion</h1>
          <p className="text-sm text-gray-600">Accedez a votre espace.</p>
        </div>

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
            <label className="block text-sm font-medium text-[#2D3748] mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              placeholder="email@exemple.fr"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3748] mb-2">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              placeholder="Votre mot de passe"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#FF6B35] text-white py-2.5 rounded-lg hover:bg-[#E85A2A] transition-colors disabled:opacity-70"
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={isResetting}
          className="mt-3 text-sm text-[#2C5F8D] hover:underline disabled:opacity-70"
        >
          {isResetting ? 'Envoi en cours...' : 'Mot de passe oublie ?'}
        </button>

        <div className="mt-6 text-sm text-gray-600">
          <span>Pas encore de compte ? </span>
          <Link to="/register" className="text-[#2C5F8D] hover:underline">
            Creer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
