import React, { useState } from 'react';
import { FiLock, FiSave, FiBell, FiKey, FiSettings, FiRefreshCw, FiEye, FiEyeOff } from 'react-icons/fi';
import { showSuccess, showError } from '../../../../utils/toast';
import adminAxios from '../../core/utils/adminAxios';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('password');
  const [loading, setLoading] = useState(false);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // System settings state
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    maxPostsPerDay: 10,
    maxImagesPerPost: 5,
    defaultCredits: 100,
    defaultUnlockCredits: 50,
    defaultCreateCredits: 50
  });

  // VAPID settings state
  const [vapidSettings, setVapidSettings] = useState({
    publicKey: '',
    privateKey: '',
    email: ''
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    dealUpdates: true,
    newUserAlerts: true,
    paymentAlerts: true,
    systemAlerts: true
  });

  const tabs = [
    { id: 'password', label: 'Change Password', icon: FiLock },
    { id: 'system', label: 'System Settings', icon: FiSettings },
    { id: 'vapid', label: 'VAPID Configuration', icon: FiKey },
    { id: 'notifications', label: 'Notifications', icon: FiBell }
  ];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      await adminAxios.put('/admin/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      showSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSettingsSave = async () => {
    setLoading(true);
    try {
      await adminAxios.put('/admin/system-settings', systemSettings);
      showSuccess('System settings updated successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleVapidSave = async () => {
    if (!vapidSettings.publicKey || !vapidSettings.privateKey || !vapidSettings.email) {
      showError('All VAPID fields are required');
      return;
    }

    setLoading(true);
    try {
      await adminAxios.put('/admin/vapid-settings', vapidSettings);
      showSuccess('VAPID settings updated successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update VAPID settings');
    } finally {
      setLoading(false);
    }
  };

  const generateVapidKeys = async () => {
    setLoading(true);
    try {
      const response = await adminAxios.post('/admin/generate-vapid-keys');
      setVapidSettings({
        ...vapidSettings,
        publicKey: response.data.publicKey,
        privateKey: response.data.privateKey
      });
      showSuccess('VAPID keys generated successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to generate VAPID keys');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSettingsSave = async () => {
    setLoading(true);
    try {
      await adminAxios.put('/admin/notification-settings', notificationSettings);
      showSuccess('Notification settings updated successfully');
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordTab = () => (
    <form onSubmit={handlePasswordChange} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? 'text' : 'password'}
            value={passwordData.currentPassword}
            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPasswords.current ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.new ? 'text' : 'password'}
            value={passwordData.newPassword}
            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPasswords.new ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            value={passwordData.confirmPassword}
            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            required
          />
          <button
            type="button"
            onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPasswords.confirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
        Change Password
      </button>
    </form>
  );

  const renderSystemTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Maintenance Mode</h4>
            <p className="text-sm text-gray-500">Disable access to the platform</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={systemSettings.maintenanceMode}
              onChange={(e) => setSystemSettings({ ...systemSettings, maintenanceMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">User Registration</h4>
            <p className="text-sm text-gray-500">Allow new user signups</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={systemSettings.registrationEnabled}
              onChange={(e) => setSystemSettings({ ...systemSettings, registrationEnabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Posts Per Day
          </label>
          <input
            type="number"
            value={systemSettings.maxPostsPerDay}
            onChange={(e) => setSystemSettings({ ...systemSettings, maxPostsPerDay: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Images Per Post
          </label>
          <input
            type="number"
            value={systemSettings.maxImagesPerPost}
            onChange={(e) => setSystemSettings({ ...systemSettings, maxImagesPerPost: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Credits
          </label>
          <input
            type="number"
            value={systemSettings.defaultCredits}
            onChange={(e) => setSystemSettings({ ...systemSettings, defaultCredits: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Unlock Credits
          </label>
          <input
            type="number"
            value={systemSettings.defaultUnlockCredits}
            onChange={(e) => setSystemSettings({ ...systemSettings, defaultUnlockCredits: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Create Credits
          </label>
          <input
            type="number"
            value={systemSettings.defaultCreateCredits}
            onChange={(e) => setSystemSettings({ ...systemSettings, defaultCreateCredits: parseInt(e.target.value) })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={handleSystemSettingsSave}
        disabled={loading}
        className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
        Save System Settings
      </button>
    </div>
  );

  const renderVapidTab = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-amber-800 mb-2">⚠️ Important</h4>
        <p className="text-sm text-amber-700">
          VAPID keys are used for Web Push Notifications. Changing these keys will invalidate all existing push subscriptions.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          VAPID Email (mailto:)
        </label>
        <input
          type="email"
          value={vapidSettings.email}
          onChange={(e) => setVapidSettings({ ...vapidSettings, email: e.target.value })}
          placeholder="admin@happilymart.com"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          VAPID Public Key
        </label>
        <textarea
          value={vapidSettings.publicKey}
          onChange={(e) => setVapidSettings({ ...vapidSettings, publicKey: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm"
          placeholder="Your VAPID public key..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          VAPID Private Key
        </label>
        <textarea
          value={vapidSettings.privateKey}
          onChange={(e) => setVapidSettings({ ...vapidSettings, privateKey: e.target.value })}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm"
          placeholder="Your VAPID private key..."
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={generateVapidKeys}
          disabled={loading}
          className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <FiRefreshCw className="animate-spin" /> : <FiKey />}
          Generate New Keys
        </button>
        <button
          onClick={handleVapidSave}
          disabled={loading}
          className="flex-1 bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
          Save VAPID Settings
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Email Notifications</h4>
            <p className="text-sm text-gray-500">Send email notifications to admins</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.emailNotifications}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Push Notifications</h4>
            <p className="text-sm text-gray-500">Enable browser push notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.pushNotifications}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Deal Updates</h4>
            <p className="text-sm text-gray-500">Notify on deal status changes</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.dealUpdates}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, dealUpdates: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">New User Alerts</h4>
            <p className="text-sm text-gray-500">Alert when new users register</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.newUserAlerts}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, newUserAlerts: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Payment Alerts</h4>
            <p className="text-sm text-gray-500">Notify on payment events</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.paymentAlerts}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, paymentAlerts: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">System Alerts</h4>
            <p className="text-sm text-gray-500">Critical system notifications</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationSettings.systemAlerts}
              onChange={(e) => setNotificationSettings({ ...notificationSettings, systemAlerts: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>
      </div>

      <button
        onClick={handleNotificationSettingsSave}
        disabled={loading}
        className="w-full bg-sky-600 text-white py-3 rounded-lg font-semibold hover:bg-sky-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? <FiRefreshCw className="animate-spin" /> : <FiSave />}
        Save Notification Settings
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-4">
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <FiSettings className="text-white" />
            System Settings
          </h1>
          <p className="text-sky-100 text-sm mt-1">Configure platform settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'password' && renderPasswordTab()}
          {activeTab === 'system' && renderSystemTab()}
          {activeTab === 'vapid' && renderVapidTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
