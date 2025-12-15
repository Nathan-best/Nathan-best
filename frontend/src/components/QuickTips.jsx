import { useState, useEffect } from 'react';

const QuickTips = ({ userRole }) => {
  const [currentTip, setCurrentTip] = useState(0);
  const [showTips, setShowTips] = useState(true);

  const warehouseTips = [
    {
      icon: "💡",
      title: "Upload Photos",
      tip: "Jobs with photos get matched 3x faster! Include close-ups of error codes and damage."
    },
    {
      icon: "⚡",
      title: "Emergency Jobs",
      tip: "Need urgent help? Select 'High Urgency' for 2-4 hour response time. Emergency fee applies."
    },
    {
      icon: "💰",
      title: "Save with Subscriptions",
      tip: "Regular maintenance prevents 80% of breakdowns. Save up to 15% with monthly plans!"
    },
    {
      icon: "⭐",
      title: "Rate Technicians",
      tip: "Your reviews help maintain service quality and help other warehouses choose the best techs."
    }
  ];

  const technicianTips = [
    {
      icon: "⏱️",
      title: "Quick Response Wins",
      tip: "Accepting jobs within 5 minutes increases your match score. Get notified faster next time!"
    },
    {
      icon: "📸",
      title: "Document Everything",
      tip: "Take before/after photos. Detailed documentation = better reviews = more jobs!"
    },
    {
      icon: "💬",
      title: "Communicate Early",
      tip: "Message warehouse before arrival. Set expectations about timeline and required parts."
    },
    {
      icon: "🎯",
      title: "Specialize to Excel",
      tip: "Master 2-3 robot types deeply. Specialists earn 30% more than generalists."
    }
  ];

  const tips = userRole === 'warehouse' ? warehouseTips : technicianTips;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [tips.length]);

  // Check if user dismissed tips
  useEffect(() => {
    const dismissed = localStorage.getItem(`tips_dismissed_${userRole}`);
    if (dismissed) setShowTips(false);
  }, [userRole]);

  const handleDismiss = () => {
    localStorage.setItem(`tips_dismissed_${userRole}`, 'true');
    setShowTips(false);
  };

  if (!showTips) return null;

  const tip = tips[currentTip];

  return (
    <div className="metallic-panel p-4 mb-6 border-electric-blue/40 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-steel-gray hover:text-tech-white transition-colors"
        title="Dismiss tips"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="flex items-center gap-4">
        <div className="text-4xl">{tip.icon}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-orbitron font-bold text-electric-blue text-sm">QUICK TIP</h4>
            <span className="text-xs text-steel-gray font-inter">• {tip.title}</span>
          </div>
          <p className="text-tech-white font-inter text-sm">{tip.tip}</p>
        </div>
        
        {/* Progress dots */}
        <div className="flex gap-1">
          {tips.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentTip ? 'bg-electric-blue w-6' : 'bg-steel-gray/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickTips;
