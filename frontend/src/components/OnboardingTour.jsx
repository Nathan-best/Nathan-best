import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

const OnboardingTour = ({ user, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem(`onboarding_${user?.id}`);
    if (!hasCompletedOnboarding && user) {
      setShowTour(true);
    }
  }, [user]);

  const warehouseSteps = [
    {
      title: "Welcome to RobotiX Connect! 🎉",
      description: "You're all set up as a warehouse account. Let's show you how to get your robots fixed fast.",
      action: "Get Started"
    },
    {
      title: "Post Your First Job 🔧",
      description: "Click 'REQUEST REPAIR' to submit a job. Add photos, error codes, and select urgency level. Our AI will match you with the perfect technician.",
      action: "Got It"
    },
    {
      title: "Track in Real-Time 📡",
      description: "Once a technician accepts, you'll see live ETA updates and can chat directly in the app. No more phone tag!",
      action: "Awesome"
    },
    {
      title: "Pay Only After Completion ✅",
      description: "Technician completes the work and uploads photos. You review, approve, and pay securely through Stripe. Simple!",
      action: "Perfect"
    },
    {
      title: "Pro Tip: Upgrade & Save 💰",
      description: "Subscribe to a maintenance plan for discounts up to 15%, free diagnostics, and priority matching. Prevent breakdowns before they happen!",
      action: "Start Using RobotiX"
    }
  ];

  const technicianSteps = [
    {
      title: "Welcome, Technician! 👋",
      description: "You're ready to accept jobs and grow your robotics repair business. Here's how it works.",
      action: "Show Me"
    },
    {
      title: "Browse Available Jobs 📋",
      description: "See open jobs with equipment type, location, urgency, and payout. Pick jobs that match your skills and schedule.",
      action: "Next"
    },
    {
      title: "Accept & Navigate 🚗",
      description: "Accept a job to lock it in. Clock in when you arrive, follow the repair checklist, and upload completion photos.",
      action: "Clear"
    },
    {
      title: "Get Paid Fast 💵",
      description: "Once the warehouse approves your work, payment is automatically processed. You keep 85-90% of the job value!",
      action: "Sounds Good"
    },
    {
      title: "Build Your Reputation ⭐",
      description: "Great reviews = more jobs. Focus on quality work, clear communication, and timely completion.",
      action: "Let's Go!"
    }
  ];

  const steps = user?.role === 'warehouse' ? warehouseSteps : technicianSteps;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(`onboarding_${user?.id}`, 'true');
    setShowTour(false);
    if (onComplete) onComplete();
  };

  if (!showTour) return null;

  const step = steps[currentStep];

  return (
    <Dialog open={showTour} onOpenChange={() => {}}>
      <DialogContent className="max-w-lg bg-graphite border-2 border-electric-blue/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-orbitron font-bold text-tech-white">
            {step.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <p className="text-lg text-steel-gray font-inter leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex gap-2 mb-6">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-all ${
                index === currentStep 
                  ? 'bg-electric-blue' 
                  : index < currentStep 
                    ? 'bg-success-green' 
                    : 'bg-steel-gray/30'
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={handleSkip}
            className="neon-outline px-6 py-3"
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className="neon-button px-8 py-3"
          >
            {step.action}
          </button>
        </div>
        
        <p className="text-center text-xs text-steel-gray font-inter mt-4">
          Step {currentStep + 1} of {steps.length}
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;
