const express = require('express');
const { body, validationResult } = require('express-validator');
const OpenAI = require('openai');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI only if API key is provided
let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// @route   POST /api/ai/planner
// @desc    AI Event Planner - Generate event suggestions
// @access  Private (User)
router.post('/planner', protect, authorize('user'), [
  body('eventType').notEmpty().withMessage('Event type is required'),
  body('budget').isNumeric().withMessage('Budget must be a number'),
  body('city').notEmpty().withMessage('City is required'),
  body('guestCount').isInt({ min: 1 }).withMessage('Guest count must be at least 1'),
  body('preferredDate').isISO8601().withMessage('Valid date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { eventType, budget, city, guestCount, preferredDate, preferences } = req.body;

    // Create prompt for OpenAI
    const prompt = `You are an expert event planner. Create a comprehensive event plan for the following details:

Event Type: ${eventType}
Budget: $${budget}
City: ${city}
Guest Count: ${guestCount}
Preferred Date: ${preferredDate}
Additional Preferences: ${preferences || 'None'}

Please provide:
1. Venue suggestions (3 options with estimated costs)
2. Vendor recommendations (catering, decoration, entertainment, etc.)
3. Catering menu suggestions
4. Decoration theme ideas
5. Detailed cost breakdown
6. Event timeline/schedule
7. Estimated total budget with contingency

Format the response as a structured JSON object with the following structure:
{
  "venues": [{"name", "type", "capacity", "estimatedCost", "description"}],
  "vendors": [{"category", "name", "estimatedCost", "description"}],
  "catering": [{"menuType", "costPerPerson", "suggestions"}],
  "decoration": [{"theme", "estimatedCost", "description"}],
  "costBreakdown": {"venue", "catering", "decoration", "vendors", "miscellaneous", "total"},
  "timeline": [{"time", "activity"}],
  "totalEstimatedBudget": number
}`;

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a professional event planner. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      
      // Parse JSON response
      let aiPlan;
      try {
        aiPlan = JSON.parse(response);
      } catch (parseError) {
        // If JSON parsing fails, return the raw text
        aiPlan = {
          rawResponse: response,
          note: "AI response could not be parsed as JSON. Raw response provided."
        };
      }

      res.json({
        success: true,
        plan: aiPlan
      });
    } catch (openaiError) {
      // If OpenAI fails, return a mock response
      const mockPlan = generateMockPlan(eventType, budget, city, guestCount, preferredDate);
      res.json({
        success: true,
        plan: mockPlan,
        note: "Using mock data due to API unavailability"
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/recommendations
// @desc    AI Event Recommendations
// @access  Private (User)
router.post('/recommendations', protect, authorize('user'), async (req, res) => {
  try {
    const { interests, location, pastEvents } = req.body;

    // Mock recommendation logic
    const recommendations = [
      {
        type: 'concert',
        reason: 'Based on your interest in music',
        confidence: 0.85
      },
      {
        type: 'workshop',
        reason: 'Similar to events you attended before',
        confidence: 0.72
      },
      {
        type: 'festival',
        reason: 'Popular in your area',
        confidence: 0.68
      }
    ];

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/chat
// @desc    AI Chat Assistant
// @access  Private (All roles)
router.post('/chat', protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant for EventVerse AI, an event management platform. Help users with event queries, ticket information, vendor questions, and payment-related questions." 
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0].message.content;

      res.json({
        success: true,
        response
      });
    } catch (openaiError) {
      // Fallback responses
      const fallbackResponses = {
        'ticket': 'For ticket information, please visit the event page or check your bookings in the dashboard.',
        'payment': 'Payments are processed securely through Razorpay. You can view your payment history in your dashboard.',
        'vendor': 'You can browse and book vendors from our Vendor Marketplace. Filter by category and location to find the best match.',
        'event': 'You can discover events by browsing our categories or using the search feature. Save events you like to your wishlist!',
        'default': 'I\'m here to help you with EventVerse AI! Ask me about events, tickets, vendors, or payments.'
      };

      const lowerMessage = message.toLowerCase();
      let fallback = fallbackResponses.default;
      
      for (const [key, value] of Object.entries(fallbackResponses)) {
        if (lowerMessage.includes(key)) {
          fallback = value;
          break;
        }
      }

      res.json({
        success: true,
        response: fallback,
        note: "Using fallback response"
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/budget-optimizer
// @desc    AI Budget Optimizer
// @access  Private (User)
router.post('/budget-optimizer', protect, authorize('user'), async (req, res) => {
  try {
    const { currentBudget, expenses, targetSavings } = req.body;

    const optimizations = [
      {
        category: 'Venue',
        suggestion: 'Consider off-peak dates for 15-20% savings',
        potentialSavings: currentBudget * 0.15
      },
      {
        category: 'Catering',
        suggestion: 'Opt for buffet style instead of plated service',
        potentialSavings: currentBudget * 0.1
      },
      {
        category: 'Decoration',
        suggestion: 'Use DIY elements combined with professional services',
        potentialSavings: currentBudget * 0.08
      },
      {
        category: 'Vendors',
        suggestion: 'Bundle services from the same provider for discounts',
        potentialSavings: currentBudget * 0.05
      }
    ];

    const totalPotentialSavings = optimizations.reduce((sum, opt) => sum + opt.potentialSavings, 0);

    res.json({
      success: true,
      optimizations,
      totalPotentialSavings,
      optimizedBudget: currentBudget - totalPotentialSavings
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/ai/crowd-prediction
// @desc    AI Crowd Prediction
// @access  Private (Organizer)
router.post('/crowd-prediction', protect, authorize('organizer'), async (req, res) => {
  try {
    const { eventId, historicalData, factors } = req.body;

    // Mock prediction logic
    const prediction = {
      expectedAttendance: Math.floor(Math.random() * 200) + 50,
      confidence: 0.78,
      factors: {
        weather: 'Favorable',
        dayOfWeek: 'Weekend - Higher attendance expected',
        seasonality: 'Peak season',
        marketing: 'Strong campaign detected'
      },
      resourceRequirements: {
        staff: Math.floor(Math.random() * 10) + 5,
        security: Math.floor(Math.random() * 5) + 2,
        parking: 'Extended hours recommended'
      },
      revenueProjection: {
        min: 5000,
        expected: 7500,
        max: 10000
      }
    };

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to generate mock plan
function generateMockPlan(eventType, budget, city, guestCount, preferredDate) {
  return {
    venues: [
      {
        name: `${city} Grand Hall`,
        type: 'Indoor Banquet',
        capacity: guestCount + 50,
        estimatedCost: budget * 0.3,
        description: 'Elegant indoor venue with modern amenities'
      },
      {
        name: `${city} Garden Resort`,
        type: 'Outdoor',
        capacity: guestCount + 30,
        estimatedCost: budget * 0.25,
        description: 'Beautiful outdoor setting with natural ambiance'
      },
      {
        name: `${city} Convention Center`,
        type: 'Convention',
        capacity: guestCount + 100,
        estimatedCost: budget * 0.35,
        description: 'Spacious venue ideal for large gatherings'
      }
    ],
    vendors: [
      {
        category: 'Catering',
        name: 'Gourmet Delights',
        estimatedCost: budget * 0.25,
        description: 'Premium catering with diverse menu options'
      },
      {
        category: 'Decoration',
        name: 'Floral Dreams',
        estimatedCost: budget * 0.15,
        description: 'Creative decoration services'
      },
      {
        category: 'Photography',
        name: 'Capture Moments',
        estimatedCost: budget * 0.1,
        description: 'Professional photography and videography'
      }
    ],
    catering: [
      {
        menuType: 'Buffet',
        costPerPerson: budget * 0.02 / guestCount,
        suggestions: ['Multi-cuisine options', 'Dessert station', 'Beverage bar']
      }
    ],
    decoration: [
      {
        theme: 'Modern Elegant',
        estimatedCost: budget * 0.15,
        description: 'Contemporary design with subtle lighting'
      }
    ],
    costBreakdown: {
      venue: budget * 0.3,
      catering: budget * 0.25,
      decoration: budget * 0.15,
      vendors: budget * 0.2,
      miscellaneous: budget * 0.1,
      total: budget
    },
    timeline: [
      { time: '09:00', activity: 'Venue setup begins' },
      { time: '12:00', activity: 'Catering arrival' },
      { time: '14:00', activity: 'Guest arrival' },
      { time: '18:00', activity: 'Main event' },
      { time: '22:00', activity: 'Event conclusion' }
    ],
    totalEstimatedBudget: budget
  };
}

module.exports = router;
