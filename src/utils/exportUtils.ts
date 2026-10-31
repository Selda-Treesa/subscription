import type { Invoice, Subscription, Payment } from '../types';

/**
 * Escapes values according to RFC 4180 CSV specifications:
 * - Wrap with double quotes if field contains commas, line breaks, or double quotes
 * - Double up existing double quotes inside strings
 */
function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Converts a 2D array of rows into a valid CSV string.
 */
function arrayToCSV(rows: (string | number | boolean | null | undefined)[][]): string {
  return rows.map((row) => row.map(escapeCSVField).join(',')).join('\r\n');
}

/**
 * Triggers a browser file download of CSV text with UTF-8 BOM for full Excel compatibility.
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 1. Export Invoices Register
 */
export function exportInvoicesToCSV(invoices: Invoice[]): void {
  const headers = [
    'Invoice Number',
    'Customer Name',
    'Customer Email',
    'Customer Company',
    'Subscription Number',
    'Issue Date',
    'Due Date',
    'Payment Terms',
    'Subtotal',
    'Tax Total',
    'Discount Total',
    'Total Amount',
    'Amount Paid',
    'Amount Due',
    'Status',
    'Is Overdue',
    'Chase Count',
    'Delivery Status',
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.customerName,
    inv.customerEmail,
    inv.customerCompany,
    inv.subscriptionNumber,
    inv.issueDate,
    inv.dueDate,
    inv.paymentTerms,
    inv.subtotal.toFixed(2),
    inv.taxTotal.toFixed(2),
    inv.discountTotal.toFixed(2),
    inv.totalAmount.toFixed(2),
    inv.amountPaid.toFixed(2),
    inv.amountDue.toFixed(2),
    inv.status,
    inv.isOverdue ? 'Yes' : 'No',
    inv.chaseCount,
    inv.deliveryStatus,
  ]);

  const csv = arrayToCSV([headers, ...rows]);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`invoices-export-${dateStr}.csv`, csv);
}

/**
 * 2. Export Active & All Subscriptions
 */
export function exportSubscriptionsToCSV(subscriptions: Subscription[]): void {
  const headers = [
    'Subscription Number',
    'Customer Name',
    'Customer Email',
    'Customer Company',
    'Plan Name',
    'Status',
    'Start Date',
    'Expiry Date',
    'Next Billing Date',
    'Last Billed Date',
    'Payment Terms',
    'Line Items Count',
    'Subtotal',
    'Tax Total',
    'Discount Total',
    'Total Amount',
  ];

  const rows = subscriptions.map((sub) => [
    sub.subscriptionNumber,
    sub.customerName,
    sub.customerEmail,
    sub.customerCompany,
    sub.planName,
    sub.status,
    sub.startDate,
    sub.expiryDate,
    sub.nextBillingDate,
    sub.lastBilledDate || 'Not yet billed',
    sub.paymentTerms,
    sub.lines.length,
    sub.subtotal.toFixed(2),
    sub.taxTotal.toFixed(2),
    sub.discountTotal.toFixed(2),
    sub.totalAmount.toFixed(2),
  ]);

  const csv = arrayToCSV([headers, ...rows]);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`subscriptions-export-${dateStr}.csv`, csv);
}

/**
 * 3. Export Payments Ledger
 */
export function exportPaymentsToCSV(payments: Payment[]): void {
  const headers = [
    'Payment Number',
    'Invoice Number',
    'Customer Name',
    'Amount',
    'Payment Date',
    'Payment Method',
    'Reference',
    'Recorded By',
    'Notes',
  ];

  const rows = payments.map((pay) => [
    pay.paymentNumber,
    pay.invoiceNumber,
    pay.customerName,
    pay.amount.toFixed(2),
    pay.paymentDate,
    pay.paymentMethod,
    pay.reference,
    pay.recordedBy,
    pay.notes,
  ]);

  const csv = arrayToCSV([headers, ...rows]);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`payments-export-${dateStr}.csv`, csv);
}

/**
 * 4. Export Accounts Receivable Aging & Balances
 */
export function exportReceivablesToCSV(invoices: Invoice[], simulatedDate: string): void {
  const headers = [
    'Invoice Number',
    'Customer Name',
    'Customer Company',
    'Customer Email',
    'Issue Date',
    'Due Date',
    'Days Overdue',
    'Aging Category',
    'Total Amount',
    'Amount Paid',
    'Outstanding Balance',
    'Status',
  ];

  const now = new Date(simulatedDate).getTime();

  // Filter for invoices with positive balance due that aren't cancelled
  const unpaid = invoices.filter((i) => i.amountDue > 0 && i.status !== 'cancelled');

  const rows = unpaid.map((inv) => {
    const dueTime = new Date(inv.dueDate).getTime();
    const diffDays = Math.floor((now - dueTime) / (1000 * 3600 * 24));
    const overdueDays = diffDays > 0 ? diffDays : 0;

    let agingCategory = 'Current (< 30 days)';
    if (diffDays > 60) {
      agingCategory = '61+ Days (Severe Overdue)';
    } else if (diffDays > 30) {
      agingCategory = '31 - 60 Days Overdue';
    }

    return [
      inv.invoiceNumber,
      inv.customerName,
      inv.customerCompany,
      inv.customerEmail,
      inv.issueDate,
      inv.dueDate,
      overdueDays,
      agingCategory,
      inv.totalAmount.toFixed(2),
      inv.amountPaid.toFixed(2),
      inv.amountDue.toFixed(2),
      inv.status,
    ];
  });

  const csv = arrayToCSV([headers, ...rows]);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(`accounts-receivable-export-${dateStr}.csv`, csv);
}

