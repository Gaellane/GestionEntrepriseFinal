import React, { useState, useEffect } from 'react';
import configurationApi from '../../api/configurationApi';
import { useAuth } from '../../hooks/useAuth';

const RemiseAlert = ({ remisePourcentage, onRemiseMaxChange }) => {
    const { user } = useAuth();
    const [remiseMax, setRemiseMax] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.role) {
            fetchRemiseMax();
        }
    }, [user]);

    useEffect(() => {
        if (onRemiseMaxChange && remiseMax !== null) {
            onRemiseMaxChange(remiseMax);
        }
    }, [remiseMax, onRemiseMaxChange]);

    const fetchRemiseMax = async () => {
        try {
            setLoading(true);
            const response = await configurationApi.getRemiseMaxByRole(user.role.roleCode);
            setRemiseMax(response.remiseMax);
        } catch (err) {
            console.error('Error fetching remise max:', err);
            setRemiseMax(0);
        } finally {
            setLoading(false);
        }
    };

    if (loading || remiseMax === null) {
        return null;
    }

    const remiseValue = parseFloat(remisePourcentage) || 0;
    const depassement = remiseValue > remiseMax;
    const proche = !depassement && remiseValue > (remiseMax * 0.8); // Alert si > 80% du plafond

    if (!depassement && !proche) {
        return null;
    }

    return (
        <div className={`mt-2 p-3 rounded-lg border ${depassement
                ? 'bg-red-50 border-red-300'
                : 'bg-yellow-50 border-yellow-300'
            }`}>
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {depassement ? (
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    )}
                </div>
                <div className="ml-3 flex-1">
                    <h3 className={`text-sm font-medium ${depassement ? 'text-red-800' : 'text-yellow-800'
                        }`}>
                        {depassement ? 'Dépassement du plafond de remise' : 'Remise proche du plafond'}
                    </h3>
                    <div className={`mt-2 text-sm ${depassement ? 'text-red-700' : 'text-yellow-700'
                        }`}>
                        <p>
                            Remise actuelle: <span className="font-bold">{remiseValue.toFixed(2)}%</span>
                        </p>
                        <p>
                            Plafond autorisé pour votre rôle ({user.role.roleName}): <span className="font-bold">{remiseMax}%</span>
                        </p>
                        {depassement && (
                            <p className="mt-2 font-semibold">
                                ⚠️ Vous devez réduire la remise ou obtenir une autorisation spéciale.
                            </p>
                        )}
                        {proche && (
                            <p className="mt-2">
                                💡 Vous approchez de votre limite de remise autorisée.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RemiseAlert;
