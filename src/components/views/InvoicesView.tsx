import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice, InvoiceStatus } from '../../types';
import {
  FileText,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Send,
  Printer,
  DollarSign,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building,
} from 'lucide-react';

interface InvoicesViewProps {
  onRecordPaymentForInvoice?: (invoice: Invoice) => void;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({ onRecordPaymentForInvoice }) => {
  const { invoices, updateInvoiceStatus, cancelInvoice, sendInvoice, simulatedDate } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    if (statusFilter === 'overdue') {
      if (!inv.isOverdue) return false;
    } else if (statusFilter !== 'all' && inv.status !== statusFilter) {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.customerName.toLowerCase().includes(q) ||
        inv.customerCompany.toLowerCase().includes(q) ||
        inv.subscriptionNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Invoices &amp; Accounts Receivable</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Generated recurring invoices, payment tracking, printable statements, and automated tax calculations.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '0.875rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, subscription #, customer, or company..."
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FFFFFF',
              width: '100%',
              outline: 'none',
              fontSize: '0.875rem',
            }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
          {['all', 'confirmed', 'paid', 'partially_paid', 'overdue', 'draft', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                border: statusFilter === st ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                color: statusFilter === st ? '#60A5FA' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="glass-panel">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Subscription #</th>
                <th>Customer</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Total Billed</th>
                <th>Balance Due</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No invoices match your search filters.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td>
                      <span style={{ fontWeight: 700, color: '#60A5FA' }}>
                        {inv.invoiceNumber}
                      </span>
                      {inv.deliveryStatus === 'sent' && (
                        <div style={{ fontSize: '0.65rem', color: '#34D399' }}>Sent via Email</div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {inv.subscriptionNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{inv.customerCompany}</div>
                    </td>
                    <td>{inv.issueDate}</td>
                    <td>
                      <span style={{
                        color: inv.isOverdue ? '#F87171' : 'var(--text-main)',
                        fontWeight: inv.isOverdue ? 700 : 500,
                      }}>
                        {inv.dueDate} {inv.isOverdue && '⚠️ (Overdue)'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ${inv.totalAmount.toLocaleString()}
                    </td>
                    <td>
                      <span style={{
                        fontWeight: 700,
                        color: inv.amountDue > 0 ? (inv.isOverdue ? '#F87171' : '#FBBF24') : '#34D399',
                      }}>
                        ${inv.amountDue.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span className={`badge badge-${inv.status}`}>
                          {inv.status.replace('_', ' ')}
                        </span>
                        {inv.isOverdue && (
                          <span className="badge badge-overdue" style={{ fontSize: '0.65rem' }}>
                            Overdue
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        {/* Confirm if Draft */}
                        {inv.status === 'draft' && (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'confirmed')}
                            className="btn btn-success btn-sm"
                            title="Confirm Invoice"
                          >
                            Confirm
                          </button>
                        )}

                        {/* Send Invoice */}
                        {inv.status !== 'cancelled' && (
                          <button
                            onClick={() => sendInvoice(inv.id)}
                            className="btn btn-secondary btn-sm"
                            title="Send invoice via email to customer"
                          >
                            <Send size={13} />
                          </button>
                        )}

                        {/* Print / Preview */}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="btn btn-secondary btn-sm"
                          title="Print or view PDF invoice"
                        >
                          <Printer size={13} />
                        </button>

                        {/* Record Payment if balance due */}
                        {inv.amountDue > 0 && inv.status !== 'cancelled' && onRecordPaymentForInvoice && (
                          <button
                            onClick={() => onRecordPaymentForInvoice(inv)}
                            className="btn btn-primary btn-sm"
                            title="Record Payment against invoice"
                          >
                            <DollarSign size={13} />
                            <span>Pay</span>
                          </button>
                        )}

                        {/* Cancel if not paid */}
                        {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Cancel invoice ${inv.invoiceNumber}?`)) {
                                cancelInvoice(inv.id);
                              }
                            }}
                            className="btn btn-danger btn-sm"
                            title="Cancel Invoice"
                          >
                            <XCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINT-READY INVOICE MODAL */}
      {selectedInvoice && (
        <div className="modal-backdrop" onClick={() => setSelectedInvoice(null)}>
          <div
            className="modal-content printable-invoice"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px', background: '#FFFFFF', color: '#0F172A', padding: '2.5rem', borderRadius: '12px' }}
          >
            {/* Top Toolbar for Screen View */}
            <div className="no-print" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #E2E8F0',
              paddingBottom: '1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748B' }}>
                  Invoice Document Preview
                </span>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: selectedInvoice.status === 'paid' ? '#DCFCE7' : '#FEF3C7',
                  color: selectedInvoice.status === 'paid' ? '#166534' : '#92400E',
                }}>
                  {selectedInvoice.status.toUpperCase()}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handlePrint}
                  style={{
                    background: '#2563EB',
                    color: '#FFF',
                    border: 'none',
                    padding: '0.45rem 0.9rem',
                    borderRadius: '6px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Printer size={15} />
                  <span>Print / Save PDF</span>
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  style={{
                    background: '#F1F5F9',
                    color: '#334155',
                    border: '1px solid #CBD5E1',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Corporate Invoice Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1D4ED8', letterSpacing: '-0.02em' }}>
                  ⚡ Brightloop Software
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  Brightloop Digital Technologies Corp.<br />
                  100 Tech Square, 14th Floor, Suite 400<br />
                  billing@brightloop.io &bull; +1 (800) 555-LOOP<br />
                  Tax ID: US-EIN-992-881920
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A' }}>
                  INVOICE
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#2563EB' }}>
                  {selectedInvoice.invoiceNumber}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.35rem' }}>
                  Subscription Ref: <strong>{selectedInvoice.subscriptionNumber}</strong>
                </div>
              </div>
            </div>

            {/* Bill To & Invoice Metadata */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 1fr',
              gap: '2rem',
              background: '#F8FAFC',
              padding: '1.25rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              marginBottom: '2rem',
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748B', letterSpacing: '0.05em' }}>
                  Billed To (Customer)
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginTop: '0.25rem' }}>
                  {selectedInvoice.customerName}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                  {selectedInvoice.customerCompany}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '0.25rem', lineHeight: 1.4 }}>
                  {selectedInvoice.customerEmail}<br />
                  {selectedInvoice.customerAddress || '450 Innovation Parkway, Austin, TX'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Issue Date:</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{selectedInvoice.issueDate}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Due Date:</div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: selectedInvoice.isOverdue ? '#DC2626' : '#0F172A' }}>
                    {selectedInvoice.dueDate}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Billing Period:</div>
                  <div style={{ fontSize: '0.8rem' }}>{selectedInvoice.periodStart} to {selectedInvoice.periodEnd}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B' }}>Payment Terms:</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{selectedInvoice.paymentTerms}</div>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #CBD5E1', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569' }}>Description</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569' }}>Qty</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569' }}>Unit Price</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569' }}>Tax %</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#475569', textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {selectedInvoice.lines.map((line) => (
                  <tr key={line.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                    <td style={{ padding: '0.875rem 0.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A' }}>{line.productName}</div>
                      {line.variantName && (
                        <div style={{ fontSize: '0.75rem', color: '#2563EB' }}>Variant: {line.variantName}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 0.5rem', color: '#334155' }}>{line.quantity}</td>
                    <td style={{ padding: '0.875rem 0.5rem', color: '#334155' }}>${line.unitPrice.toLocaleString()}</td>
                    <td style={{ padding: '0.875rem 0.5rem', color: '#334155' }}>{line.taxRate}%</td>
                    <td style={{ padding: '0.875rem 0.5rem', textAlign: 'right', fontWeight: 600, color: '#0F172A' }}>
                      ${line.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem' }}>
              <div style={{ width: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', color: '#475569', fontSize: '0.875rem' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600 }}>${selectedInvoice.subtotal.toLocaleString()}</span>
                </div>
                {selectedInvoice.discountTotal > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', color: '#16A34A', fontSize: '0.875rem' }}>
                    <span>Discounts Applied:</span>
                    <span>-${selectedInvoice.discountTotal.toLocaleString()}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', color: '#475569', fontSize: '0.875rem' }}>
                  <span>Taxes (VAT / Sales):</span>
                  <span style={{ fontWeight: 600 }}>${selectedInvoice.taxTotal.toLocaleString()}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0',
                  borderTop: '2px solid #0F172A',
                  borderBottom: '2px solid #0F172A',
                  marginTop: '0.5rem',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: '#0F172A',
                }}>
                  <span>Total Amount:</span>
                  <span>${selectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', color: '#16A34A', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span>Amount Paid:</span>
                  <span>${selectedInvoice.amountPaid.toLocaleString()}</span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  color: selectedInvoice.amountDue > 0 ? '#DC2626' : '#16A34A',
                  fontSize: '1rem',
                  fontWeight: 800,
                }}>
                  <span>Balance Due:</span>
                  <span>${selectedInvoice.amountDue.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Remittance Instructions */}
            <div style={{
              background: '#F8FAFC',
              padding: '1rem',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              fontSize: '0.8rem',
              color: '#64748B',
              lineHeight: 1.5,
            }}>
              <strong style={{ color: '#0F172A' }}>Remittance Instructions:</strong><br />
              Please remit payment via Bank Wire Transfer to: Brightloop Corp, Silicon Valley Bank, Routing #021000021, Account #889201928.<br />
              Or settle online via our encrypted Customer Portal using credit card or direct debit. Reference invoice number{' '}
              <strong>{selectedInvoice.invoiceNumber}</strong> with your payment.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
