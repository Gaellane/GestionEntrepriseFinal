import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { 
    fetchAchatById, 
    validerAchatMagasinier, 
    validerAchatFinancier,
    fetchCommandesByAchatId,
    saveCommande,
    getCommandeByAchatId
} from "../../api/achatApi";

// Components
import AchatHeader from './components/AchatHeader';
import AchatInfoCard from './components/AchatInfoCard';
import AchatCommandesList from './components/AchatCommandesList';
import AchatBonCommande from './components/AchatBonCommande';
import AchatLivraison from './components/AchatLivraison';
import AchatReception from './components/AchatReception';
import AchatArticlesTable from './components/AchatArticlesTable';
import AchatSummaryCard from './components/AchatSummaryCard';
import AchatQuickActions from './components/AchatQuickActions';
import AchatHistoryTimeline from './components/AchatHistoryTimeline';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';

// Utils
import { getProcessConfig, calculerMontantTotal } from './utils/processConfig';

export default function AchatFiche() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [achat, setAchat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [commandes, setCommandes] = useState([]);

    const loadAchat = async () => {
        try {
            setLoading(true);
            const data = await fetchAchatById(id);
            setAchat(data);
            console.log('Achat data loaded:', data);
        } catch (err) {
            setError('Erreur lors du chargement de l\'achat');
            console.error('Error fetching achat:', err);
        } finally {
            setLoading(false);
        }
    };
    const loadCommandes = async () => {
        try {
            const commandesData = await fetchCommandesByAchatId(id);
            setCommandes(commandesData);
        } catch (err) {
            console.error('Error fetching commandes:', err);
        }
    };

    useEffect(() => {
        if (id) {
            loadAchat();
            loadCommandes();
        }
    }, [id]);

    const handleAction = async (actionType, processId) => {
        if (!achat) return;
        
        setActionLoading(true);
        try {
            switch (processId) {
                case 1:
                    const resMg = await validerAchatMagasinier(achat.id);
                    if (resMg.ok) {
                        alert('Achat validé par le magasinier avec succès');
                        const data = await fetchAchatById(id);
                        setAchat(data);
                    }
                    break;
                case 11:
                    const resFnc = await validerAchatFinancier(achat.id);
                    if (resFnc.ok) {
                        alert('Achat validé par le financier avec succès');
                        const data = await fetchAchatById(id);
                        setAchat(data);
                    }
                    break;
                case 21 :
                    navigate(`/achats/commande/saisie/${id}`);
                    break;
                case 25: 
                    navigate(`/achats/commande/saisie/${id}`);
                    break;
                default:
                    alert(`Action "${actionType}" non implémentée.`);
                    break;
            }
        } catch (err) {
            console.error('Error performing action:', err);
            alert('Une erreur est survenue lors de l\'exécution de l\'action');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = () => {
        if (!achat) return;
        
        if (window.confirm('Êtes-vous sûr de vouloir annuler cet achat ? Cette action est irréversible.')) {
            console.log(`Annulation achat ${achat.id}`);
            alert('Fonctionnalité d\'annulation à implémenter');
        }
    };
    
    const handleSaveCommande = async () => {
        if (!achat) return;
        try {
            await saveCommande(achat.id);
            alert('Commande sauvegardée avec succès');
            loadAchat();
            loadCommandes();
        } catch (err) {
            console.error('Error saving commande:', err);
            alert('Une erreur est survenue lors de la sauvegarde de la commande');
        }
    }

    const handleBack = () => navigate('/achats');
    const handlePrint = () => window.print();
    const handleShare = () => console.log('Partager');
    const handleDuplicate = () => console.log('Dupliquer');
    const handleEmail = () => console.log('Envoyer par email');
    const handleEdit = () => navigate(`/achats/edit/${achat.id}`);

    if (loading) return <LoadingSpinner message="Chargement de l'achat..." />;
    if (error || !achat) return <ErrorDisplay error={error} onBack={handleBack} />;

    const processConfig = getProcessConfig(achat.process?.valeur || 0);
    const totalAmount = calculerMontantTotal(achat);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AchatHeader
                    achat={achat}
                    onBack={handleBack}
                    onPrint={handlePrint}
                    onShare={handleShare}
                    onDuplicate={handleDuplicate}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <AchatInfoCard
                            achat={achat}
                            processConfig={processConfig}
                            totalAmount={totalAmount}
                            actionLoading={actionLoading}
                            onAction={handleAction}
                            onCancel={handleCancel}
                            saveCommande={handleSaveCommande}
                        />

                        {achat.process?.valeur >= 20 && (
                            <AchatCommandesList achat={achat} commandes={commandes} />
                        )}

                        {achat.process?.valeur > 30 && (
                            <AchatBonCommande achat={achat} />
                        )}

                        {achat.process?.valeur > 40 && (
                            <AchatLivraison achat={achat} />
                        )}

                        {achat.process?.valeur >= 45 && (
                            <AchatReception achat={achat} onReload={loadAchat} />
                        )}

                        <AchatArticlesTable achat={achat} totalAmount={totalAmount} />
                    </div>

                    <div className="space-y-6">
                        <AchatSummaryCard
                            achat={achat}
                            processConfig={processConfig}
                            totalAmount={totalAmount}
                        />

                        <AchatQuickActions
                            achat={achat}
                            processConfig={processConfig}
                            onPrint={handlePrint}
                            onEmail={handleEmail}
                            onEdit={handleEdit}
                            onCancel={handleCancel}
                        />

                        <AchatHistoryTimeline achat={achat} />
                    </div>
                </div>
            </div>
        </div>
    );
}
