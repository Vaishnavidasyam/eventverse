import { motion } from 'framer-motion';
import { Settings, ShieldAlert, Cpu, Database, Save, HardDrive } from 'lucide-react';
import { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import toast from 'react-hot-toast';

const AdminSettingsPage = () => {
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [autoVerifyEvents, setAutoVerifyEvents] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    toast.success('Admin configurations saved!');
  };

  return (
    <div className="pt-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Platform Settings</h1>
          <p className="text-gray-400">Manage global system parameters and platform behaviors</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Global Settings */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5 text-purple-400" />
              General Configuration
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Allow User Registrations</p>
                  <p className="text-sm text-gray-400">Turn off to temporarily block new account sign ups</p>
                </div>
                <input
                  type="checkbox"
                  checked={allowRegistration}
                  onChange={(e) => setAllowRegistration(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-purple-500 h-5 w-5 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Auto-Verify Events</p>
                  <p className="text-sm text-gray-400">Skip manual approval process for trusted organizers</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoVerifyEvents}
                  onChange={(e) => setAutoVerifyEvents(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-purple-500 h-5 w-5 cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* System Control */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-400" />
              Emergency & Maintenance
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Maintenance Mode</p>
                  <p className="text-sm text-gray-400">Put the platform under maintenance (blocks frontend for non-admins)</p>
                </div>
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-purple-500 focus:ring-purple-500 h-5 w-5 cursor-pointer"
                />
              </div>
            </div>
          </Card>

          {/* Diagnostics */}
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Cpu className="h-5 w-5 text-green-400" />
              System Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl flex items-center gap-3">
                <Database className="h-5 w-5 text-indigo-400" />
                <div>
                  <p className="text-xs text-gray-400">Database</p>
                  <p className="text-sm font-bold text-green-400">Connected</p>
                </div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl flex items-center gap-3">
                <Cpu className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-xs text-gray-400">API Gateway</p>
                  <p className="text-sm font-bold text-green-400">Healthy</p>
                </div>
              </div>
              <div className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl flex items-center gap-3">
                <HardDrive className="h-5 w-5 text-green-400" />
                <div>
                  <p className="text-xs text-gray-400">Storage Usage</p>
                  <p className="text-sm font-bold text-white">4.2% of 50GB</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSave} icon={Save}>
              Save Config
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
