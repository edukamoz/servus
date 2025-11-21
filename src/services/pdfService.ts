import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import { Customer, OrderItem, UserProfile, OrderPhoto } from "../types";
import { COLORS } from "../constants/colors";

interface PDFProps {
  customer: Customer;
  items: OrderItem[];
  total: number;
  orderId: string;
  companyProfile: UserProfile | null;
  signatureUrl?: string;
  photos?: OrderPhoto[];
}

const generateHTML = ({
  customer,
  items,
  total,
  orderId,
  companyProfile,
  signatureUrl,
  photos,
}: PDFProps) => {
  const date = new Date().toLocaleDateString("pt-BR");

  const companyName = companyProfile?.businessName || "Prestador de Serviços";
  const companyPhone = companyProfile?.phone || "";
  const companyEmail = companyProfile?.email || "";

  const pixInfo = companyProfile?.pixKey
    ? `<div class="pix-container">
         <div class="pix-title">DADOS PARA PAGAMENTO</div>
         <div class="pix-content">
           <span style="color: #666;">Chave PIX:</span><br/>
           <span style="font-size: 16px; font-weight: bold; color: #333;">${companyProfile.pixKey}</span>
         </div>
       </div>`
    : "";

  const signatureBlock = signatureUrl
    ? `<div style="margin-top: 40px; text-align: center;">
         <img src="${signatureUrl}" style="max-height: 80px; max-width: 200px;" />
         <div style="border-top: 1px solid #333; width: 200px; margin: 5px auto 0 auto;"></div>
         <div style="font-size: 12px; color: #333;">Assinatura do Cliente</div>
       </div>`
    : "";

  const itemsRows = items
    .map(
      (item) => `
    <tr>
      <td>
        <div style="font-weight: bold; font-size: 14px;">${item.title}</div>
        <div style="font-size: 10px; color: #888;">${
          item.type === "service" ? "Serviço" : "Peça/Material"
        }</div>
      </td>
      <td style="text-align: center; font-size: 14px;">${item.quantity}</td>
      <td style="text-align: right; font-size: 14px;">R$ ${item.unit_price.toFixed(
        2
      )}</td>
      <td style="text-align: right; font-weight: bold; font-size: 14px;">R$ ${(
        item.quantity * item.unit_price
      ).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const photosBlock =
    photos && photos.length > 0
      ? `
      <div style="page-break-before: always;"></div>
      <div class="section-title">Evidências do Serviço</div>
      <div class="photos-container">
        ${photos
          .map(
            (photo) => `
          <div class="photo-wrapper">
            <img src="${photo.url}" class="photo-img" />
            <div class="photo-label ${
              photo.type === "after" ? "label-after" : "label-before"
            }">
              ${photo.type === "before" ? "ANTES" : "DEPOIS"}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          /* Configuração A4 para Impressão Web */
          @page { size: A4; margin: 10mm; }
          @media print { 
            body { -webkit-print-color-adjust: exact; } 
          }

          body { font-family: 'Helvetica', sans-serif; color: #333; padding: 20px; max-width: 800px; margin: 0 auto; }
          
          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid ${
            COLORS.primary
          }; padding-bottom: 15px; margin-bottom: 25px; }
          .company-info { display: flex; flex-direction: column; }
          .logo { font-size: 24px; font-weight: bold; color: ${
            COLORS.primary
          }; margin-bottom: 4px; text-transform: uppercase; }
          .company-detail { font-size: 12px; color: #666; margin-bottom: 2px; }
          
          .meta { text-align: right; }
          .meta-label { font-size: 10px; color: #888; text-transform: uppercase; }
          .meta-value { font-size: 14px; font-weight: bold; color: #333; margin-bottom: 5px; }

          /* Seções */
          .section-title { background-color: #f8f9fa; border-left: 4px solid ${
            COLORS.primary
          }; padding: 8px 12px; font-weight: bold; font-size: 12px; color: ${
    COLORS.primary
  }; margin-top: 25px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px; }
          
          /* Info Cliente */
          .info-group { padding-left: 5px; }
          .info-name { font-size: 16px; font-weight: bold; margin-bottom: 4px; }
          .info-detail { font-size: 14px; color: #555; }

          /* Tabela */
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { text-align: left; border-bottom: 2px solid #eee; padding: 10px 8px; color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; }
          td { border-bottom: 1px solid #f0f0f0; padding: 12px 8px; }
          
          /* Total */
          .total-section { margin-top: 30px; display: flex; justify-content: flex-end; }
          .total-box { text-align: right; background-color: ${
            COLORS.primary
          }; color: white; padding: 15px 25px; border-radius: 8px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .total-label { font-size: 12px; opacity: 0.9; margin-bottom: 4px; }
          .total-value { font-size: 24px; font-weight: bold; }
          
          /* Pix Box (Ajustado para Web) */
          .pix-container { 
            margin-top: 40px; 
            border: 2px dashed #ccc; 
            border-radius: 8px; 
            padding: 15px; 
            background-color: #fff; 
            display: inline-block; /* Melhor que fit-content para PDF */
            min-width: 200px;
          }
          .pix-title { font-size: 10px; font-weight: bold; color: #888; text-transform: uppercase; margin-bottom: 8px; }

          /* ADICIONADO: Estilos das Fotos */
          .photos-container { display: flex; flex-wrap: wrap; gap: 15px; margin-top: 15px; }
          .photo-wrapper { width: 45%; position: relative; border: 1px solid #ddd; border-radius: 4px; overflow: hidden; }
          .photo-img { width: 100%; height: 200px; object-fit: cover; display: block; }
          .photo-label { 
            position: absolute; bottom: 0; left: 0; right: 0; 
            padding: 5px; text-align: center; font-weight: bold; color: white; font-size: 10px; text-transform: uppercase;
          }
          .label-before { background-color: rgba(245, 158, 11, 0.8); } /* Amarelo */
          .label-after { background-color: rgba(16, 185, 129, 0.8); } /* Verde */
          
          /* Footer */
          .footer { margin-top: 60px; text-align: center; font-size: 10px; color: #aaa; border-top: 1px solid #eee; padding-top: 15px; }
        </style>
      </head>
      <body>
        
        <div class="header">
          <div class="company-info">
            <div class="logo">${companyName}</div>
            <div class="company-detail">${companyPhone}</div>
            <div class="company-detail">${companyEmail}</div>
          </div>
          <div class="meta">
            <div class="meta-label">Ordem de Serviço</div>
            <div class="meta-value">#${orderId}</div>
            <div class="meta-label">Data de Emissão</div>
            <div class="meta-value">${date}</div>
          </div>
        </div>

        <div class="section-title">Cliente</div>
        <div class="info-group">
          <div class="info-name">${customer.name}</div>
          <div class="info-detail">${
            customer.address || "Endereço não informado"
          }</div>
          <div class="info-detail">${customer.phone || ""}</div>
        </div>

        <div class="section-title">Descrição dos Serviços</div>
        <table>
          <thead>
            <tr>
              <th width="50%">Item / Serviço</th>
              <th width="10%" style="text-align: center">Qtd</th>
              <th width="20%" style="text-align: right">Valor Unit.</th>
              <th width="20%" style="text-align: right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-box">
            <div class="total-label">VALOR TOTAL A PAGAR</div>
            <div class="total-value">R$ ${total.toFixed(2)}</div>
          </div>
        </div>

        ${pixInfo}

        ${photosBlock}

        ${signatureBlock}

        <div class="footer">
          Documento gerado por <b>${companyName}</b> utilizando <b>Servus App</b>.
        </div>

      </body>
    </html>
  `;
};

const printWeb = (html: string) => {
  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.visibility = "hidden";

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
  }

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();

    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }, 500);
};

export const createAndSharePDF = async (data: PDFProps) => {
  const html = generateHTML(data);

  try {
    if (Platform.OS === "web") {
      printWeb(html);
    } else {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    }
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw new Error("Falha ao gerar documento");
  }
};
