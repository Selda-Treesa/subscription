import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { DashboardView } from './components/views/DashboardView';
import { AutomationCenterView } from './components/views/AutomationCenterView';
import { SubscriptionsView } from './components/views/SubscriptionsView';
import { InvoicesView } from './components/views/InvoicesView';
import { BillingRunView } from './components/views/BillingRunView';
import { PaymentsView } from './components/views/PaymentsView';
import { OverdueChaserView } from './components/views/OverdueChaserView';
import { ProductsView } from './components/views/ProductsView';
import { PlansView } from './components/views/PlansView';
import { QuotationTemplatesView } from './components/views/QuotationTemplatesView';
import { DiscountsTaxesView } from './components/views/DiscountsTaxesView';
import { CustomerPortalView } from './components/views/CustomerPortalView';
import { StaffManagementView } from './components/views/StaffManagementView';
import { Invoice } from './types';

const MainApp: React.FC = () => {
  const { currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [preselectedInvoiceForPayment, setPreselectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Automatically adapt default view based on user role
  useEffect(() => {
    if (currentUser.role === 'customer') {
      setActiveTab('customer-portal');
    } else {
      if (activeTab === 'customer-portal') {
        setActiveTab('dashboard');
      }
    }
  }, [currentUser.role]);

  const handleRecordPaymentForInvoice = (invoice: Invoice) => {
    setPreselectedInvoiceForPayment(invoice);
    setActiveTab('payments');
  };

  const handleStartQuoteFromTemplate = (_templateId: string) => {
    setActiveTab('subscriptions');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Global Header */}
      <Header
        onOpenNewQuote={() => setActiveTab('subscriptions')}
        onOpenBillingModal={() => setActiveTab('billing-run')}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Body with Sidebar + Content View */}
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main style={{
          flex: 1,
          padding: '1.75rem 2rem',
          maxWidth: '1600px',
          width: '100%',
          margin: '0 auto',
        }}>
          {/* Active View Router */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenBilling={() => setActiveTab('billing-run')}
            />
          )}

          {activeTab === 'automation-center' && <AutomationCenterView />}

          {activeTab === 'subscriptions' && <SubscriptionsView />}

          {activeTab === 'invoices' && (
            <InvoicesView onRecordPaymentForInvoice={handleRecordPaymentForInvoice} />
          )}

          {activeTab === 'billing-run' && <BillingRunView />}

          {activeTab === 'payments' && (
            <PaymentsView
              preselectedInvoice={preselectedInvoiceForPayment}
              onClearPreselectedInvoice={() => setPreselectedInvoiceForPayment(null)}
            />
          )}

          {activeTab === 'overdue-chaser' && (
            <OverdueChaserView onRecordPaymentForInvoice={handleRecordPaymentForInvoice} />
          )}

          {activeTab === 'products' && <ProductsView />}

          {activeTab === 'plans' && <PlansView />}

          {activeTab === 'templates' && (
            <QuotationTemplatesView onStartQuoteFromTemplate={handleStartQuoteFromTemplate} />
          )}

          {activeTab === 'discounts-taxes' && <DiscountsTaxesView />}

          {activeTab === 'customer-portal' && <CustomerPortalView />}

          {activeTab === 'staff-management' && <StaffManagementView />}
        </main>
      </div>

      {/* Sign Up / Log In / Reset Password Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
