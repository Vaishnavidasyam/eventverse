import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import TopNavigation from './TopNavigation';
import AIAssistant from './AIAssistant';

const DashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-bg-main">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      <div className={`transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'
      }`}>
        <TopNavigation onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />
        
        <main className="pt-20 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      <AIAssistant />
    </div>
  );
};

export default DashboardLayout;
