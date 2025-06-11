import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  User, 
  Settings, 
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  ChevronDown,
  Calendar,
  MoreHorizontal,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

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
  createdAt: string;
  updatedAt: string;
  pdfUrl?: string;
}

interface InvoicePageProps {
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToSettings: () => void;
  onNavigateToHome: () => void;
}

const InvoicePage: React.FC<InvoicePageProps> = ({
  onLogout,
  onNavigateToDashboard,
  onNavigateToSettings,
  onNavigateToHome
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  // Get userId from localStorage
  const userId = localStorage.getItem('userId');

  // Fetch invoices from backend
  const fetchInvoices = async () => {
    if (!userId) {
      setError('User not logged in');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/invoices/${userId}`);
      const data = await response.json();
      
      if (response.ok) {
        setInvoices(data);
        setError(null);
      } else {
        setError('Failed to fetch invoices');
      }
    } catch (err) {
      setError('Network error while fetching invoices');
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, [userId]);

  // Fetch user email on component mount
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (email) {
      setUserEmail(email);
    }
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchInvoices();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, userId]);

  // Calculate stats from real data
  const stats = {
    totalInvoices: invoices.length,
    thisMonth: invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      const now = new Date();
      return invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear();
    }).length,
    totalRevenue: invoices
      .filter(invoice => invoice.status === 'ready')
      .reduce((sum, invoice) => sum + invoice.items.reduce((itemSum, item) => itemSum + item.total, 0), 0),
    processing: invoices.filter(invoice => invoice.status === 'processing').length
  };

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

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice._id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateRange !== 'all') {
      const invoiceDate = new Date(invoice.createdAt);
      const now = new Date();
      
      switch (dateRange) {
        case 'today':
          matchesDate = invoiceDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = invoiceDate >= weekAgo;
          break;
        case 'month':
          matchesDate = invoiceDate.getMonth() === now.getMonth() && 
                       invoiceDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'amount':
        const aAmount = a.items.reduce((sum, item) => sum + item.total, 0);
        const bAmount = b.items.reduce((sum, item) => sum + item.total, 0);
        return bAmount - aAmount;
      case 'client':
        return a.clientName.localeCompare(b.clientName);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = sortedInvoices.slice(startIndex, startIndex + itemsPerPage);

  const toggleInvoiceSelection = (invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    );
  };

  const toggleSelectAll = () => {
    setSelectedInvoices(prev => 
      prev.length === paginatedInvoices.length 
        ? []
        : paginatedInvoices.map(invoice => invoice._id)
    );
  };

  // Handle PDF download
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

  const handleDeleteInvoice = async (invoice: Invoice) => {
    if (!confirm(`Are you sure you want to delete invoice for ${invoice.clientName}? This action cannot be undone.`)) {
      return;
    }

    if (!userId) {
      alert('User not logged in. Please refresh the page and log in again.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/invoices/${invoice._id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        // Remove invoice from local state
        setInvoices(prev => prev.filter(inv => inv._id !== invoice._id));
        
        // Remove from selected invoices if it was selected
        setSelectedInvoices(prev => prev.filter(id => id !== invoice._id));
        
        console.log('Invoice deleted successfully:', invoice._id);
      } else {
        const data = await response.json();
        alert(`Failed to delete invoice: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting invoice. Please try again.');
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedInvoices.length === 0) {
      alert('Please select invoices to delete.');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedInvoices.length} selected invoice(s)? This action cannot be undone.`)) {
      return;
    }

    if (!userId) {
      alert('User not logged in. Please refresh the page and log in again.');
      return;
    }

    try {
      // Delete all selected invoices in parallel
      const deletePromises = selectedInvoices.map(invoiceId =>
        fetch(`http://localhost:5000/api/invoices/${invoiceId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        })
      );

      const responses = await Promise.all(deletePromises);
      
      // Check which deletions succeeded
      const succeededDeletions: string[] = [];
      const failedDeletions: string[] = [];

      for (let i = 0; i < responses.length; i++) {
        if (responses[i].ok) {
          succeededDeletions.push(selectedInvoices[i]);
        } else {
          failedDeletions.push(selectedInvoices[i]);
        }
      }

      // Update local state to remove succeeded deletions
      if (succeededDeletions.length > 0) {
        setInvoices(prev => prev.filter(inv => !succeededDeletions.includes(inv._id)));
        setSelectedInvoices(prev => prev.filter(id => !succeededDeletions.includes(id)));
      }

      // Show results
      if (failedDeletions.length === 0) {
        alert(`Successfully deleted ${succeededDeletions.length} invoice(s).`);
      } else {
        alert(`Deleted ${succeededDeletions.length} invoice(s). Failed to delete ${failedDeletions.length} invoice(s).`);
      }

      console.log('Bulk deletion completed:', { succeeded: succeededDeletions, failed: failedDeletions });
    } catch (error) {
      console.error('Bulk delete error:', error);
      alert('Error deleting invoices. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <button 
            onClick={onNavigateToHome}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
          >
            <div className="p-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">InvoicePro</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <button
              onClick={onNavigateToDashboard}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FileText className="h-5 w-5" />
              <span>Dashboard</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 bg-purple-600 text-white shadow-lg">
              <FileText className="h-5 w-5" />
              <span>My Invoices</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700 hover:text-white">
              <Settings className="h-5 w-5" />
              <span>Settings</span>
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
              <h1 className="text-2xl font-bold text-white">My Invoices</h1>
              <p className="text-gray-400">Manage all your generated invoices</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">{userEmail || 'Loading...'}</span>
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

        {/* Invoice Management Content */}
        <main className="flex-1 p-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Invoices</p>
                  <p className="text-2xl font-bold text-white">{stats.totalInvoices}</p>
                  <p className="text-xs text-gray-500 mt-1">All time</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <FileText className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">This Month</p>
                  <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
                  <p className="text-xs text-gray-500 mt-1">December 2024</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-400 mt-1">Generated</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Processing</p>
                  <p className="text-2xl font-bold text-white">{stats.processing}</p>
                  <p className="text-xs text-yellow-400 mt-1">In queue</p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Search by invoice #, client name..."
                  />
                </div>

                <div className="flex gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">Status</option>
                    <option value="ready">Ready</option>
                    <option value="processing">Processing</option>
                    <option value="error">Error</option>
                  </select>

                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">Date Range</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                  </select>

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="date">Sort By</option>
                    <option value="amount">Amount</option>
                    <option value="client">Client</option>
                    <option value="status">Status</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={fetchInvoices}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
                <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 flex items-center space-x-2">
                  <span>Bulk Actions</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button 
                  onClick={onNavigateToDashboard}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>New Invoice</span>
                </button>
              </div>
            </div>
          </div>

          {/* Invoice Table */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-6 py-4 text-left">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.length === paginatedInvoices.length && paginatedInvoices.length > 0}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Invoice ID</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date Created</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Last Updated</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading invoices...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-red-400">
                        <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                        {error}
                      </td>
                    </tr>
                  ) : paginatedInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                        <FileText className="h-6 w-6 mx-auto mb-2" />
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    paginatedInvoices.map((invoice) => (
                      <tr key={invoice._id} className="hover:bg-gray-700/30 transition-all duration-200">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedInvoices.includes(invoice._id)}
                            onChange={() => toggleInvoiceSelection(invoice._id)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          {invoice._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{invoice.clientName}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-white">
                          ${invoice.items.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            <span className="capitalize">{invoice.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(invoice.updatedAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition-all duration-200">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadPDF(invoice)}
                              disabled={invoice.status !== 'ready'}
                              className={`p-1 rounded transition-all duration-200 ${
                                invoice.status === 'ready'
                                  ? 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                                  : 'text-gray-600 cursor-not-allowed'
                              }`}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            {invoice.status === 'error' && (
                              <button className="p-1 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded transition-all duration-200">
                                <RefreshCw className="h-4 w-4" />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDeleteInvoice(invoice)}
                              className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-all duration-200"
                              title="Delete Invoice"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-all duration-200">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-gray-700/30 px-6 py-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-400">
                    Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedInvoices.length)} of {sortedInvoices.length} invoices
                  </span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={10}>10 per page</option>
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 rounded transition-all duration-200 ${
                        currentPage === i + 1
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-gray-600'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Export Selected</span>
              </button>
              <button 
                onClick={handleDeleteSelected}
                disabled={selectedInvoices.length === 0}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                  selectedInvoices.length === 0 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected ({selectedInvoices.length})</span>
              </button>
              <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Mark as Sent</span>
              </button>
              
              <div className="ml-auto flex items-center space-x-2">
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                  <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                  <span className="text-sm">Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
                </div>
                <button
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 text-sm"
                >
                  Toggle
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default InvoicePage;