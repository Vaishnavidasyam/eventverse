import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Eye, Volume2, Save } from 'lucide-react';
import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [aiRecs, setAiRecs] = useState(true);
  const [profileVis, setProfileVis] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-text-muted">Configure your notifications, security and preferences</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Notifications */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-secondary" />
              Notification Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Email Alerts</p>
                  <p className="text-sm text-text-muted">Receive booking and event updates via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded bg-bg-card border-card-border text-secondary focus:ring-secondary h-5 w-5 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">SMS Updates</p>
                  <p className="text-sm text-text-muted">Receive emergency reminders via text messages</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="rounded bg-bg-card border-card-border text-secondary focus:ring-secondary h-5 w-5 cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Privacy & Customization */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-info" />
              Privacy & Personalization
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">AI Recommendations</p>
                  <p className="text-sm text-text-muted">Allow AI to suggest tailor-made events based on interest</p>
                </div>
                <input
                  type="checkbox"
                  checked={aiRecs}
                  onChange={(e) => setAiRecs(e.target.checked)}
                  className="rounded bg-bg-card border-card-border text-secondary focus:ring-secondary h-5 w-5 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Public Profile Visibility</p>
                  <p className="text-sm text-text-muted">Allow other attendees to view registered events on your profile</p>
                </div>
                <input
                  type="checkbox"
                  checked={profileVis}
                  onChange={(e) => setProfileVis(e.target.checked)}
                  className="rounded bg-bg-card border-card-border text-secondary focus:ring-secondary h-5 w-5 cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Security Preference
            </h2>
            <div className="space-y-4">
              <div>
                <p className="font-semibold text-white">Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-gray-400 mb-2">Enhance security by sending a verification token on every login</p>
                <Button variant="secondary" size="sm">Enable 2FA</Button>
              </div>
            </div>
          </Card>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSave} icon={Save}>
              Save Changes
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SettingsPage;
