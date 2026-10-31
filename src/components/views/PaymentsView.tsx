import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Payment, PaymentMethod, Invoice } from '../../types';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  DollarSign,
  Calendar,
  FileText,
  User,
  Tag,
  ArrowDownLeft,
} from 'lucide-react';

interface PaymentsViewProps {
  preselectedInvoice?: Invoice | null;
  onClearPreselectedInvoice?: () => void;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  preselectedInvoice,
  onClearPreselectedInvoice,
}) => {
  const { payments, invoices, recordPayment, currentUser, simulatedDate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(!!preselectedInvoice);

  // Form State
  const [formInvoiceId, setFormInvoiceId] = useState<string>(preselectedInvoice?.id || '');
  const [formAmount, setFormAmount] = useState<number>(preselectedInvoice?.amountDue || 0);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('Bank Transfer');
  const [formDate, setFormDate] = useState<string>(simulatedDate);
  const [formReference, setFormReference] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // When invoice selection changes in modal
  const handleInvoiceChange = (invId: string) => {
    setFormInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv) {
      setFormAmount(inv.amountDue);
      setFormReference(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find((i) => i.id === formInvoiceId);
    if (!inv) return;

    recordPayment({
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      amount: formAmount,
      paymentDate: formDate,
      paymentMethod: formMethod,
      reference: formReference || `TXN-${Date.now().toString().slice(-6)}`,
      notes: formNotes || `Settlement of ${inv.invoiceNumber} via ${formMethod}`,
      recordedBy: currentUser.name,
    });

    setIsModalOpen(false);
    if (onClearPreselectedInvoice) onClearPreselectedInvoice();
  };

  // Open modal with preselected invoice if prop provided
  React.useEffect(() => {
    if (preselectedInvoice) {
      setFormInvoiceId(preselectedInvoice.id);
      setFormAmount(preselectedInvoice.amountDue);
      setFormReference(`TXN-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsModalOpen(true);
    }
  }, [preselectedInvoice]);

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.paymentNumber.toLowerCase().includes(q) ||
      p.invoiceNumber.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q)
    );
  });

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  // Invoices with outstanding balances
  const payableInvoices = invoices.filter((i) => i.amountDue > 0 && i.status !== 'cancelled');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Payments Register</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Record payments across bank wire, credit card, Stripe, and direct settlement against verified customer invoices.
          </p>
        </div>

        <button
          onClick={() => {
            if (payableInvoices.length > 0) {
              handleInvoiceChange(payableInvoices[0].id);
            }
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Verified Inflow
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#34D399' }}>
            ${totalCollected.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Across {payments.length} settled transactions
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Open Receivable Invoices
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#FBBF24' }}>
            {payableInvoices.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Awaiting full or partial payment
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel" style={{ padding: '0.875rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search payments by receipt #, invoice #, customer name, or transaction reference..."
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
      </div>

      {/* Payments Table */}
      <div className="glass-panel">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Payment #</th>
                <th>Invoice #</th>
                <th>Customer</th>
                <th>Payment Date</th>
                <th>Method</th>
                <th>Transaction Ref</th>
                <th>Amount Paid</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No payments found matching your query.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#34D399' }}>{p.paymentNumber}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#60A5FA' }}>{p.invoiceNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.customerName}</div>
                    </td>
                    <td>{p.paymentDate}</td>
                    <td>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#93C5FD',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {p.reference}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#FFFFFF' }}>
                        ${p.amount.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.recordedBy}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Record Payment</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Match inbound funds against an outstanding customer invoice
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePayment} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Target Invoice to Settle</label>
                <select
                  value={formInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">-- Choose an Open Invoice --</option>
                  {payableInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} &bull; {inv.customerName} (Due: ${inv.amountDue.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Payment Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Method</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="form-select"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Wire / Transfer</option>
                    <option value="Stripe">Stripe Checkout</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Cash / Check">Cash / Cheque</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Transaction Reference #</label>
                  <input
                    type="text"
                    required
                    value={formReference}
                    onChange={(e) => setFormReference(e.target.value)}
                    placeholder="e.g. WIRE-884920"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes &amp; Bank Statement Match</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Verified against Barclays bank statement line #428"
                  className="form-textarea"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!formInvoiceId || formAmount <= 0}
                  className="btn btn-primary"
                >
                  Confirm &amp; Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
