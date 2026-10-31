import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Repeat,
  CreditCard,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import {
  exportInvoicesToCSV,
  exportSubscriptionsToCSV,
  exportPaymentsToCSV,
  exportReceivablesToCSV,
} from '../utils/exportUtils';
import { ToastMessage } from './Toast';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  addToast?: (type: ToastMessage['type'], title: string, message?: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, addToast }) => {
  const { invoices, subscriptions, payments, simulatedDate } = useApp();
  const [downloadingSection, setDownloadingSection] = useState<string | null>(null);

  if (!isOpen) return null;

  // Active / eligible counts
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const unpaidInvoices = invoices.filter((i) => i.amountDue > 0 && i.status !== 'cancelled');
  const totalReceivables = unpaidInvoices.reduce((sum, i) => sum + i.amountDue, 0);

  const handleExport = (key: string, runExport: () => void, name: string, count: number) => {
    setDownloadingSection(key);
    setTimeout(() => {
      runExport();
      setDownloadingSection(null);
      addToast?.('success', 'Export Downloaded', `${name} (${count} records) exported to CSV successfully.`);
    }, 400);
  };

  const exportOptions = [
    {
      id: 'invoices',
      title: 'Invoices Register',
      description: 'Comprehensive line-item details, tax totals, discounts, status, and payment terms.',
      icon: FileText,
      iconColor: '#818CF8',
      iconBg: 'rgba(99, 102, 241, 0.2)',
      stats: `${invoices.length} Invoices ($${Math.round(totalInvoiced).toLocaleString()})`,
      action: () => exportInvoicesToCSV(invoices),
      count: invoices.length,
    },
    {
      id: 'subscriptions',
      title: 'Active Subscriptions',
      description: 'Current recurring contracts, plan names, next billing cycle dates, and values.',
      icon: Repeat,
      iconColor: '#34D399',
      iconBg: 'rgba(16, 185, 129, 0.2)',
      stats: `${activeSubs.length} Active (${subscriptions.length} Total Contracts)`,
      action: () => exportSubscriptionsToCSV(subscriptions),
      count: subscriptions.length,
    },
    {
      id: 'payments',
      title: 'Payments Ledger',
      description: 'Payment receipts, transactional references, recorded payment methods, and dates.',
      icon: CreditCard,
      iconColor: '#F472B6',
      iconBg: 'rgba(236, 72, 153, 0.2)',
      stats: `${payments.length} Payments ($${Math.round(totalPayments).toLocaleString()})`,
      action: () => exportPaymentsToCSV(payments),
      count: payments.length,
    },
    {
      id: 'receivables',
      title: 'Accounts Receivable',
      description: 'Unpaid and overdue balances with aging breakdown (<30d, 31-60d, 61+d).',
      icon: Clock,
      iconColor: '#FBBF24',
      iconBg: 'rgba(245, 158, 11, 0.2)',
      stats: `${unpaidInvoices.length} Outstanding ($${Math.round(totalReceivables).toLocaleString()})`,
      action: () => exportReceivablesToCSV(invoices, simulatedDate),
      count: unpaidInvoices.length,
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 16, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.65)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
              }}
            >
              <FileSpreadsheet size={18} color="#FFFFFF" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Finance &amp; Data Export Hub
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '0.15rem 0 0 0' }}>
                Download production CSV ledgers directly from active platform data
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease',
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body Content */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem 1rem',
              fontSize: '0.8rem',
              color: '#C7D2FE',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={16} color="#818CF8" />
              <span>
                All exports include standard RFC 4180 headers with UTF-8 BOM encoding for seamless Microsoft Excel and Google Sheets import.
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {exportOptions.map((opt) => {
              const Icon = opt.icon;
              const isDownloading = downloadingSection === opt.id;

              return (
                <div
                  key={opt.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.25rem',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    gap: '1rem',
                    flexWrap: 'wrap',
                    transition: 'border-color 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', flex: 1, minWidth: '260px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: opt.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '0.1rem',
                      }}
                    >
                      <Icon size={18} color={opt.iconColor} />
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                          {opt.title}
                        </h3>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {opt.stats}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-muted)',
                          margin: '0.25rem 0 0 0',
                          lineHeight: 1.4,
                        }}
                      >
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExport(opt.id, opt.action, opt.title, opt.count)}
                    disabled={isDownloading || opt.count === 0}
                    className="btn btn-secondary btn-sm"
                    style={{
                      gap: '0.4rem',
                      minWidth: '125px',
                      justifyContent: 'center',
                      opacity: opt.count === 0 ? 0.5 : 1,
                      cursor: opt.count === 0 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isDownloading ? (
                      <>
                        <CheckCircle2 size={14} color="#34D399" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Export CSV</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(15, 23, 42, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.75rem',
          }}
        >
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

