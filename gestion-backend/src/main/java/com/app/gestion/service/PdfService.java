package com.app.gestion.service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.app.gestion.model.BonCommandeAchat;
import com.app.gestion.model.BonCommandeAchatLigne;
import com.app.gestion.model.LivraisonAchat;
import com.app.gestion.model.LivraisonAchatLigne;
import com.app.gestion.model.ReceptionAchat;
import com.app.gestion.model.ReceptionAchatLigne;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

@Service
public class PdfService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] generateBonCommandePdf(BonCommandeAchat bonCommande) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Get entity name from the achat
        String entityName = bonCommande.getProforma().getAchat().getDemandeur().getEntity().getEntityName();

        // Header - Entity Name
        Paragraph header = new Paragraph(entityName.toUpperCase())
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
        document.add(header);

        // Document Title
        Paragraph title = new Paragraph("BON DE COMMANDE")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);

        // Reference and Date
        Table infoTable = new Table(2);
        infoTable.setWidth(UnitValue.createPercentValue(100));
        
        infoTable.addCell(createInfoCell("Référence:", bonCommande.getRefe()));
        infoTable.addCell(createInfoCell("Date:", bonCommande.getDateEntree().format(DATE_FORMATTER)));
        infoTable.addCell(createInfoCell("Fournisseur:", bonCommande.getProforma().getFournisseur().getFournisseurNom()));
        infoTable.addCell(createInfoCell("Statut:", bonCommande.getProcess().getProcessName()));
        
        document.add(infoTable);
        document.add(new Paragraph("\n"));

        // Items Table
        float[] columnWidths = {1, 4, 2, 2, 2, 2};
        Table itemsTable = new Table(columnWidths);
        itemsTable.setWidth(UnitValue.createPercentValue(100));

        // Table Header
        DeviceRgb headerColor = new DeviceRgb(52, 152, 219);
        itemsTable.addHeaderCell(createHeaderCell("#", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Article", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Catégorie", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Quantité", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Prix Unit.", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Total", headerColor));

        // Table Body
        int index = 1;
        double total = 0.0;
        for (BonCommandeAchatLigne ligne : bonCommande.getBonCommandeAchatLignes()) {
            double lineTotal = ligne.getQuantite() * ligne.getPrixUnitaire();
            total += lineTotal;

            itemsTable.addCell(createBodyCell(String.valueOf(index++)));
            itemsTable.addCell(createBodyCell(ligne.getArticle().getArticleNom()));
            itemsTable.addCell(createBodyCell(ligne.getArticle().getCategorie().getCategorieName()));
            itemsTable.addCell(createBodyCell(String.format("%.2f %s", 
                ligne.getQuantite(), 
                ligne.getArticle().getUnite() != null ? ligne.getArticle().getUnite().getAbreviation() : "")));
            itemsTable.addCell(createBodyCell(String.format("%.2f Ar", ligne.getPrixUnitaire())));
            itemsTable.addCell(createBodyCell(String.format("%.2f Ar", lineTotal)));
        }

        document.add(itemsTable);

        // Total
        Paragraph totalParagraph = new Paragraph(String.format("TOTAL: %.2f Ar", total))
                .setFontSize(14)
                .setBold()
                .setTextAlignment(TextAlignment.RIGHT)
                .setMarginTop(20);
        document.add(totalParagraph);

        // Footer
        document.add(new Paragraph("\n\n"));
        Paragraph footer = new Paragraph("Signature et cachet")
                .setTextAlignment(TextAlignment.RIGHT)
                .setMarginTop(30);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateLivraisonPdf(LivraisonAchat livraison) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Get entity name
        String entityName = livraison.getBonCommande().getProforma().getAchat().getDemandeur().getEntity().getEntityName();

        // Header - Entity Name
        Paragraph header = new Paragraph(entityName.toUpperCase())
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
        document.add(header);

        // Document Title
        Paragraph title = new Paragraph("BON DE LIVRAISON")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);

        // Reference and Date
        Table infoTable = new Table(2);
        infoTable.setWidth(UnitValue.createPercentValue(100));
        
        infoTable.addCell(createInfoCell("Référence Livraison:", livraison.getRefe()));
        infoTable.addCell(createInfoCell("Date Livraison:", livraison.getDateEntree().format(DATE_FORMATTER)));
        infoTable.addCell(createInfoCell("Bon de Commande:", livraison.getBonCommande().getRefe()));
        infoTable.addCell(createInfoCell("Fournisseur:", livraison.getBonCommande().getProforma().getFournisseur().getFournisseurNom()));
        
        document.add(infoTable);
        document.add(new Paragraph("\n"));

        // Items Table
        float[] columnWidths = {1, 5, 2, 2};
        Table itemsTable = new Table(columnWidths);
        itemsTable.setWidth(UnitValue.createPercentValue(100));

        // Table Header
        DeviceRgb headerColor = new DeviceRgb(39, 174, 96);
        itemsTable.addHeaderCell(createHeaderCell("#", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Article", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Catégorie", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Quantité Livrée", headerColor));

        // Table Body
        int index = 1;
        for (LivraisonAchatLigne ligne : livraison.getLivraisonAchatLignes()) {
            itemsTable.addCell(createBodyCell(String.valueOf(index++)));
            itemsTable.addCell(createBodyCell(ligne.getArticle().getArticleNom()));
            itemsTable.addCell(createBodyCell(ligne.getArticle().getCategorie().getCategorieName()));
            itemsTable.addCell(createBodyCell(String.format("%.2f %s", 
                ligne.getQuantite(), 
                ligne.getArticle().getUnite() != null ? ligne.getArticle().getUnite().getAbreviation() : "")));
        }

        document.add(itemsTable);

        // Footer
        document.add(new Paragraph("\n\n"));
        Table signatureTable = new Table(2);
        signatureTable.setWidth(UnitValue.createPercentValue(100));
        signatureTable.addCell(createSignatureCell("Signature Livreur"));
        signatureTable.addCell(createSignatureCell("Signature Réceptionnaire"));
        document.add(signatureTable);

        document.close();
        return baos.toByteArray();
    }

    public byte[] generateReceptionPdf(ReceptionAchat reception) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Get entity name
        String entityName = reception.getBonCommande().getProforma().getAchat().getDemandeur().getEntity().getEntityName();

        // Header - Entity Name
        Paragraph header = new Paragraph(entityName.toUpperCase())
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
        document.add(header);

        // Document Title
        Paragraph title = new Paragraph("BON DE RÉCEPTION")
                .setFontSize(18)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(title);

        // Reference and Date
        Table infoTable = new Table(2);
        infoTable.setWidth(UnitValue.createPercentValue(100));
        
        infoTable.addCell(createInfoCell("Référence Réception:", reception.getRefe()));
        infoTable.addCell(createInfoCell("Date Réception:", reception.getDateEntree().format(DATE_FORMATTER)));
        infoTable.addCell(createInfoCell("Bon de Commande:", reception.getBonCommande().getRefe()));
        infoTable.addCell(createInfoCell("Fournisseur:", reception.getBonCommande().getProforma().getFournisseur().getFournisseurNom()));
        
        document.add(infoTable);
        document.add(new Paragraph("\n"));

        // Items Table
        float[] columnWidths = {1, 4, 2, 2, 2};
        Table itemsTable = new Table(columnWidths);
        itemsTable.setWidth(UnitValue.createPercentValue(100));

        // Table Header
        DeviceRgb headerColor = new DeviceRgb(142, 68, 173);
        itemsTable.addHeaderCell(createHeaderCell("#", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Article", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Catégorie", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Quantité", headerColor));
        itemsTable.addHeaderCell(createHeaderCell("Dépôt", headerColor));

        // Table Body
        int index = 1;
        for (ReceptionAchatLigne ligne : reception.getReceptionAchatLignes()) {
            itemsTable.addCell(createBodyCell(String.valueOf(index++)));
            itemsTable.addCell(createBodyCell(ligne.getArticle().getArticleNom()));
            itemsTable.addCell(createBodyCell(ligne.getArticle().getCategorie().getCategorieName()));
            itemsTable.addCell(createBodyCell(String.format("%.2f %s", 
                ligne.getQuantite(), 
                ligne.getArticle().getUnite() != null ? ligne.getArticle().getUnite().getAbreviation() : "")));
            itemsTable.addCell(createBodyCell(ligne.getDepot() != null ? ligne.getDepot().getDepotName() : "N/A"));
        }

        document.add(itemsTable);

        // Footer
        document.add(new Paragraph("\n\n"));
        Table signatureTable = new Table(2);
        signatureTable.setWidth(UnitValue.createPercentValue(100));
        signatureTable.addCell(createSignatureCell("Signature Magasinier"));
        signatureTable.addCell(createSignatureCell("Signature Responsable"));
        document.add(signatureTable);

        document.close();
        return baos.toByteArray();
    }

    private Cell createHeaderCell(String text, DeviceRgb color) {
        return new Cell()
                .add(new Paragraph(text).setBold().setFontColor(ColorConstants.WHITE))
                .setBackgroundColor(color)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(8);
    }

    private Cell createBodyCell(String text) {
        return new Cell()
                .add(new Paragraph(text))
                .setPadding(5)
                .setBorder(Border.NO_BORDER)
                .setBorderBottom(new com.itextpdf.layout.borders.SolidBorder(ColorConstants.LIGHT_GRAY, 0.5f));
    }

    private Cell createInfoCell(String label, String value) {
        Paragraph p = new Paragraph()
                .add(new com.itextpdf.layout.element.Text(label + " ").setBold())
                .add(value);
        return new Cell()
                .add(p)
                .setBorder(Border.NO_BORDER)
                .setPadding(5);
    }

    private Cell createSignatureCell(String label) {
        return new Cell()
                .add(new Paragraph(label).setBold().setTextAlignment(TextAlignment.CENTER))
                .add(new Paragraph("\n\n\n"))
                .add(new Paragraph("_____________________").setTextAlignment(TextAlignment.CENTER))
                .setBorder(Border.NO_BORDER)
                .setPadding(10);
    }
}
