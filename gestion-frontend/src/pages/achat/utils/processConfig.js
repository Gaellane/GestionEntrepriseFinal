import {
  CheckCircleIcon,
  BanknotesIcon,
  TruckIcon,
  ArchiveBoxIcon,
  ArrowPathIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

export const getProcessConfig = (valeur) => {
  switch (valeur) {
    case 1:
      return {
        id: 1,
        buttonText: "Valider Magasinier",
        buttonColor: "from-emerald-500 to-green-600",
        buttonIcon: CheckCircleIcon,
        label: "Créé",
        labelColor: "bg-blue-100 text-blue-800",
        showCancel: true
      };
    case 11:
      return {
        id: 11,
        buttonText: "Valider Financier",
        buttonColor: "from-purple-500 to-indigo-600",
        buttonIcon: BanknotesIcon,
        label: "Validé Magasinier",
        labelColor: "bg-emerald-100 text-emerald-800",
        showCancel: true
      };
    case 21:
      return {
        id: 21,
        buttonText: "Lancer Commande",
        buttonColor: "from-orange-500 to-amber-600",
        buttonIcon: TruckIcon,
        label: "Validé",
        labelColor: "bg-purple-100 text-purple-800",
        showCancel: false
      };
    case 25:
      return {
        id: 25,
        buttonText: "Lancer Commande",
        buttonColor: "from-orange-500 to-amber-600",
        buttonIcon: TruckIcon,
        label: "Validé",
        labelColor: "bg-purple-100 text-purple-800",
        showCancel: false
      };
    case 31:
      return {
        id: 31,
        buttonText: "Réception",
        buttonColor: null,
        buttonIcon: ArchiveBoxIcon,
        label: "En Commande",
        labelColor: "bg-orange-100 text-orange-800",
        showCancel: false
      };
    case 41:
      return {
        id: 41,
        buttonText: null,
        buttonColor: "",
        buttonIcon: null,
        label: "Réceptionné",
        labelColor: "bg-cyan-100 text-cyan-800",
        showCancel: false
      };
    case 45:
      return {
        id: 45,
        buttonText: null,
        buttonColor: "",
        buttonIcon: null,
        label: "Réceptionné",
        labelColor: "bg-cyan-100 text-cyan-800",
        showCancel: false
      };
    case 61:
      return {
        id: 61,
        buttonText: null,
        buttonColor: "",
        buttonIcon: null,
        label: "Réceptionné",
        labelColor: "bg-cyan-100 text-cyan-800",
        showCancel: false
      };
    case 0:
      return {
        id: 0,
        buttonText: "Ré-Envoyer",
        buttonColor: "from-red-500 to-pink-600",
        buttonIcon: ArrowPathIcon,
        label: "Annulé",
        labelColor: "bg-red-100 text-red-800",
        showCancel: false
      };
    default:
      return {
        id: -1,
        buttonText: "Action",
        buttonColor: "from-gray-500 to-gray-600",
        buttonIcon: DocumentTextIcon,
        label: "Inconnu",
        labelColor: "bg-gray-100 text-gray-800",
        showCancel: false
      };
  }
};

export const calculerMontantTotal = (achatData) => {
  if (!achatData?.achatLignes || achatData.achatLignes.length === 0) return 0;
  
  return achatData.achatLignes.reduce((total, ligne) => {
    return total + (ligne.quantite * ligne.prixUnitaire);
  }, 0).toFixed(2);
};
