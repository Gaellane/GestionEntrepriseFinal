// views/pages/Unauthorized.jsx
import { useNavigate } from 'react-router-dom';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <ShieldExclamationIcon className="w-10 h-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Accès Refusé
        </h1>
        <p className="text-gray-600 mb-8 max-w-md">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div className="space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;