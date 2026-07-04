# EventVerse

A web app for discovering, planning, booking, and managing events. It uses AI to help users plan events and Organizers to manage them easily.

## What is EventVerse?

EventVerse is an event management platform where users can find events happening around them, book tickets, and even plan their own events using AI-powered tools. Whether you're looking for a concert, a workshop, or a festival, EventVerse helps you discover events that match your interests.

For Organizers, the platform provides tools to create and promote events, track ticket sales, manage attendees, and see how their events are performing. For Admins, EventVerse offers a dashboard to approve events, manage users, and check platform-wide analytics. The whole app uses a dark theme with a modern design.

## Features

- **Browse & discover events** by category, location, or date
- **Book tickets** and get QR code tickets
- **AI Event Planner** that gives suggestions for venues, vendors, and budgets
- **AI Chat Assistant** that answers your questions about the platform
- **AI Budget Optimizer** to help you save money on events
- **AI Crowd Prediction** for Organizers to estimate attendance
- **Organizer Dashboard** to manage events and attendee check-ins
- **Admin Dashboard** to approve events, manage users, and verify vendors
- **Vendor Marketplace** to browse and hire event vendors
- **Notifications & messaging** between users and organizers
- **QR code check-in** for organizers to scan tickets at the door
- **Revenue analytics and reports** for organizers and admins

## Technologies Used

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Recharts, React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (with Mongoose)
- **Auth:** JWT (JSON Web Tokens), bcryptjs
- **AI:** OpenAI API (GPT-3.5)
- **Other:** QRCode, Multer, Axios, Lucide React Icons, React Hot Toast

## Project Structure

```
eventverse/
├── client/                  # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, Layout, etc.)
│   │   ├── pages/          # All app pages (Landing, Dashboard, Events, etc.)
│   │   ├── store/          # Auth & Theme context providers
│   │   ├── lib/            # API calls and utility functions
│   │   ├── hooks/          # Custom React hooks
│   │   ├── styles/         # Global CSS files
│   │   └── assets/         # Images and other assets
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── server/                  # Backend (Node + Express)
│   ├── models/             # Database schemas (User, Event, Booking, etc.)
│   ├── routes/             # API route handlers (auth, events, bookings, etc.)
│   ├── middleware/         # Auth middleware & error handling
│   ├── config/             # Database config
│   ├── scripts/            # Utility scripts (seed data, testing, etc.)
│   └── server.js           # Main server entry point
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Installation

### Step 1: Install Node.js

Make sure you have Node.js installed (version 18 or higher). You can download it from [nodejs.org](https://nodejs.org).

### Step 2: Install MongoDB

You need MongoDB running locally or use a cloud service like MongoDB Atlas.

### Step 3: Clone and install dependencies

```bash
# Install root dependencies
npm install

# Install both client and server dependencies
npm run install-all
```

### Step 4: Set up environment variables

Create a `.env` file in the `server` folder:

```env
MONGODB_URI=mongodb://localhost:27017/eventverse
JWT_SECRET=your_secret_key_here
OPENAI_API_KEY=your_openai_api_key  (optional - AI features work without it too)
PORT=5000
CLIENT_URL=http://localhost:5173
```

Create a `.env` file in the `client` folder:

```env
VITE_API_URL=http://localhost:5000
```

### Step 5: Run the app

```bash
# Run both frontend and backend together
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

The app will be available at `http://localhost:5173`.

## How to Use

1. **Sign up** as a User, Organizer, or choose a role later
2. **Browse events** on the homepage or search by category
3. **Click an event** to see details, date, venue, and ticket types
4. **Book tickets** by selecting a ticket type and quantity
5. **Check your bookings** in the dashboard under "My Bookings"
6. **Use the AI Planner** to get event planning suggestions (just tell it your budget, city, and guest count)
7. **Organizers** can create events from the dashboard and manage attendees
8. **Admins** can approve events and manage users from the admin panel

## User Roles

- **User (attendee):** Browses events, books tickets, saves favorite events, uses AI features, and manages their profile
- **Organizer:** Creates and manages events, tracks attendees and revenue, uses QR check-in, and connects with vendors
- **Admin:** Approves events and organizers, blocks users, verifies vendors, and views platform-wide reports

## Screenshots

*(Add screenshots here once available)*

| Page | Screenshot |
|------|------------|
| Landing Page | ![]() |
| Events Page | ![]() |
| Event Details | ![]() |
| Booking Page | ![]() |
| Organizer Dashboard | ![]() |
| Admin Dashboard | ![]() |

## Future Improvements

- Add payment gateway integration (Razorpay/Stripe)
- Build a mobile app with React Native
- Add email/SMS reminders for upcoming events
- Implement a recommendation engine based on user behavior
- Add multi-language support
- Add live streaming for virtual events

## Author

Project author information not specified.
