import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Zap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  RotateCcw,
  Play,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const BillingRunView: React.FC = () => {
  const {
    subscriptions,
    plans,
    invoices,
    simulatedDate,
    setSimulatedDate,
    runBillingDay,
    billingLogs,
  } = useApp();

  const [targetDate, setTargetDate] = useState<string>(simulatedDate);
  const [lastRunResult, setLastRunResult] = useState<{
    count: number;
    totalAmount: number;
    invoiceNumbers: string[];
    message: string;
  } | null>(null);

  // Subscriptions eligible for billing on targetDate
  const targetDateObj = new Date(targetDate);
  const eligibleSubs = subscriptions.filter((sub) => {
    if (sub.status !== 'active') return false;
    return new Date(sub.nextBillingDate) <= targetDateObj;
  });

  // Check which are already billed
  const subsWithStatus = eligibleSubs.map((sub) => {
    const plan = plans.find((p) => p.id === sub.planId);
    const freq = plan?.billingFrequency || 'monthly';
    const periodStart = sub.nextBillingDate;

    const alreadyBilled = invoices.some(
      (inv) =>
        inv.subscriptionId === sub.id &&
        (inv.periodStart === periodStart || inv.issueDate === targetDate) &&
        inv.status !== 'cancelled'
    );

    return {
      sub,
      alreadyBilled,
      periodStart,
    };
  });

  const dueToGenerateCount = subsWithStatus.filter((s) => !s.alreadyBilled).length;
  const alreadyBilledCount = subsWithStatus.filter((s) => s.alreadyBilled).length;

  const handleExecuteRun = () => {
    const result = runBillingDay(targetDate);
    setLastRunResult(result);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Title */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Recurring Billing Engine</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Automated batch invoice generation. Evaluates recurring frequencies (daily, weekly, monthly, yearly), applies active tax and discount rules, and guarantees zero duplicate billings.
        </p>
      </div>

      {/* Main Execution Card */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '1.25rem',
          marginBottom: '1.25rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={22} color="#818CF8" />
              <span>Billing Run Simulator</span>
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Select target billing date to evaluate all due customer subscriptions.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-elevated)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-medium)' }}>
              <Calendar size={16} color="#818CF8" />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Simulate Date:</span>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFF',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            <button
              onClick={handleExecuteRun}
              disabled={dueToGenerateCount === 0}
              className="btn btn-primary"
              style={{ padding: '0.65rem 1.25rem', fontSize: '0.9rem', opacity: dueToGenerateCount > 0 ? 1 : 0.6 }}
            >
              <Zap size={18} />
              <span>Run Automated Billing ({dueToGenerateCount} Subscriptions)</span>
            </button>
          </div>
        </div>

        {/* Execution Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Due Subscriptions
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: '#FFF' }}>
              {eligibleSubs.length}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Active accounts where nextBilling &le; {targetDate}
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              New Invoices To Create
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: '#34D399' }}>
              {dueToGenerateCount}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Ready for immediate batch generation
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Duplicate Safeguard
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: '#818CF8' }}>
              {alreadyBilledCount} Skipped
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
              Guaranteed no double-billing for this period
            </div>
          </div>
        </div>

        {/* Last Run Success Banner */}
        {lastRunResult && (
          <div style={{
            padding: '1rem',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}>
            <CheckCircle2 size={24} color="#34D399" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, color: '#34D399' }}>Billing Run Completed Successfully!</div>
              <div style={{ fontSize: '0.85rem', color: '#A7F3D0' }}>
                {lastRunResult.message}
              </div>
              {lastRunResult.invoiceNumbers.length > 0 && (
                <div style={{ fontSize: '0.75rem', color: '#6EE7B7', marginTop: '0.25rem' }}>
                  Generated Invoices: {lastRunResult.invoiceNumbers.join(', ')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Subscriptions Queue Table */}
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Evaluated Subscriptions Queue for Billing Date: {targetDate}
        </h3>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subscription #</th>
                <th>Customer / Account</th>
                <th>Plan Frequency</th>
                <th>Current Billing Window</th>
                <th>Amount to Bill</th>
                <th>Billing Status</th>
              </tr>
            </thead>
            <tbody>
              {subsWithStatus.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No subscriptions are due for billing on or before {targetDate}.
                  </td>
                </tr>
              ) : (
                subsWithStatus.map(({ sub, alreadyBilled, periodStart }) => (
                  <tr key={sub.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: '#818CF8' }}>{sub.subscriptionNumber}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{sub.customerName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.customerCompany}</div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: '#A5B4FC' }}>
                        {sub.planName}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8rem' }}>Starts: {periodStart}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      ${sub.totalAmount.toLocaleString()}
                    </td>
                    <td>
                      {alreadyBilled ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#818CF8',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          background: 'rgba(99, 102, 241, 0.15)',
                          borderRadius: '4px',
                        }}>
                          <CheckCircle2 size={13} /> Already Billed (Protected)
                        </span>
                      ) : (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          color: '#34D399',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '0.2rem 0.5rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          borderRadius: '4px',
                        }}>
                          <Clock size={13} /> Queued for Generation
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Billing Run Logs */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Automated Billing Run Audit Logs
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Historical record of every automated billing sweep and recurring engine trigger.
        </p>

        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Execution Date</th>
                <th>Target Date</th>
                <th>Processed</th>
                <th>Invoices Generated</th>
                <th>Total Billed</th>
                <th>Status</th>
                <th>Run Details</th>
              </tr>
            </thead>
            <tbody>
              {billingLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontWeight: 600, fontSize: '0.8rem' }}>{log.runDate}</td>
                  <td>{log.simulatedTargetDate}</td>
                  <td>{log.processedCount} subs</td>
                  <td style={{ fontWeight: 700, color: '#34D399' }}>{log.invoicesGenerated}</td>
                  <td style={{ fontWeight: 800 }}>${log.totalBilledAmount.toLocaleString()}</td>
                  <td>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: '#34D399',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}>
                      {log.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
