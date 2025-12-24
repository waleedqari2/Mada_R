import jsPDF from 'jspdf';

interface ExpenseItem {
  id: number;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface ExportData {
  requestNumber: string;
  date: string;
  department: string;
  deliveryDate: string;
  items: ExpenseItem[];
  totalAmount: number;
  approvals: Array<{ role: string; name: string; status: string }>;
}

export async function generateExpensePDF(data: ExportData) {
  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 12;
    const contentWidth = pageWidth - 2 * margin;

    let yPos = margin;

    // Colors
    const darkBlue = '#3d4d5e';
    const brown = '#8f6f3b';
    const lightGray = '#f5f5f5';

    // ===== HEADER =====
    pdf.setFillColor(61, 77, 94);
    pdf.rect(0, 0, pageWidth, 20, 'F');

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(255, 255, 255);
    pdf.text('EXPENSE REQUEST REPORT', margin, 12);

    pdf.setFontSize(9);
    pdf.setTextColor(200, 200, 200);
    pdf.text('Mada Tourism - Expense Management System', margin, 17);

    yPos = 28;

    // ===== REQUEST INFO =====
    pdf.setFillColor(245, 245, 245);
    pdf.rect(margin, yPos, contentWidth, 28, 'F');

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(61, 77, 94);
    pdf.text('REQUEST INFORMATION', margin + 2, yPos + 5);

    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(40, 40, 40);

    const infoY = yPos + 11;
    const col1X = margin + 2;
    const col2X = margin + contentWidth / 2;

    // Left column
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(143, 111, 59);
    pdf.text('Request #:', col1X, infoY);
    pdf.setFont('Helvetica', 'normal');
    pdf.setTextColor(40, 40, 40);
    pdf.text(data.requestNumber, col1X + 25, infoY);

    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(143, 111, 59);
    pdf.text('Date:', col1X, infoY + 6);
    pdf.setFont('Helvetica', 'normal');
    pdf.setTextColor(40, 40, 40);
    pdf.text(data.date, col1X + 25, infoY + 6);

    // Right column
    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(143, 111, 59);
    pdf.text('Department:', col2X, infoY);
    pdf.setFont('Helvetica', 'normal');
    pdf.setTextColor(40, 40, 40);
    pdf.text(data.department, col2X + 28, infoY);

    pdf.setFont('Helvetica', 'bold');
    pdf.setTextColor(143, 111, 59);
    pdf.text('Delivery Date:', col2X, infoY + 6);
    pdf.setFont('Helvetica', 'normal');
    pdf.setTextColor(40, 40, 40);
    pdf.text(data.deliveryDate, col2X + 28, infoY + 6);

    yPos += 32;

    // ===== APPROVAL STATUS =====
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(61, 77, 94);
    pdf.text('APPROVAL STATUS', margin, yPos);

    yPos += 6;

    data.approvals.forEach((approval, index) => {
      const statusColor =
        approval.status === 'pending'
          ? [200, 150, 0]
          : approval.status === 'approved'
            ? [76, 175, 80]
            : [244, 67, 54];

      pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.rect(margin + index * 55, yPos, 50, 6, 'F');

      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      const statusText =
        approval.status === 'pending'
          ? 'PENDING'
          : approval.status === 'approved'
            ? 'APPROVED'
            : 'REJECTED';
      pdf.text(statusText, margin + index * 55 + 25, yPos + 4, { align: 'center' });
    });

    yPos += 10;

    // Approval names
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(100, 100, 100);

    data.approvals.forEach((approval, index) => {
      pdf.text(`${approval.role}: ${approval.name}`, margin + index * 55 + 2, yPos);
    });

    yPos += 6;

    // ===== SUMMARY CARDS =====
    const cardWidth = (contentWidth - 4) / 3;
    const summaryData = [
      { label: 'Total Items', value: data.items.length.toString() },
      {
        label: 'Total Amount',
        value: `$${data.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
      {
        label: 'Avg. Item Cost',
        value: `$${(data.totalAmount / data.items.length).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
    ];

    summaryData.forEach((item, index) => {
      const cardX = margin + index * (cardWidth + 2);

      pdf.setFillColor(245, 245, 245);
      pdf.rect(cardX, yPos, cardWidth, 14, 'F');

      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(item.label, cardX + cardWidth / 2, yPos + 4, { align: 'center' });

      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.setTextColor(61, 77, 94);
      pdf.text(item.value, cardX + cardWidth / 2, yPos + 11, { align: 'center' });
    });

    yPos += 18;

    // ===== TABLE HEADER =====
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(61, 77, 94);
    pdf.text('EXPENSE DETAILS', margin, yPos);

    yPos += 6;

    // Table header row
    pdf.setFillColor(61, 77, 94);
    pdf.rect(margin, yPos, contentWidth, 6, 'F');

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.setTextColor(255, 255, 255);

    const colWidths = [8, 60, 15, 15, 20, 20];
    const headers = ['#', 'Description', 'Unit', 'Qty', 'Unit Price', 'Total'];

    let xPos = margin;
    headers.forEach((header, i) => {
      pdf.text(header, xPos + colWidths[i] / 2, yPos + 4, { align: 'center' });
      xPos += colWidths[i];
    });

    yPos += 6;

    // ===== TABLE ROWS =====
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(8);

    data.items.forEach((item, index) => {
      // Check if we need a new page
      if (yPos > pageHeight - 15) {
        pdf.addPage();
        yPos = margin;
      }

      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPos, contentWidth, 5, 'F');
      }

      pdf.setTextColor(40, 40, 40);

      xPos = margin;
      const rowData = [
        item.id.toString(),
        item.description.substring(0, 40),
        item.unit,
        item.quantity.toString(),
        `$${item.unitPrice.toFixed(2)}`,
        `$${item.total.toFixed(2)}`,
      ];

      rowData.forEach((text, i) => {
        const align = i === 1 ? 'left' : 'center';
        const offset = i === 1 ? 2 : colWidths[i] / 2;
        pdf.text(text, xPos + offset, yPos + 3.5, { align });
        xPos += colWidths[i];
      });

      yPos += 5;
    });

    // ===== TOTAL ROW =====
    pdf.setFillColor(143, 111, 59);
    pdf.rect(margin, yPos, contentWidth, 6, 'F');

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);

    xPos = margin;
    pdf.text('TOTAL', xPos + 2, yPos + 4);

    xPos = margin + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4];
    pdf.text(
      `$${data.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      xPos + colWidths[5] / 2,
      yPos + 4,
      { align: 'center' }
    );

    // ===== FOOTER =====
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.setTextColor(150, 150, 150);
    pdf.text(
      'This report was automatically generated by Mada Tourism Expense Management System',
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );

    // Save
    pdf.save(`Expense_Request_${data.requestNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
