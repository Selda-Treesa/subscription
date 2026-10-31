import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Invoice } from '../../types';
import {
  AlertTriangle,
  Mail,
  Send,
  DollarSign,
  Clock,
  ShieldAlert,
  CheckCircle2,
  Calendar,
  Building,
  User,
  ArrowRight,
} from 'lucide-react';

interface OverdueChaserViewProps {
  onRecordPaymentForInvoice: (invoice: Invoice) => void;
}

export const OverdueChaserView: React.FC<OverdueChaserViewProps> = ({ onRecordPaymentForInvoice }) => {
  const { invoices, chaseOverdueInvoice, simulatedDate } = useApp();

  const [selectedInvoiceForNotice, setSelectedInvoiceForNotice] = useState<Invoice | null>(null);
  const [customNoticeText, setCustomNoticeText] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filter overdue invoices
  const overdueInvoices = invoices.filter((inv) => inv.isOverdue && inv.amountDue > 0);

  const totalOverdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amountDue, 0);

  // Helper to compute days overdue
  const getDaysOverdue = (dueDateStr: string): number => {
    const dueTime = new Date(dueDateStr).getTime();
    const nowTime = new Date(simulatedDate).getTime();
    const diff = Math.floor((nowTime - dueTime) / (1000 * 3600 * 24));
    return Math.max(1, diff);
  };

  const handleQuickChase = (inv: Invoice) => {
    const res = chaseOverdueInvoice(inv.id);
    if (res.success) {
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleOpenNoticeModal = (inv: Invoice) => {
    setSelectedInvoiceForNotice(inv);
    const days = getDaysOverdue(inv.dueDate);
    setCustomNoticeText(
      `Dear ${inv.customerName},\n\nThis is a friendly reminder from Brightloop Software regarding invoice ${inv.invoiceNumber} for $${inv.amountDue.toFixed(2)}, which was due on ${inv.dueDate} (${days} days ago).\n\nPlease settle this invoice at your earliest convenience via the customer portal or wire transfer.\n\nBest regards,\nBrightloop Software Credit & Billing Team`
    );
  };

  const handleSendCustomNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForNotice) return;

    const res = chaseOverdueInvoice(selectedInvoiceForNotice.id, customNoticeText);
    if (res.success) {
      setFeedbackMsg(res.message);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
    setSelectedInvoiceForNotice(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <AlertTriangle size={26} color="#F87171" />
          <span>Collections &amp; Overdue Chaser Room</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Identify, prioritize, and chase outstanding receivables before they turn into uncollectable revenue.
        </p>
      </div>

      {/* High-level KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div className="glass-panel" style={{ padding: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.35)', background: 'rgba(38, 14, 20, 0.7)' }}>
          <div style={{ fontSize: '0.75rem', color: '#FCA5A5', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Overdue Capital
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F87171', marginTop: '0.25rem' }}>
            ${totalOverdueAmount.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Across {overdueInvoices.length} past-due accounts
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Average Overdue Duration
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
            {overdueInvoices.length > 0
              ? Math.round(
                  overdueInvoices.reduce((sum, inv) => sum + getDaysOverdue(inv.dueDate), 0) /
                    overdueInvoices.length
                )
              : 0}{' '}
            days
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Calculated as of {simulatedDate}
          </div>
        </div>
      </div>

      {/* Action Notification Alert */}
      {feedbackMsg && (
        <div style={{
          padding: '0.875rem 1.25rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 'var(--radius-md)',
          color: '#34D399',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontSize: '0.85rem',
        }}>
          <CheckCircle2 size={18} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Overdue Accounts Table */}
      <div className="glass-panel">
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Account / Company</th>
                <th>Due Date</th>
                <th>Aging Severity</th>
                <th>Balance Due</th>
                <th>Chase Attempts</th>
                <th>Last Chased</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {overdueInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎉</div>
                    <div style={{ fontWeight: 700, color: '#34D399' }}>Zero Overdue Invoices!</div>
                    <div style={{ fontSize: '0.85rem' }}>All accounts have settled their statements on time.</div>
                  </td>
                </tr>
              ) : (
                overdueInvoices.map((inv) => {
                  const days = getDaysOverdue(inv.dueDate);
                  const isSevere = days > 30;
                  return (
                    <tr key={inv.id}>
                      <td>
                        <span style={{ fontWeight: 700, color: '#F87171' }}>{inv.invoiceNumber}</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{inv.subscriptionNumber}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {inv.customerCompany} &bull; {inv.customerEmail}
                        </div>
                      </td>
                      <td>
                        <span style={{ color: '#F87171', fontWeight: 600 }}>{inv.dueDate}</span>
                      </td>
                      <td>
                        <span style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background: isSevere ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.2)',
                          color: isSevere ? '#F87171' : '#FBBF24',
                          border: `1px solid ${isSevere ? 'rgba(239, 68, 68, 0.5)' : 'rgba(245, 158, 11, 0.4)'}`,
                        }}>
                          {days} days overdue {isSevere ? '🚨' : '⚠️'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '1rem' }}>
                        ${inv.amountDue.toLocaleString()}
                      </td>
                      <td>
                        <span style={{
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                        }}>
                          {inv.chaseCount} notice{inv.chaseCount !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {inv.lastChasedAt || 'Not chased yet'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            onClick={() => handleQuickChase(inv)}
                            className="btn btn-danger btn-sm"
                            title="1-Click Quick Reminder"
                          >
                            <Send size={13} />
                            <span>Chase</span>
                          </button>

                          <button
                            onClick={() => handleOpenNoticeModal(inv)}
                            className="btn btn-secondary btn-sm"
                            title="Customize Notice Letter"
                          >
                            <Mail size={13} />
                          </button>

                          <button
                            onClick={() => onRecordPaymentForInvoice(inv)}
                            className="btn btn-primary btn-sm"
                            title="Record Inbound Payment"
                          >
                            <DollarSign size={13} />
                            <span>Settle</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CUSTOMIZE NOTICE MODAL */}
      {selectedInvoiceForNotice && (
        <div className="modal-backdrop" onClick={() => setSelectedInvoiceForNotice(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Dispatch Payment Reminder Notice</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  To: {selectedInvoiceForNotice.customerName} ({selectedInvoiceForNotice.customerEmail})
                </p>
              </div>
              <button
                onClick={() => setSelectedInvoiceForNotice(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSendCustomNotice} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Reminder Message</label>
                <textarea
                  rows={8}
                  required
                  value={customNoticeText}
                  onChange={(e) => setCustomNoticeText(e.target.value)}
                  className="form-textarea"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', lineHeight: 1.5 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setSelectedInvoiceForNotice(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Send size={15} />
                  <span>Send Official Demand Letter</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
