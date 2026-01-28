import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  KeyIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  EyeSlashIcon,
  UserPlusIcon,
  LockClosedIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login({ email, motDePasse: password });
      console.log("JSON:",response);
      login(response); // response contient { token }
      navigate('/home');
    } catch (err) {
      console.error(err);
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        {/* Logo/En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Connexion
          </h1>
          <p className="text-gray-600">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {/* Champ Email */}
          <div>
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
            >
              <EnvelopeIcon className="w-4 h-4 mr-2" />
              Adresse email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label 
                htmlFor="password" 
                className="block text-sm font-medium text-gray-700 flex items-center"
              >
                <KeyIcon className="w-4 h-4 mr-2" />
                Mot de passe
              </label>
              <a 
                href="#" 
                className="text-sm text-emerald-600 hover:text-emerald-800 font-medium transition-colors flex items-center"
              >
                <LockClosedIcon className="w-4 h-4 mr-1" />
                Mot de passe oublié ?
              </a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                )}
              </button>
            </div>
          </div>

          {/* Case à cocher "Se souvenir de moi" */}
          <div className="flex items-center">
            <div className="relative flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded cursor-pointer"
              />
              {rememberMe && (
                <CheckCircleIcon className="absolute h-4 w-4 text-emerald-600 pointer-events-none" />
              )}
            </div>
            <label 
              htmlFor="remember-me" 
              className="ml-2 block text-sm text-gray-700 cursor-pointer"
            >
              Se souvenir de moi
            </label>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            )}
            <span>{loading ? 'Connexion...' : 'Se connecter'}</span>
          </button>
        </form>

        {/* Lien d'inscription */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Pas encore de compte ?{" "}
            <a 
              href="#" 
              className="font-medium text-emerald-600 hover:text-emerald-800 transition-colors inline-flex items-center"
            >
              <UserPlusIcon className="w-4 h-4 mr-1" />
              S'inscrire
            </a>
          </p>
        </div>

        {/* Note de sécurité */}
        <div className="mt-8 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
          <div className="flex items-start space-x-3">
            <ShieldCheckIcon className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800">
              Votre sécurité est notre priorité. Toutes les données sont chiffrées et protégées.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;