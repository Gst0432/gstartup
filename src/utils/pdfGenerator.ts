import jsPDF from 'jspdf';

interface OrderItem {
  product_name: string;
  variant_name?: string | null;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  customer_notes?: string | null;
  shipping_address?: any;
  billing_address?: any;
  profile?: {
    display_name: string;
    email: string;
    phone?: string | null;
  };
  order_items?: OrderItem[];
}

export const generateOrderPDF = (order: Order): void => {
  const doc = new jsPDF();
  
  // Configuration
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let currentY = margin;
  
  // Titre
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth / 2, currentY, { align: 'center' });
  currentY += 20;
  
  // Numéro de commande
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Commande #${order.order_number}`, margin, currentY);
  currentY += 10;
  
  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(order.created_at).toLocaleDateString('fr-FR')}`, margin, currentY);
  currentY += 15;
  
  // Informations client
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations Client:', margin, currentY);
  currentY += 8;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (order.profile?.display_name) {
    doc.text(`Nom: ${order.profile.display_name}`, margin, currentY);
    currentY += 6;
  }
  if (order.profile?.email) {
    doc.text(`Email: ${order.profile.email}`, margin, currentY);
    currentY += 6;
  }
  if (order.profile?.phone) {
    doc.text(`Téléphone: ${order.profile.phone}`, margin, currentY);
    currentY += 6;
  }
  currentY += 10;
  
  // Adresse de livraison
  if (order.shipping_address) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Adresse de livraison:', margin, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (order.shipping_address.address) {
      doc.text(order.shipping_address.address, margin, currentY);
      currentY += 6;
    }
    if (order.shipping_address.city) {
      doc.text(`${order.shipping_address.city}, ${order.shipping_address.postal_code || ''}`, margin, currentY);
      currentY += 6;
    }
    currentY += 10;
  }
  
  // Articles commandés
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Articles commandés:', margin, currentY);
  currentY += 10;
  
  // En-têtes du tableau
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const headers = ['Article', 'Quantité', 'Prix unitaire', 'Total'];
  const colWidths = [80, 30, 40, 30];
  let currentX = margin;
  
  headers.forEach((header, index) => {
    doc.text(header, currentX, currentY);
    currentX += colWidths[index];
  });
  currentY += 8;
  
  // Ligne de séparation
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;
  
  // Articles
  doc.setFont('helvetica', 'normal');
  order.order_items?.forEach((item) => {
    currentX = margin;
    const productName = item.variant_name 
      ? `${item.product_name} (${item.variant_name})`
      : item.product_name;
    
    doc.text(productName, currentX, currentY);
    currentX += colWidths[0];
    
    doc.text(item.quantity.toString(), currentX, currentY);
    currentX += colWidths[1];
    
    doc.text(`${item.price.toLocaleString()} FCFA`, currentX, currentY);
    currentX += colWidths[2];
    
    doc.text(`${item.total.toLocaleString()} FCFA`, currentX, currentY);
    
    currentY += 6;
  });
  
  currentY += 10;
  
  // Total
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`TOTAL: ${order.total_amount.toLocaleString()} ${order.currency}`, pageWidth - margin - 60, currentY);
  currentY += 15;
  
  // Statuts
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Statut de la commande: ${getStatusLabel(order.status)}`, margin, currentY);
  currentY += 6;
  doc.text(`Statut du paiement: ${getPaymentStatusLabel(order.payment_status)}`, margin, currentY);
  currentY += 6;
  doc.text(`Statut de livraison: ${getFulfillmentStatusLabel(order.fulfillment_status)}`, margin, currentY);
  
  // Notes client
  if (order.customer_notes) {
    currentY += 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, currentY);
    currentY += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(order.customer_notes, pageWidth - 2 * margin);
    doc.text(noteLines, margin, currentY);
  }
  
  // Télécharger le PDF
  doc.save(`Commande-${order.order_number}.pdf`);
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'confirmed': return 'Confirmée';
    case 'processing': return 'En cours';
    case 'shipped': return 'Expédiée';
    case 'delivered': return 'Livrée';
    case 'completed': return 'Terminée';
    case 'cancelled': return 'Annulée';
    default: return status;
  }
};

const getPaymentStatusLabel = (status: string): string => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'paid': return 'Payé';
    case 'failed': return 'Échoué';
    case 'refunded': return 'Remboursé';
    default: return status;
  }
};

const getFulfillmentStatusLabel = (status: string): string => {
  switch (status) {
    case 'unfulfilled': return 'Non expédié';
    case 'fulfilled': return 'Expédié';
    case 'shipped': return 'Expédié';
    case 'delivered': return 'Livré';
    default: return status;
  }
};