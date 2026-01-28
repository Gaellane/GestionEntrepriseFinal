import React from 'react';
import * as XLSX from 'xlsx';
import { DocumentTextIcon } from '@heroicons/react/24/outline';



function ExportToExcelButton({
    data,
    fileName = 'export.xlsx',
    sheetName = 'Feuille1',
    buttonText = 'Exporter en excel',
}) 
{
    const handleExport = () =>{
        if(!data || data.length === 0){
            alert('Aucune donnee a exporter.');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(data);

            XLSX.utils.book_append_sheet(wb,ws,sheetName);
            XLSX.writeFile(wb,fileName);
            
        } catch (error) {
            console.error(error);
            alert("Erreur lors de l'export");
        }
    }

    return (
        <button onClick = {handleExport} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 flex items-center justify-center space-x-2" >
            <DocumentTextIcon className="w-5 h-5" />
            <span>{buttonText}</span>
        </button>
    )

}

export default ExportToExcelButton;