export const generateInvoicePDF = async (
  invoiceNumber: string,
  elementId: string
) => {
  // Lazy load heavy dependencies
  const [html2canvas, jsPDF] = await Promise.all([
    import('html2canvas').then(m => m.default),
    import('jspdf').then(m => m.default)
  ]);

  const element = document.getElementById(elementId);
  if (!element) throw new Error('Invoice element not found');

  // Capture the element
  const canvas = await html2canvas(element, {
    scale: 2, // Higher quality
    useCORS: true,
    logging: false,
    windowWidth: 1000, // Force desktop layout
  });

  const imgData = canvas.toDataURL('image/png');
  
  // A4 dimensions in mm
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  
  // Clean filename
  const filename = `Invoice_${invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')}.pdf`;
  pdf.save(filename);
};
