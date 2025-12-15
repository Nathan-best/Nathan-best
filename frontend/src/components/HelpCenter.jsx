import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';

const HelpCenter = ({ isOpen, onClose, userRole }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const warehouseFAQ = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I post my first repair job?",
          a: "Click 'REQUEST REPAIR' button, fill in equipment type, issue description, upload photos/error codes, select urgency, and submit. You'll get matched with a technician within minutes!"
        },
        {
          q: "What information should I include in my job posting?",
          a: "Include: Robot type (AMR, conveyor, etc.), error codes, symptoms, when it started, photos/videos, and urgency level. More details = better matches!"
        },
        {
          q: "How quickly will I get help?",
          a: "Standard jobs: Next-day. Emergency: 2-4 hours. Our AI matches you instantly, and technicians respond within 15-30 minutes."
        }
      ]
    },
    {
      category: "Pricing & Payments",
      questions: [
        {
          q: "How much does it cost?",
          a: "You set the budget based on your needs. Platform fee is 10-25% depending on urgency. Emergency jobs have a $50 surcharge. Transparent pricing, no hidden fees!"
        },
        {
          q: "When do I pay?",
          a: "Only after the technician completes the work and you approve it. Review photos, confirm quality, then pay securely via Stripe."
        },
        {
          q: "What are the subscription benefits?",
          a: "Save 5-15% on repairs, get free diagnostics ($59 value), priority matching, no emergency fees, and preventive visits. Plans start at $199/month."
        }
      ]
    },
    {
      category: "During Repairs",
      questions: [
        {
          q: "Can I communicate with the technician?",
          a: "Yes! Use in-app chat or voice notes. Track their location in real-time and get ETA updates automatically."
        },
        {
          q: "What if I'm not satisfied with the repair?",
          a: "Don't approve payment yet! Contact our support team immediately. We'll mediate and ensure quality work or find a replacement technician."
        },
        {
          q: "How do I track job status?",
          a: "Dashboard shows all jobs with status badges: OPEN (searching), ACCEPTED (en route), IN PROGRESS (working), COMPLETED (ready for payment), PAID (done!)."
        }
      ]
    }
  ];

  const technicianFAQ = [
    {
      category: "Getting Jobs",
      questions: [
        {
          q: "How do I find jobs?",
          a: "Toggle 'Online' on your dashboard. You'll see available jobs filtered by your location and specializations. Jobs show payout, urgency, and equipment type."
        },
        {
          q: "How are jobs assigned?",
          a: "AI matches based on: proximity, specialization, rating, and availability. Higher-rated techs get priority. Respond fast to beat competition!"
        },
        {
          q: "Can I decline a job?",
          a: "Yes, but frequent declines hurt your match score. Only accept jobs you can complete within the timeframe."
        }
      ]
    },
    {
      category: "Earnings",
      questions: [
        {
          q: "How much do I earn per job?",
          a: "You keep 85-90% of the job value! Platform takes 10-25% depending on urgency. Emergency jobs pay more. Average job = $500, you earn ~$425."
        },
        {
          q: "When do I get paid?",
          a: "Payments process within 2-3 business days after warehouse approval. Direct deposit to your linked account."
        },
        {
          q: "What's the verification fee?",
          a: "One-time $49 fee covers background check and certification verification. Required before accepting jobs. Unlocks full platform access."
        }
      ]
    },
    {
      category: "Best Practices",
      questions: [
        {
          q: "How do I get 5-star reviews?",
          a: "Arrive on time, communicate clearly, upload detailed photos, explain fixes, and leave the area clean. Reviews directly impact future job offers!"
        },
        {
          q: "What should I bring to jobs?",
          a: "Basic toolkit, multimeter, diagnostic software, camera/phone for photos, and invoice/receipt paper. Warehouse may provide specific tools."
        },
        {
          q: "How do I build my reputation?",
          a: "Complete jobs on time, maintain 4.5+ rating, respond quickly to job offers, and specialize in high-demand equipment (AMRs, conveyors)."
        }
      ]
    }
  ];

  const faqData = userRole === 'warehouse' ? warehouseFAQ : technicianFAQ;

  const filteredFAQ = searchQuery 
    ? faqData.map(category => ({
        ...category,
        questions: category.questions.filter(item => 
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-graphite border-2 border-electric-blue/30">
        <DialogHeader>
          <DialogTitle className="text-3xl font-orbitron font-bold text-tech-white">
            HELP CENTER
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="my-6">
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="tech-input text-lg"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <button className="metallic-panel p-4 hover:border-electric-blue/50 transition-all">
            <div className="text-3xl mb-2">📞</div>
            <div className="text-sm font-orbitron font-bold text-tech-white">24/7 Support</div>
            <div className="text-xs text-steel-gray font-inter">(555) 123-4567</div>
          </button>
          <button className="metallic-panel p-4 hover:border-electric-blue/50 transition-all">
            <div className="text-3xl mb-2">💬</div>
            <div className="text-sm font-orbitron font-bold text-tech-white">Live Chat</div>
            <div className="text-xs text-steel-gray font-inter">Avg response: 2 min</div>
          </button>
          <button className="metallic-panel p-4 hover:border-electric-blue/50 transition-all">
            <div className="text-3xl mb-2">📧</div>
            <div className="text-sm font-orbitron font-bold text-tech-white">Email Us</div>
            <div className="text-xs text-steel-gray font-inter">support@robotix.com</div>
          </button>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-6">
          {filteredFAQ.map((category, idx) => (
            <div key={idx}>
              <h3 className="text-xl font-orbitron font-bold text-electric-blue mb-4">
                {category.category}
              </h3>
              <div className="space-y-4">
                {category.questions.map((item, qIdx) => (
                  <div key={qIdx} className="metallic-panel p-4">
                    <h4 className="font-inter font-bold text-tech-white mb-2">
                      Q: {item.q}
                    </h4>
                    <p className="text-steel-gray font-inter text-sm">
                      A: {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Emergency Notice */}
        <div className="emergency-alert mt-8">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-error-red flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-orbitron font-bold text-tech-white mb-1">EMERGENCY SUPPORT</p>
              <p className="text-sm text-steel-gray font-inter">
                Critical issue? Call (555) 911-TECH for immediate dispatch. Available 24/7/365.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HelpCenter;
