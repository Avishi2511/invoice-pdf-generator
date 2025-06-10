import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Search, Filter, Download, Eye, Trash2, Edit, User, Settings, LogOut,
  CheckCircle, Clock, AlertCircle, X, ChevronDown} 
from 'lucide-react';

interface Invoice {
  _id: string;
  clientName: string;
  clientEmail?: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  status: 'ready' | 'processing' | 'error';
  createdAt?: string;
  updatedAt?: string;
  pdfUrl?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface DashboardProps {
  onLogout: () => void;
  onNavigateToInvoices: () => void;
  onNavigateToSettings: () => void;
  onNavigateToHome: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout, onNavigateToInvoices, onNavigateToSettings, onNavigateToHome }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: ''
  });
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentStatus, setCurrentStatus] = useState<'idle' | 'creating' | 'processing' | 'ready' | 'error'>('idle');
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

  // Get userId from localStorage (set after login/signup)
  const userId = localStorage.getItem('userId');
  console.log('Dashboard userId:', userId); // Debug message

  // Fetch invoices for this user on mount
  useEffect(() => {
    if (!userId) {
      console.log('No userId found, user not logged in');
      return;
    }
    console.log('Fetching invoices for userId:', userId);
    fetch(`http://localhost:5000/api/invoices/${userId}`)
      .then(res => res.json())
      .then(data => {
        console.log('Received invoices:', data);
        if (Array.isArray(data)) setInvoices(data);
      })
      .catch(error => {
        console.error('Error fetching invoices:', error);
      });
  }, [userId]);

  // Poll for invoice status updates when there's a processing invoice
  useEffect(() => {
    if (!userId || !currentInvoiceId || currentStatus === 'ready' || currentStatus === 'error') {
      return;
    }

    const pollInterval = setInterval(() => {
      console.log('Polling for invoice status update:', currentInvoiceId);
      fetch(`http://localhost:5000/api/invoices/${userId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setInvoices(data);
            const targetInvoice = data.find(inv => inv._id === currentInvoiceId);
            if (targetInvoice) {
              console.log('Target invoice status:', targetInvoice.status);
              if (targetInvoice.status === 'ready') {
                setCurrentStatus('ready');
                setTimeout(() => {
                  setCurrentStatus('idle');
                  setCurrentInvoiceId(null);
                }, 3000); // Show success for 3 seconds
              } else if (targetInvoice.status === 'error') {
                setCurrentStatus('error');
                setTimeout(() => {
                  setCurrentStatus('idle');
                  setCurrentInvoiceId(null);
                }, 5000); // Show error for 5 seconds
              }
            }
          }
        })
        .catch(error => {
          console.error('Error polling invoice status:', error);
        });
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [userId, currentInvoiceId, currentStatus]);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(items => items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeLineItem = (id: string) => {
    setLineItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'processing': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-400" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'error': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    (invoice.clientName && invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (invoice._id && invoice._id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDownloadPDF = async (invoice: Invoice) => {
    if (!invoice.pdfUrl || invoice.status !== 'ready') {
      alert('PDF is not ready for download yet.');
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5000${invoice.pdfUrl}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `invoice_${invoice._id}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download PDF.');
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Error downloading PDF.');
    }
  };

  // When creating a new invoice, POST to backend with userId
  const handleCreateInvoice = async () => {
    if (!clientInfo.name || !clientInfo.email || lineItems.length === 0) {
      alert('Please fill in all required fields and add at least one line item.');
      return;
    }
    
    if (!userId) {
      alert('User not logged in. Please refresh the page and log in again.');
      return;
    }
    
    // Set status to creating
    setCurrentStatus('creating');
    
    // Sanitize line items to match backend schema (remove id, ensure numbers)
    const sanitizedItems = lineItems.map(({ description, quantity, unitPrice, total }) => ({
      description,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      total: Number(total)
    }));
    
    try {
      const res = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          clientName: clientInfo.name,
          clientEmail: clientInfo.email,
          items: sanitizedItems
        })
      });
      const data = await res.json();
      if (res.ok) {
        setInvoices(prev => [data, ...prev]);
        setClientInfo({ name: '', email: '' });
        setLineItems([]);
        setCurrentStatus('processing');
        setCurrentInvoiceId(data._id);
        console.log('Invoice created, starting to monitor:', data._id);
      } else {
        console.error('Failed to create invoice:', data);
        setCurrentStatus('error');
        setTimeout(() => {
          setCurrentStatus('idle');
        }, 5000);
      }
    } catch (error) {
      console.error('Network error:', error);
      setCurrentStatus('error');
      setTimeout(() => {
        setCurrentStatus('idle');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">InvoicePro</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={onNavigateToHome}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FileText className="h-5 w-5" />
              <span>Home</span>
            </button>
            <button
              onClick={onNavigateToInvoices}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 bg-purple-600 text-white shadow-lg"
            >
              <FileText className="h-5 w-5" />
              <span>Invoices</span>
            </button>
            <button
              onClick={onNavigateToSettings}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-red-400 hover:bg-red-700 hover:text-white"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-gray-400">Create and manage your invoices</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">John Doe</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
              <button 
                onClick={onLogout}
                className="px-4 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Create New Invoice */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Create New Invoice</h2>
              
              {/* Client Information */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-4">Client Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Client Name</label>
                    <input
                      type="text"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter client name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Client Email</label>
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter client email"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-white mb-4">Line Items</h3>
                <div className="space-y-3">
                  {lineItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Description"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Qty"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          placeholder="Price"
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-300 text-sm">
                          ${item.total.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <button
                          onClick={() => removeLineItem(item.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={addLineItem}
                  className="mt-3 flex items-center space-x-2 px-4 py-2 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-lg transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Totals */}
              <div className="mb-6 bg-gray-700/50 rounded-lg p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Tax (10%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-white border-t border-gray-600 pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button 
                onClick={handleCreateInvoice} 
                disabled={currentStatus === 'creating' || currentStatus === 'processing'}
                className={`w-full py-3 rounded-lg font-medium transition-all duration-200 transform shadow-lg ${
                  currentStatus === 'creating' || currentStatus === 'processing'
                    ? 'bg-gray-600 cursor-not-allowed text-gray-300'
                    : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:scale-105 hover:shadow-purple-500/25'
                }`}
              >
                {currentStatus === 'creating' ? 'Creating Invoice...' : 
                 currentStatus === 'processing' ? 'Generating PDF...' : 
                 'Generate PDF Invoice'}
              </button>
            </div>

            {/* Recent Invoices */}
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Invoices</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Search invoices..."
                    />
                  </div>
                  <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200">
                    <Filter className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Invoice List */}
              <div className="space-y-3">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-600" />
                    <p>No invoices yet. Create your first invoice above!</p>
                  </div>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <div 
                      key={invoice._id} 
                      className={`bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700 transition-all duration-200 ${
                        invoice._id === currentInvoiceId ? 'ring-2 ring-purple-500/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <div className="font-medium text-white">{invoice._id}</div>
                            <div className="text-sm text-gray-400">{invoice.clientName}</div>
                          </div>
                          <div className="text-sm text-gray-400">
                            {invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="font-medium text-white">
                            ${invoice.items.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            <span className="capitalize">{invoice.status}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-all duration-200">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadPDF(invoice)}
                              disabled={invoice.status !== 'ready'}
                              className={`p-1 rounded transition-all duration-200 ${
                                invoice.status === 'ready' 
                                  ? 'text-gray-400 hover:text-white hover:bg-gray-600' 
                                  : 'text-gray-600 cursor-not-allowed'
                              }`}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-all duration-200">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all duration-200">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Real-time Updates */}
              <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Real-time updates enabled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Messages - Only show during active operations */}
          {currentStatus !== 'idle' && (
            <div className="mt-8">
              {currentStatus === 'creating' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Clock className="h-5 w-5 animate-spin" />
                    <span className="font-medium">Creating invoice...</span>
                  </div>
                </div>
              )}
              
              {currentStatus === 'processing' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <Clock className="h-5 w-5 animate-spin" />
                    <span className="font-medium">Generating PDF...</span>
                  </div>
                </div>
              )}
              
              {currentStatus === 'ready' && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Invoice created successfully! PDF is ready for download.</span>
                  </div>
                </div>
              )}
              
              {currentStatus === 'error' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Failed to create invoice. Please try again.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;