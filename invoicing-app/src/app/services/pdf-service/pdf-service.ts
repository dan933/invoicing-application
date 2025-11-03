import { inject, Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { InvoiceDetails } from '../invoices/invoice-service';
import { Utils } from '../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  utils = inject(Utils);
  makePdf(invoiceDetails: InvoiceDetails) {
    console.log({ invoiceDetails });
    const pdf = new jsPDF('p', 'mm', 'a4');

    let invoiceNumber = `${invoiceDetails?.invoiceReference}`;

    const img = new Image();
    img.src = '/assets/da-logo.png';

    pdf.setTextColor(0, 0, 255);
    pdf.setFontSize(30);
    pdf.addImage(img, 'PNG', 10, 10, 50, 30);
    invoiceDetails?.gst ? pdf.text('Tax Invoice', 150, 30) : pdf.text('Invoice', 150, 30);
    pdf.setFontSize(20);
    pdf.text(`ABN: 11 111 111 111`, 15, 50);
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(13);
    pdf.text(
      `
      M: 0411111111
      E: example@gmail.com

      To:
      ${invoiceDetails?.customerName}
      ${invoiceDetails?.companyName}
      ${invoiceDetails?.email}
      `,
      10,
      55,
      {
        lineHeightFactor: 1.3,
      }
    );

    pdf.text(
      `
      Invoice Number: ${invoiceNumber}
      Invoice Date: ${new Date(invoiceDetails?.invoiceDate).toLocaleDateString('en-GB')}
      Due Date: ${new Date(invoiceDetails?.dueDate).toLocaleDateString('en-GB')}
      `,
      140,
      55,
      {
        lineHeightFactor: 1.3,
      }
    );

    const tableBody = invoiceDetails?.lineItems.map((item) => [
      item.description,
      item.quantity,
      item.unitPrice.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      }),
      ...(invoiceDetails?.gst
        ? [
            (item.totalPrice * 0.1).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            }),
          ]
        : []),
      ...(invoiceDetails?.gst
        ? [
            (item.totalPrice * 1.1).toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            }),
          ]
        : [
            item.totalPrice.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            }),
          ]),
    ]);

    let bottomOfInvoiceTable: any;

    //Calculate invoice total
    let {
      subTotal,
      gstTotal,
      grandTotal,
      quantity,
    }: {
      subTotal: number | string;
      gstTotal: number | string;
      grandTotal: number | string;
      quantity: number;
    } = invoiceDetails?.lineItems.reduce(
      (acc, item) => {
        const gstAmount = invoiceDetails?.gst ? item.totalPrice * 0.1 : 0;
        const lineTotal = item.totalPrice + gstAmount;
        acc.subTotal += item.totalPrice;
        acc.gstTotal += gstAmount;
        acc.grandTotal += lineTotal;
        acc.quantity += item.quantity;
        return acc;
      },
      { subTotal: 0, gstTotal: 0, grandTotal: 0, quantity: 0 }
    );

    subTotal = subTotal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    gstTotal = gstTotal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    grandTotal = grandTotal.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    autoTable(pdf, {
      head: [
        ['Description', 'Quantity', 'Unit Price', ...(invoiceDetails?.gst ? ['GST'] : []), 'Total'],
      ],
      body: tableBody,
      foot: [
        ['Total:', quantity, subTotal, ...(invoiceDetails?.gst ? [gstTotal] : []), grandTotal],
      ],
      footStyles: {
        fontStyle: 'bold',
      },
      showFoot: 'lastPage',
      startY: 105,
      styles: {
        halign: 'right',
        minCellWidth: 30,
      },

      headStyles: {
        fontStyle: 'bold',
      },

      columnStyles: {
        0: { halign: 'left' },
      },
      didDrawCell: (data: any) => {
        bottomOfInvoiceTable = data.table;
      },
    });

    let footerHeight = bottomOfInvoiceTable.finalY + 5;
    pdf.setFontSize(13);

    if (footerHeight >= pdf.internal.pageSize.getHeight() - 30) {
      pdf.addPage();

      pdf.text(
        `
        BSB: 111-111
        Account Number: 111-111
        Account Name: Company
        `,
        7,
        5,
        {
          align: 'left',
          lineHeightFactor: 1.5,
        }
      );

      if (invoiceDetails?.gst) {
        pdf.setTextColor('red');
        pdf.text(
          `
        Not Registered for GST
        `,
          7,
          30
        );
      }
    } else {
      pdf.text(
        `
      BSB: 111-111
      Account Number: 111-111
      Account Name: Company
      `,
        7,
        footerHeight,
        {
          align: 'left',
          lineHeightFactor: 1.5,
        }
      );

      if (!invoiceDetails?.gst) {
        pdf.setTextColor('red');
        pdf.text(
          `
      Not Registered for GST
      `,
          7,
          footerHeight + 23,
          {
            align: 'left',
            lineHeightFactor: 1.5,
          }
        );
      }
    }

    return pdf.save(`${invoiceNumber}.pdf`);
  }
}
