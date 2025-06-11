import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Settings, 
  LogOut,
  Upload,
  Shield,
  CreditCard,
  Bell,
  Eye,
  EyeOff,
  Check,
  X,
  Camera,
  Mail,
  Phone,
  MapPin,
  Building,
  DollarSign,
  Globe,
  Lock,
  Smartphone,
  Calendar,
  AlertTriangle,
  Save,
  ChevronRight,
  Loader
} from 'lucide-react';

export interface AccountSettingsProps {
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToInvoices: () => void;
  onNavigateHome: () => void;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  taxRate: string;
  currency: string;
  invoiceFormat: string;
  paymentReminders: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  profilePicture?: string;
}

interface SecurityData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  lastLogin: string;
}

interface BillingData {
  plan: string;
  billingCycle: string;
  nextBilling: string;
  paymentMethod: string;
  billingAddress: string;
  billingHistory: Array<{
    date: string;
    amount: string;
    status: string;
    invoice: string;
  }>;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({
  onLogout,
  onNavigateToDashboard,
  onNavigateToInvoices,
  onNavigateHome
}) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [profileData, setProfileData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    taxRate: '',
    currency: 'USD ($)',
    invoiceFormat: 'INV-YYYY-###',
    paymentReminders: false,
    emailNotifications: false,
    smsNotifications: false
  });

  const [securityData, setSecurityData] = useState<SecurityData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false,
    emailVerified: false,
    lastLogin: ''
  });

  const [billingData, setBillingData] = useState<BillingData>({
    plan: '',
    billingCycle: '',
    nextBilling: '',
    paymentMethod: '',
    billingAddress: '',
    billingHistory: []
  });

  // Get userId from localStorage
  const userId = localStorage.getItem('userId');

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          company: data.company || '',
          address: data.address || '',
          taxRate: data.taxRate || '0',
          currency: data.currency || 'USD ($)',
          invoiceFormat: data.invoiceFormat || 'INV-YYYY-###',
          paymentReminders: data.paymentReminders || false,
          emailNotifications: data.emailNotifications || false,
          smsNotifications: data.smsNotifications || false,
          profilePicture: data.profilePicture
        });
      } else {
        setError('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Error loading profile data');
    }
  };

  // Fetch security data
  const fetchSecurityData = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/security/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSecurityData(prev => ({
          ...prev,
          twoFactorEnabled: data.twoFactorEnabled || false,
          emailVerified: data.emailVerified || false,
          lastLogin: data.lastLogin || 'Never'
        }));
      } else {
        setError('Failed to fetch security data');
      }
    } catch (error) {
      console.error('Error fetching security data:', error);
      setError('Error loading security data');
    }
  };

  // Fetch billing data
  const fetchBillingData = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/billing/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setBillingData({
          plan: data.plan || 'Free',
          billingCycle: data.billingCycle || 'monthly',
          nextBilling: data.nextBilling || 'N/A',
          paymentMethod: data.paymentMethod || 'No payment method',
          billingAddress: data.billingAddress || 'No billing address',
          billingHistory: data.billingHistory || []
        });
      } else {
        setError('Failed to fetch billing data');
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      setError('Error loading billing data');
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchSecurityData(),
          fetchBillingData()
        ]);
      } catch (error) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAllData();
    } else {
      setError('User not logged in');
      setLoading(false);
    }
  }, [userId]);

  const handleProfileUpdate = (field: string, value: string | boolean) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityUpdate = (field: string, value: string | boolean) => {
    setSecurityData(prev => ({ ...prev, [field]: value }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!userId) return;
    
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  // Update password
  const handleUpdatePassword = async () => {
    if (!userId) return;
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (securityData.newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/password/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword
        })
      });

      if (response.ok) {
        alert('Password updated successfully!');
        setSecurityData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('Error updating password');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = () => {
    if (activeTab === 'profile') {
      handleSaveProfile();
    } else if (activeTab === 'security') {
      handleUpdatePassword();
    }
  };

  // Get user initials for profile picture
  const getUserInitials = () => {
    const first = profileData.firstName?.charAt(0)?.toUpperCase() || '';
    const last = profileData.lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-3 text-white">
          <Loader className="h-6 w-6 animate-spin" />
          <span>Loading account settings...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !userId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error}</div>
          <button 
            onClick={onNavigateHome}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const renderProfileTab = () => (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Profile Picture</h3>
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profileData.profilePicture ? (
              <img 
                src={profileData.profilePicture} 
                alt="Profile" 
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {getUserInitials()}
              </div>
            )}
            <button className="absolute -bottom-1 -right-1 p-2 bg-purple-600 hover:bg-purple-700 rounded-full text-white transition-all duration-200">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </button>
              <button className="px-4 py-2 border border-red-500 text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200">
                Remove
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              First Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => handleProfileUpdate('firstName', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Last Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => handleProfileUpdate('lastName', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => handleProfileUpdate('email', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={profileData.company}
                onChange={(e) => handleProfileUpdate('company', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter company name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => handleProfileUpdate('address', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter address"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Business Settings */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Business Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tax Rate (%)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="number"
                value={profileData.taxRate}
                onChange={(e) => handleProfileUpdate('taxRate', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Currency
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <select
                value={profileData.currency}
                onChange={(e) => handleProfileUpdate('currency', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="GBP (£)">GBP (£)</option>
                <option value="CAD ($)">CAD ($)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Invoice Format
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                value={profileData.invoiceFormat}
                onChange={(e) => handleProfileUpdate('invoiceFormat', e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="INV-YYYY-###"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Send payment reminders automatically</p>
                <p className="text-sm text-gray-400">Automatically send reminders for overdue invoices</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.paymentReminders}
                onChange={(e) => handleProfileUpdate('paymentReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8">
      {/* Security Status */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Security Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${securityData.emailVerified ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-lg`}>
                {securityData.emailVerified ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">Email Verification</p>
                <p className={`text-sm ${securityData.emailVerified ? 'text-green-400' : 'text-red-400'}`}>
                  {securityData.emailVerified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm border ${
              securityData.emailVerified 
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {securityData.emailVerified ? 'Verified' : 'Unverified'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${securityData.twoFactorEnabled ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-lg`}>
                {securityData.twoFactorEnabled ? (
                  <Check className="h-5 w-5 text-green-400" />
                ) : (
                  <X className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium">Two-Factor Authentication</p>
                <p className={`text-sm ${securityData.twoFactorEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  {securityData.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200">
              {securityData.twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">Last Login</p>
                <p className="text-sm text-gray-400">{securityData.lastLogin}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={securityData.currentPassword}
                onChange={(e) => handleSecurityUpdate('currentPassword', e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={securityData.newPassword}
                onChange={(e) => handleSecurityUpdate('newPassword', e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={securityData.confirmPassword}
                onChange={(e) => handleSecurityUpdate('confirmPassword', e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button 
            onClick={handleUpdatePassword}
            disabled={saving}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-all duration-200 font-medium flex items-center space-x-2"
          >
            {saving && <Loader className="h-4 w-4 animate-spin" />}
            <span>Update Password</span>
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive updates via email</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.emailNotifications}
                onChange={(e) => handleProfileUpdate('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-400">Receive updates via SMS</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={profileData.smsNotifications}
                onChange={(e) => handleProfileUpdate('smsNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBillingTab = () => (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Current Plan</h3>
        <div className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-white">{billingData.plan}</h4>
              <p className="text-purple-300">
                {billingData.plan === 'Free' ? 'Free Plan' : `$29/${billingData.billingCycle}`} • 
                {billingData.billingCycle === 'monthly' ? ' Billed monthly' : ' Billed annually'}
              </p>
              <p className="text-sm text-gray-400 mt-2">Next billing: {billingData.nextBilling}</p>
            </div>
            <div className="text-right">
              <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200 mb-2">
                {billingData.plan === 'Free' ? 'Upgrade Plan' : 'Change Plan'}
              </button>
              <p className="text-xs text-gray-400">Change billing cycle</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Payment Method</h3>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <CreditCard className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium">
                  {billingData.paymentMethod === 'No payment method' ? 'No Payment Method' : 'Credit Card'}
                </p>
                <p className="text-sm text-gray-400">{billingData.paymentMethod}</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
              {billingData.paymentMethod === 'No payment method' ? 'Add' : 'Update'}
            </button>
          </div>
        </div>
      </div>

      {/* Billing Address */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Billing Address</h3>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <MapPin className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium">Billing Address</p>
                <p className="text-sm text-gray-400">{billingData.billingAddress}</p>
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
              {billingData.billingAddress === 'No billing address' ? 'Add' : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-6">Billing History</h3>
        {billingData.billingHistory.length > 0 ? (
          <div className="space-y-3">
            {billingData.billingHistory.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-white font-medium">{item.date}</div>
                  <div className="text-gray-400">{item.invoice}</div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-white font-medium">{item.amount}</div>
                  <span className={`px-2 py-1 rounded-full text-xs border ${
                    item.status === 'Paid' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : item.status === 'Pending'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }`}>
                    {item.status}
                  </span>
                  <button className="text-purple-400 hover:text-purple-300 transition-colors duration-200">
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No billing history available</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <button 
            onClick={onNavigateHome}
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
            
            <button
              onClick={onNavigateToInvoices}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              <FileText className="h-5 w-5" />
              <span>My Invoices</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 bg-purple-600 text-white shadow-lg">
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
              <div className="flex items-center space-x-2 text-sm text-gray-400 mb-1">
                <span>Home</span>
                <ChevronRight className="h-4 w-4" />
                <span>Account Settings</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-purple-400 capitalize">{activeTab}</span>
              </div>
              <h1 className="text-2xl font-bold text-white">Account Settings</h1>
              <p className="text-gray-400">Manage your account preferences and billing information</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700 rounded-lg">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">
                  {profileData.firstName && profileData.lastName 
                    ? `${profileData.firstName} ${profileData.lastName}`
                    : profileData.email || 'User'
                  }
                </span>
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

        {/* Settings Content */}
        <main className="flex-1 p-6 overflow-auto">
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 mb-6">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-6 py-4 font-medium transition-all duration-200 ${
                  activeTab === 'profile'
                    ? 'text-white bg-purple-600 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 font-medium transition-all duration-200 ${
                  activeTab === 'security'
                    ? 'text-white bg-purple-600 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('billing')}
                className={`px-6 py-4 font-medium transition-all duration-200 ${
                  activeTab === 'billing'
                    ? 'text-white bg-purple-600 border-b-2 border-purple-500'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Billing
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'billing' && renderBillingTab()}

          {/* Save Changes Button */}
          <div className="mt-8 flex items-center justify-between bg-gray-800 rounded-xl border border-gray-700 p-6">
            <div className="flex items-center space-x-2 text-gray-400">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">All changes are encrypted and logged for security purposes</span>
            </div>
            <div className="flex space-x-3">
              <button className="px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-all duration-200">
                Cancel
              </button>
              <button 
                onClick={handleSaveChanges}
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center space-x-2"
              >
                {saving && <Loader className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AccountSettings;