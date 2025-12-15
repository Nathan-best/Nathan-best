import { useNavigate } from 'react-router-dom';

const SolutionsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen tech-grid-bg">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-charcoal/90 backdrop-blur-md border-b border-electric-blue/20 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-blue-600 rounded-lg flex items-center justify-center relative">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              <div className="absolute inset-0 bg-electric-blue/30 rounded-lg blur-lg"></div>
            </div>
            <span className="text-2xl font-orbitron font-bold text-tech-white">RobotiX Connect</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/')}
              className="neon-outline px-6 py-2"
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/join-technician')}
              className="neon-button px-6 py-2"
            >
              Join Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-green/10 border border-success-green/30 rounded-full mb-6">
            <div className="w-2 h-2 bg-success-green rounded-full pulse-blue"></div>
            <span className="text-success-green font-inter font-semibold text-sm">REVOLUTIONIZING ROBOTICS MAINTENANCE</span>
          </div>
          <h1 className="text-7xl font-orbitron font-black text-tech-white leading-tight mb-6">
            PROBLEMS SOLVED.
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-electric-blue to-cyan-400">
              FUTURE SECURED.
            </span>
          </h1>
          <p className="text-2xl text-steel-gray mb-8 leading-relaxed font-inter max-w-4xl mx-auto">
            How RobotiX Connect transformed warehouse robotics maintenance from chaotic to streamlined—and our vision for the future.
          </p>
        </div>
      </div>

      {/* Problems Solved - Current State */}
      <div className="py-20 px-6 bg-graphite/50 border-y border-electric-blue/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">
              ✅ PROBLEMS WE'VE ALREADY SOLVED
            </h2>
            <p className="text-xl text-steel-gray font-inter">Active solutions deployed and working right now</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem 1 */}
            <div className="metallic-panel p-8 border-success-green/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-error-red/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">❌</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-error-red mb-2">PROBLEM: NO RELIABLE TECH DIRECTORY</h3>
                  <p className="text-steel-gray font-inter text-sm">Warehouses had no centralized way to find qualified robotics technicians. Phone book, Google searches, word of mouth—all unreliable.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-success-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-success-green mb-2">SOLUTION: VERIFIED TECH NETWORK</h3>
                  <p className="text-tech-white font-inter text-sm mb-3">
                    <strong>Built a curated marketplace</strong> with background-checked, verified robotics technicians. AI-powered matching connects warehouses with specialists in seconds.
                  </p>
                  <div className="space-y-2 text-sm text-steel-gray font-inter">
                    <p>• 150+ verified technicians onboarded</p>
                    <p>• Average match time: 2 minutes</p>
                    <p>• 98% first-match success rate</p>
                    <p>• Rating system ensures quality</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="metallic-panel p-8 border-success-green/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-error-red/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">❌</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-error-red mb-2">PROBLEM: SLOW OEM RESPONSE TIMES</h3>
                  <p className="text-steel-gray font-inter text-sm">Original Equipment Manufacturers take 2-5 days to respond. Every hour of downtime costs $600-$2,500.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-success-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-success-green mb-2">SOLUTION: 2-4 HOUR EMERGENCY DISPATCH</h3>
                  <p className="text-tech-white font-inter text-sm mb-3">
                    <strong>Emergency response system</strong> with dynamic pricing. High-urgency jobs get matched with available techs instantly, with guaranteed response times.
                  </p>
                  <div className="space-y-2 text-sm text-steel-gray font-inter">
                    <p>• 2-4 hour emergency response</p>
                    <p>• Same-day standard service</p>
                    <p>• Real-time ETA tracking</p>
                    <p>• 24/7 availability</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="metallic-panel p-8 border-success-green/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-error-red/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">❌</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-error-red mb-2">PROBLEM: PAYMENT UNCERTAINTY</h3>
                  <p className="text-steel-gray font-inter text-sm">Technicians chase clients for 30-60 days. Warehouses worry about paying upfront for incomplete work.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-success-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-success-green mb-2">SOLUTION: ESCROW PAYMENT SYSTEM</h3>
                  <p className="text-tech-white font-inter text-sm mb-3">
                    <strong>Stripe-integrated escrow</strong> holds funds before work starts. Warehouse pays only after approval. Tech gets paid in 2-3 days guaranteed.
                  </p>
                  <div className="space-y-2 text-sm text-steel-gray font-inter">
                    <p>• Secure Stripe payments</p>
                    <p>• 2-3 day tech payouts</p>
                    <p>• Automatic commission splits</p>
                    <p>• Zero payment disputes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 4 */}
            <div className="metallic-panel p-8 border-success-green/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-error-red/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">❌</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-error-red mb-2">PROBLEM: NO PREVENTIVE MAINTENANCE</h3>
                  <p className="text-steel-gray font-inter text-sm">Warehouses only call when robots break. Reactive maintenance costs 5x more than preventive care.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-success-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-success-green mb-2">SOLUTION: SUBSCRIPTION MAINTENANCE PLANS</h3>
                  <p className="text-tech-white font-inter text-sm mb-3">
                    <strong>Monthly maintenance subscriptions</strong> ($199-$799) with scheduled visits, discounts, and priority service. Prevents 80% of breakdowns.
                  </p>
                  <div className="space-y-2 text-sm text-steel-gray font-inter">
                    <p>• 3 plan tiers (Basic/Standard/Enterprise)</p>
                    <p>• Up to 15% repair discounts</p>
                    <p>• Quarterly health reports</p>
                    <p>• Predictive maintenance alerts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 5 */}
            <div className="metallic-panel p-8 border-success-green/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-error-red/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">❌</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-error-red mb-2">PROBLEM: TECHS UNDERPAID BY AGENCIES</h3>
                  <p className="text-steel-gray font-inter text-sm">Staffing agencies take 40-50% commission. Techs earn half what they deserve, limiting talent pool.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-success-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-success-green mb-2">SOLUTION: FAIR 85-90% PAYOUTS</h3>
                  <p className="text-tech-white font-inter text-sm mb-3">
                    <strong>Dynamic commission model</strong> (10-25% platform fee) means techs keep 75-90% of job value. More money = better talent = better service.
                  </p>
                  <div className="space-y-2 text-sm text-steel-gray font-inter">
                    <p>• Avg tech earns $5,200/month</p>
                    <p>• $425 per job (vs $250 via agencies)</p>
                    <p>• Emergency jobs pay 40% premiums</p>
                    <p>• Transparent rate structure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 6 */}
            <div className="metallic-panel p-8 border-success-green/50">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-error-red/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">❌</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-error-red mb-2">PROBLEM: NO VISIBILITY DURING REPAIRS</h3>
                  <p className="text-steel-gray font-inter text-sm">Warehouses had no idea when tech would arrive, what they're doing, or when job would finish.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-success-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">✅</span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold text-success-green mb-2">SOLUTION: REAL-TIME TRACKING & COMMUNICATION</h3>
                  <p className="text-tech-white font-inter text-sm mb-3">
                    <strong>Live tracking dashboard</strong> with GPS location, ETA countdown, job status updates, in-app chat, and photo documentation.
                  </p>
                  <div className="space-y-2 text-sm text-steel-gray font-inter">
                    <p>• GPS tech location tracking</p>
                    <p>• Live ETA updates</p>
                    <p>• In-app messaging</p>
                    <p>• Photo documentation required</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Metrics */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">
              MEASURABLE IMPACT
            </h2>
            <p className="text-xl text-steel-gray font-inter">Real results from solving real problems</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="metallic-panel p-6 text-center border-success-green/50">
              <div className="text-5xl font-orbitron font-black text-success-green mb-2">80%</div>
              <p className="text-steel-gray font-inter text-sm">Breakdowns Prevented</p>
              <p className="text-xs text-steel-gray font-inter mt-2">Via subscription maintenance</p>
            </div>
            <div className="metallic-panel p-6 text-center border-electric-blue/50">
              <div className="text-5xl font-orbitron font-black text-electric-blue mb-2">95%</div>
              <p className="text-steel-gray font-inter text-sm">Faster Response Time</p>
              <p className="text-xs text-steel-gray font-inter mt-2">2-4hrs vs 2-5 days (OEM)</p>
            </div>
            <div className="metallic-panel p-6 text-center border-neon-yellow/50">
              <div className="text-5xl font-orbitron font-black text-neon-yellow mb-2">$3.2M</div>
              <p className="text-steel-gray font-inter text-sm">Downtime Saved</p>
              <p className="text-xs text-steel-gray font-inter mt-2">Across all warehouses</p>
            </div>
            <div className="metallic-panel p-6 text-center border-success-green/50">
              <div className="text-5xl font-orbitron font-black text-success-green mb-2">3x</div>
              <p className="text-steel-gray font-inter text-sm">Tech Income Increase</p>
              <p className="text-xs text-steel-gray font-inter mt-2">vs traditional staffing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Future Problems We'll Solve */}
      <div className="py-20 px-6 bg-graphite/50 border-y border-neon-yellow/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-orbitron font-bold text-tech-white mb-4">
              🚀 FUTURE PROBLEMS WE'LL SOLVE
            </h2>
            <p className="text-xl text-steel-gray font-inter">Our roadmap for transforming the industry</p>
          </div>

          <div className="space-y-8">
            {/* Future Solution 1 */}
            <div className="metallic-panel p-8 border-neon-yellow/50">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-neon-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">🤖</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-orbitron font-bold text-neon-yellow mb-3">PREDICTIVE MAINTENANCE AI</h3>
                  <p className="text-tech-white font-inter mb-4">
                    <strong>Problem:</strong> Equipment still breaks unexpectedly despite scheduled maintenance.
                  </p>
                  <p className="text-steel-gray font-inter mb-4">
                    <strong>Solution:</strong> AI analyzes sensor data, error patterns, usage metrics, and maintenance history to predict failures 2-4 weeks before they happen. Automatic scheduling with nearest available tech.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">IMPACT</p>
                      <p className="text-tech-white text-sm">95% of breakdowns prevented</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">TIMELINE</p>
                      <p className="text-tech-white text-sm">Q2 2025 Beta Launch</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">SAVINGS</p>
                      <p className="text-tech-white text-sm">$50K+/year per warehouse</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Solution 2 */}
            <div className="metallic-panel p-8 border-electric-blue/50">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">📦</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-orbitron font-bold text-electric-blue mb-3">PARTS MARKETPLACE INTEGRATION</h3>
                  <p className="text-tech-white font-inter mb-4">
                    <strong>Problem:</strong> Repairs delayed because parts aren't available locally. Techs waste time sourcing components.
                  </p>
                  <p className="text-steel-gray font-inter mb-4">
                    <strong>Solution:</strong> Built-in parts marketplace with same-day delivery partnerships. When tech accepts job, system auto-orders required parts to job site. Techs arrive with everything needed.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">IMPACT</p>
                      <p className="text-tech-white text-sm">70% faster repairs</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">TIMELINE</p>
                      <p className="text-tech-white text-sm">Q3 2025 Launch</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">REVENUE</p>
                      <p className="text-tech-white text-sm">10% affiliate on parts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Solution 3 */}
            <div className="metallic-panel p-8 border-success-green/50">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-success-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">🎓</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-orbitron font-bold text-success-green mb-3">TECH TRAINING & CERTIFICATION</h3>
                  <p className="text-tech-white font-inter mb-4">
                    <strong>Problem:</strong> Not enough qualified robotics technicians. Training programs are expensive and slow.
                  </p>
                  <p className="text-steel-gray font-inter mb-4">
                    <strong>Solution:</strong> Online certification courses for AMRs, AGVs, conveyors, robotic arms. Partner with manufacturers. Certified techs get priority matching + 20% higher pay. Revenue from course fees + manufacturer sponsorships.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">IMPACT</p>
                      <p className="text-tech-white text-sm">3x more qualified techs</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">TIMELINE</p>
                      <p className="text-tech-white text-sm">Q4 2025 Pilot</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">REVENUE</p>
                      <p className="text-tech-white text-sm">$299-$799 per course</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Solution 4 */}
            <div className="metallic-panel p-8 border-neon-yellow/50">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-neon-yellow/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">🌐</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-orbitron font-bold text-neon-yellow mb-3">NATIONAL EXPANSION</h3>
                  <p className="text-tech-white font-inter mb-4">
                    <strong>Problem:</strong> Warehouses outside LA County have zero access to this service.
                  </p>
                  <p className="text-steel-gray font-inter mb-4">
                    <strong>Solution:</strong> Expand to top 50 US metros. White-label platform for regional competitors. Franchise model for local operators. National coverage by 2026.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">IMPACT</p>
                      <p className="text-tech-white text-sm">50 cities by 2026</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">TIMELINE</p>
                      <p className="text-tech-white text-sm">Q1 2025 Start</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">MARKET</p>
                      <p className="text-tech-white text-sm">$8.5B TAM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Solution 5 */}
            <div className="metallic-panel p-8 border-electric-blue/50">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-electric-blue/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">🔗</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-orbitron font-bold text-electric-blue mb-3">FLEET MANAGEMENT INTEGRATION</h3>
                  <p className="text-tech-white font-inter mb-4">
                    <strong>Problem:</strong> Warehouses manage 50-200 robots across multiple systems. No unified view of fleet health.
                  </p>
                  <p className="text-steel-gray font-inter mb-4">
                    <strong>Solution:</strong> API integrations with major robot manufacturers (ABB, KUKA, FANUC, etc). Dashboard shows entire fleet status, upcoming maintenance, cost analysis. Enterprise SaaS model.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">IMPACT</p>
                      <p className="text-tech-white text-sm">Single pane of glass</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">TIMELINE</p>
                      <p className="text-tech-white text-sm">Q2 2026 Beta</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">REVENUE</p>
                      <p className="text-tech-white text-sm">$499-$2,999/mo per warehouse</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Future Solution 6 */}
            <div className="metallic-panel p-8 border-success-green/50">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-success-green/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">💡</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-orbitron font-bold text-success-green mb-3">REMOTE DIAGNOSTICS & AR SUPPORT</h3>
                  <p className="text-tech-white font-inter mb-4">
                    <strong>Problem:</strong> Simple issues require full tech dispatch. Waste of time and money for basic troubleshooting.
                  </p>
                  <p className="text-steel-gray font-inter mb-4">
                    <strong>Solution:</strong> AR-powered remote diagnostics. Tech guides warehouse staff via video + AR overlays. 40% of issues solved remotely. Lower cost tier ($79 vs $129). Faster resolution.
                  </p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">IMPACT</p>
                      <p className="text-tech-white text-sm">40% issues solved remotely</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">TIMELINE</p>
                      <p className="text-tech-white text-sm">Q1 2026 Pilot</p>
                    </div>
                    <div className="bg-charcoal/50 p-4 rounded-lg">
                      <p className="text-electric-blue font-orbitron font-bold mb-1">SAVINGS</p>
                      <p className="text-tech-white text-sm">60% lower cost vs on-site</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vision Statement */}
      <div className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="metallic-panel p-12 border-electric-blue/50 text-center">
            <h2 className="text-4xl font-orbitron font-bold text-tech-white mb-6">
              OUR VISION FOR 2026
            </h2>
            <p className="text-xl text-steel-gray font-inter leading-relaxed mb-8">
              Transform robotics maintenance from a reactive, chaotic, expensive process into a <span className="text-electric-blue font-semibold">predictive, automated, affordable ecosystem</span> that maximizes uptime and minimizes costs across every warehouse in America.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-4xl font-orbitron font-black text-success-green mb-2">$100M</div>
                <p className="text-steel-gray font-inter text-sm">Annual Revenue Target</p>
              </div>
              <div>
                <div className="text-4xl font-orbitron font-black text-electric-blue mb-2">10K+</div>
                <p className="text-steel-gray font-inter text-sm">Verified Technicians</p>
              </div>
              <div>
                <div className="text-4xl font-orbitron font-black text-neon-yellow mb-2">50</div>
                <p className="text-steel-gray font-inter text-sm">US Metro Markets</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/')}
              className="neon-button text-lg px-12 py-4"
            >
              JOIN THE REVOLUTION
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 px-6 bg-charcoal border-t border-electric-blue/20">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-steel-gray font-inter">&copy; 2025 RobotiX Connect. Building the Future of Maintenance.</p>
        </div>
      </footer>
    </div>
  );
};

export default SolutionsPage;
