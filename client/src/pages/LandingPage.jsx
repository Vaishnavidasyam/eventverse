import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
  ArrowRight,
  Star,
  PartyPopper,
} from "lucide-react";
import { EVENT_CATEGORIES } from "../config/constants";
import { categoriesAPI } from "../lib/api";

const LandingPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true });
  const [categories, setCategories] = useState(EVENT_CATEGORIES);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      const apiCategories = response.data.categories || [];

      if (apiCategories.length > 0) {
        const transformedCategories = apiCategories.map((cat) => ({
          name: cat.name,
          icon: cat.icon || "📅",
          label: cat.label,
          color: cat.color || "from-purple-500 to-indigo-500",
        }));
        setCategories(transformedCategories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories(EVENT_CATEGORIES);
    }
  };

  useEffect(() => {
    if (isInView) {
      // Trigger confetti on page load
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24"],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ["#818cf8", "#c084fc", "#f472b6", "#34d399", "#fbbf24"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isInView]);
  const stats = [
    { value: "10K+", label: "Events Hosted", icon: Calendar },
    { value: "50K+", label: "Happy Users", icon: Users },
    { value: "500+", label: "Verified Vendors", icon: TrendingUp },
    { value: "100+", label: "Cities Covered", icon: MapPin },
  ];

  const featuredEvents = [
    {
      id: 1,
      title: "Summer Music Festival 2024",
      category: "concert",
      date: "2024-07-15",
      location: "Nehru Park, New Delhi",
      price: 149,
      image:
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
      rating: 4.8,
    },
    {
      id: 2,
      title: "Tech Innovation Summit",
      category: "conference",
      date: "2024-08-20",
      location: "Convention Center, Mumbai",
      price: 299,
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800",
      rating: 4.9,
    },
    {
      id: 3,
      title: "Gourmet Food Festival",
      category: "festival",
      date: "2024-09-10",
      location: "Downtown Plaza, Bangalore",
      price: 75,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
      rating: 4.7,
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-main via-bg-secondary to-bg-main">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-transparent"></div>
        </div>

        {/* Floating Cards */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 left-10 glass-card p-4 hidden lg:block"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">New Event</p>
              <p className="text-xs text-gray-400">Just added</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 right-10 glass-card p-4 hidden lg:block"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">500+ Users</p>
              <p className="text-xs text-gray-400">Joined today</p>
            </div>
          </div>
        </motion.div>

        {/* Hero Content */}
        <div
          ref={heroRef}
          className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/logo.png"
              alt="EventVerse AI"
              className="h-16 md:h-24 mx-auto mb-6"
            />
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Plan Extraordinary</span>
              <br />
              <span className="text-white">Events with AI</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto">
              Discover, organize, and manage unforgettable experiences through
              one intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/roles"
                className="btn-primary text-lg px-8 py-4 inline-flex items-center justify-center"
              >
                Start Planning
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="glass-card-light p-6">
                <stat.icon className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="text-2xl font-bold gradient-text">{stat.value}</p>
                <p className="text-sm text-text-muted">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Event Categories */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Explore Event Categories
            </h2>
            <p className="text-text-muted text-lg">
              Find the perfect event for every occasion
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/events?category=${category.name}`}
                className="group"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300 cursor-pointer"
                >
                  <div
                    className={`text-4xl mb-3 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`}
                  >
                    {category.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    {category.label}
                  </h3>
                  <p className="text-sm text-text-muted">Browse events</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent to-bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">Featured Events</h2>
            <p className="text-text-muted text-lg">
              Handpicked experiences you don't want to miss
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/events/${event.id}`}>
                  <div className="glass-card overflow-hidden group hover:scale-105 transition-transform duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 glass-card-light px-3 py-1 flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold">
                          {event.rating}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="text-sm text-secondary mb-2 capitalize">
                        {event.category}
                      </div>
                      <h3 className="font-bold text-lg mb-2 line-clamp-1">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm text-text-muted">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xl font-bold gradient-text">
                          ₹{event.price}
                        </span>
                        <span className="text-sm text-purple-400 group-hover:text-purple-300">
                          Book Now →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/events" className="btn-primary inline-flex items-center">
              View All Events
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
