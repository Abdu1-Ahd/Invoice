export const generateInvoicePDF = async (
  invoiceNumber: string,
  elementId: string
) => {
  const element = document.getElementById(elementId);
  if (!element) {
    alert('Invoice template element not found. Please try again.');
    throw new Error(`Invoice element with id "${elementId}" not found`);
  }

  try {
    // Lazy load heavy dependencies
    const [html2canvasModule, jsPDFModule] = await Promise.all([
      import('html2canvas'),
      import('jspdf')
    ]);

    const html2canvas = html2canvasModule.default;
    const jsPDF = jsPDFModule.default;

    // Capture the element cleanly with high DPI quality
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: true,
      windowWidth: 1000,
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas render failed (zero dimensions)');
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    
    // A4 dimensions in mm (210 x 297)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    
    // Clean filename
    const cleanNum = invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_');
    const filename = `Invoice_${cleanNum}.pdf`;
    pdf.save(filename);
  } catch (error: any) {
    console.error('Failed to generate PDF:', error);
    alert(`Could not download PDF: ${error.message || 'Unknown error'}`);
    throw error;
  }
};
