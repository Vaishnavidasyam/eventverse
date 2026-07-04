import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { User, Calendar, Shield, ArrowRight, LogIn, UserPlus } from 'lucide-react';

const RoleSelection = () => {
  const roles = [
    {
      name: 'User',
      title: 'Event Attendee',
      description: 'Browse events, book tickets, and manage your bookings',
      icon: User,
      color: 'from-purple-500 to-indigo-500',
      features: ['Discover Events', 'Book Tickets', 'Track Bookings', 'AI Event Planner'],
      loginPath: '/login?role=user',
      registerPath: '/register?role=user',
    },
    {
      name: 'Organizer',
      title: 'Event Organizer',
      description: 'Create events, manage attendees, and track revenue',
      icon: Calendar,
      color: 'from-blue-500 to-cyan-500',
      features: ['Create Events', 'Manage Attendees', 'Revenue Analytics', 'Vendor Integration'],
      loginPath: '/login?role=organizer',
      registerPath: '/register?role=organizer',
    },
    {
      name: 'Admin',
      title: 'Platform Admin',
      description: 'Full platform control, user management, and approvals',
      icon: Shield,
      color: 'from-pink-500 to-rose-500',
      features: ['User Management', 'Event Approvals', 'Platform Analytics', 'Vendor Verification'],
      loginPath: '/login?role=admin',
      registerPath: '/register?role=admin',
    },
  ];

  return (
    <div className="pt-20 min-h-screen bg-bg-main">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <img src="/logo.png" alt="EventVerse AI" className="h-10 w-auto" />
            <span className="text-4xl font-bold gradient-text">EventVerse AI</span>
          </div>
          <p className="text-text-muted text-lg">Select how you want to experience our platform</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="glass-card p-8 h-full flex flex-col hover:scale-105 transition-transform duration-300">
                {/* Icon */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${role.color} flex items-center justify-center mx-auto mb-6`}>
                  <role.icon className="h-10 w-10 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center mb-2">{role.title}</h2>
                <p className="text-text-muted text-center mb-6">{role.description}</p>

                {/* Features */}
                <ul className="space-y-2 mb-8 flex-1">
                  {role.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link
                    to={role.loginPath}
                    className="btn-primary w-full py-3 flex items-center justify-center space-x-2"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>Login</span>
                  </Link>
                  <Link
                    to={role.registerPath}
                    className="btn-secondary w-full py-3 flex items-center justify-center space-x-2"
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Register</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link
            to="/"
            className="inline-flex items-center text-secondary hover:text-primary transition-colors"
          >
            <ArrowRight className="h-4 w-4 mr-2 rotate-180" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default RoleSelection;
