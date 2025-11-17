import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/Tooltip';
import { toast } from 'sonner';
import { api } from '../App';

const DashboardIndustrial = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState(null);
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState({
    title: '',
    equipment_type: '',
    issue_description: '',
    location: '',
    urgency: 'medium',
    budget: ''
  });

  useEffect(() => {
    loadJobs();
    if (user.role === 'admin') {
      loadStats();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      const response = await api.get('/jobs');
      setJobs(response.data);
    } catch (error) {
      toast.error('Failed to load jobs');
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load stats');
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const handleCreateJob = async () => {
    if (!jobData.title || jobData.title.length < 5) {
      toast.error('Job title must be at least 5 characters');
      return;
    }
    if (!jobData.equipment_type || jobData.equipment_type.length < 2) {
      toast.error('Equipment type is required');
      return;
    }
    if (!jobData.issue_description || jobData.issue_description.length < 10) {
      toast.error('Please provide a detailed issue description (minimum 10 characters)');
      return;
    }
    if (!jobData.location || jobData.location.length < 3) {
      toast.error('Location is required');
      return;
    }
    if (!jobData.budget || parseFloat(jobData.budget) <= 0) {
      toast.error('Please enter a valid budget amount');
      return;
    }
    if (parseFloat(jobData.budget) > 100000) {
      toast.error('Budget cannot exceed $100,000');
      return;
    }

    try {
      setLoading(true);
      await api.post('/jobs', {
        ...jobData,
        budget: parseFloat(jobData.budget)
      });
      toast.success('Job posted successfully! Technicians will be notified.');
      setShowJobDialog(false);
      setJobData({
        title: '',
        equipment_type: '',
        issue_description: '',
        location: '',
        urgency: 'medium',
        budget: ''
      });
      loadJobs();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create job. Please try again.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/accept`);
      toast.success('Job accepted! Check job details for more info.');
      loadJobs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to accept job');
    }
  };

  const handleCompleteJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/complete`);
      toast.success('Job marked as completed! Awaiting payment.');
      loadJobs();
    } catch (error) {
      toast.error('Failed to complete job');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'status-online',
      accepted: 'status-pending',
      in_progress: 'status-pending',
      completed: 'status-completed',
      paid: 'bg-steel-gray/20 text-steel-gray border-steel-gray'
    };
    return colors[status] || 'bg-steel-gray/20 text-steel-gray border-steel-gray';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-electric-blue/10 text-electric-blue border-electric-blue/30',
      medium: 'bg-neon-yellow/10 text-neon-yellow border-neon-yellow/30',
      high: 'status-urgent'
    };
    return colors[urgency] || 'bg-steel-gray/20 text-steel-gray';
  };

  return (
    <div className="min-h-screen tech-grid-bg">
      {/* Industrial Header */}
      <div className="bg-charcoal/90 border-b border-electric-blue/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-electric-blue to-blue-600 rounded-lg flex items-center justify-center relative">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <div className="absolute inset-0 bg-electric-blue/30 rounded-lg blur-lg"></div>
              </div>
              <div>
                <div className="text-xs text-steel-gray font-inter">OPERATOR</div>
                <div className="font-orbitron font-bold text-tech-white">{user.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="status-badge capitalize">{user.role}</div>
              {user.role === 'technician' && (
                <div className={`status-badge ${user.verified ? 'status-online' : 'status-urgent'}`}>
                  {user.verified ? 'VERIFIED' : 'PENDING'}
                </div>
              )}
              <button onClick={handleLogout} className="neon-outline px-6 py-2" data-testid=\"logout-button">
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Admin Stats */}
        {user.role === 'admin' && stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8 slide-in" data-testid=\"admin-stats-section">
            <div className="metallic-panel p-6">
              <div className="text-4xl font-orbitron font-bold text-electric-blue">{stats.total_jobs}</div>
              <div className="text-sm text-steel-gray mt-1 font-inter">TOTAL JOBS</div>
            </div>
            <div className="metallic-panel p-6">
              <div className="text-4xl font-orbitron font-bold text-success-green">{stats.verified_technicians}</div>
              <div className="text-sm text-steel-gray mt-1 font-inter">VERIFIED TECHS</div>
            </div>
            <div className="metallic-panel p-6">
              <div className="text-4xl font-orbitron font-bold text-neon-yellow">${stats.total_platform_revenue.toFixed(2)}</div>
              <div className="text-sm text-steel-gray mt-1 font-inter">PLATFORM REVENUE</div>
            </div>
            <div className="metallic-panel p-6">
              <div className="text-4xl font-orbitron font-bold text-tech-white">${stats.total_transaction_volume.toFixed(2)}</div>
              <div className="text-sm text-steel-gray mt-1 font-inter">TOTAL VOLUME</div>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-orbitron font-black text-tech-white">
            {user.role === 'warehouse' ? 'MY REPAIR REQUESTS' : user.role === 'technician' ? 'JOB QUEUE' : 'SYSTEM OVERVIEW'}
          </h1>
          {user.role === 'warehouse' && (
            <button 
              onClick={() => setShowJobDialog(true)}
              className="neon-button text-lg px-8\"
              data-testid=\"post-job-button\"
            >
              REQUEST REPAIR
            </button>
          )}
        </div>

        {/* Jobs List */}
        <div className="grid gap-6" data-testid=\"jobs-list">
          {jobs.length === 0 ? (
            <div className="metallic-panel p-12 text-center">
              <div className="text-steel-gray mb-4">
                <svg className="w-20 h-20 mx-auto tech-icon" fill=\"none" stroke=\"currentColor" viewBox=\"0 0 24 24">
                  <path strokeLinecap=\"round" strokeLinejoin=\"round" strokeWidth={1.5} d=\"M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <p className="text-tech-white font-orbitron font-bold text-xl mb-2">NO ACTIVE JOBS</p>
              <p className="text-steel-gray font-inter">
                {user.role === 'warehouse' ? 'Submit your first repair request to get started' : 'Check back soon for new repair opportunities'}
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <div 
                key={job.id} 
                className="tech-card p-6 cursor-pointer\"
                onClick={() => navigate(`/jobs/${job.id}`)}
                data-testid={`job-card-${job.id}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-orbitron font-bold text-tech-white">{job.title}</h3>
                      <div className={`status-badge ${getStatusColor(job.status)}`}>
                        {job.status.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className={`status-badge ${getUrgencyColor(job.urgency)}`}>
                        {job.urgency.toUpperCase()}
                      </div>
                    </div>
                    <p className="text-steel-gray mb-4 font-inter">{job.issue_description}</p>
                    <div className="flex gap-6 text-sm text-steel-gray font-inter">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill=\"none" stroke=\"currentColor" viewBox=\"0 0 24 24">
                          <path strokeLinecap=\"round" strokeLinejoin=\"round" strokeWidth={2} d=\"M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap=\"round" strokeLinejoin=\"round" strokeWidth={2} d=\"M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill=\"none" stroke=\"currentColor" viewBox=\"0 0 24 24">
                          <path strokeLinecap=\"round" strokeLinejoin=\"round" strokeWidth={2} d=\"M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap=\"round" strokeLinejoin=\"round" strokeWidth={2} d=\"M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {job.equipment_type}
                      </span>
                      <span className="flex items-center gap-2 text-neon-yellow font-bold">
                        <svg className="w-4 h-4" fill=\"none" stroke=\"currentColor" viewBox=\"0 0 24 24">
                          <path strokeLinecap=\"round" strokeLinejoin=\"round" strokeWidth={2} d=\"M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ${job.budget}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {user.role === 'technician' && job.status === 'open' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptJob(job.id);
                        }}
                        className="neon-button\"
                        data-testid={`accept-job-${job.id}`}
                      >
                        ACCEPT JOB
                      </button>
                    )}
                    {user.role === 'technician' && job.assigned_tech_id === user.id && job.status === 'accepted' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteJob(job.id);
                        }}
                        className="neon-yellow-button\"
                        data-testid={`complete-job-${job.id}`}
                      >
                        MARK COMPLETE
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Job Dialog */}
      <TooltipProvider>
        <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
          <DialogContent className="max-w-2xl bg-graphite border-2 border-electric-blue/30" data-testid=\"create-job-dialog" aria-describedby=\"create-job-description">
            <DialogHeader>
              <DialogTitle className="text-2xl font-orbitron font-bold text-tech-white">REQUEST REPAIR</DialogTitle>
              <DialogDescription id=\"create-job-description" className="text-steel-gray font-inter">
                Submit detailed information about your robotics equipment issue
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor=\"job-title" className="text-tech-white font-inter font-semibold mb-2 block">JOB TITLE * <span className="text-xs text-steel-gray font-normal">(min 5 characters)</span></Label>
                <Input 
                  id=\"job-title\"
                  placeholder=\"e.g., AMR navigation sensor malfunction" 
                  value={jobData.title}
                  onChange={(e) => setJobData({...jobData, title: e.target.value})}
                  className="tech-input\"
                  data-testid=\"job-title-input\"
                  maxLength={200}
                  aria-required=\"true\"
                />
                <p className="text-xs text-steel-gray mt-1 font-inter">{jobData.title.length}/200 characters</p>
              </div>

              <div>
                <Label htmlFor=\"equipment-type" className="text-tech-white font-inter font-semibold mb-2 block">EQUIPMENT TYPE *</Label>
                <select
                  id=\"equipment-type\"
                  value={jobData.equipment_type}
                  onChange={(e) => setJobData({...jobData, equipment_type: e.target.value})}
                  className="tech-input w-full\"
                  data-testid=\"equipment-type-input\"
                  aria-required=\"true\"
                >
                  <option value=\"">Select equipment type</option>
                  <option value=\"AMR">AMR (Autonomous Mobile Robot)</option>
                  <option value=\"Conveyor">Conveyor System</option>
                  <option value=\"Robotic Arm">Robotic Arm</option>
                  <option value=\"Pallet Mover">Pallet Mover</option>
                  <option value=\"AGV">AGV (Automated Guided Vehicle)</option>
                  <option value=\"Sorting System">Sorting System</option>
                  <option value=\"Other">Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor=\"issue-desc" className="text-tech-white font-inter font-semibold mb-2 block">ISSUE DESCRIPTION * <span className="text-xs text-steel-gray font-normal">(min 10 characters)</span></Label>
                <Textarea 
                  id=\"issue-desc\"
                  placeholder=\"Error code, symptoms, when it started, attempted fixes..." 
                  value={jobData.issue_description}
                  onChange={(e) => setJobData({...jobData, issue_description: e.target.value})}
                  className="tech-input\"
                  rows={4}
                  data-testid=\"issue-description-input\"
                  maxLength={2000}
                  aria-required=\"true\"
                />
                <p className="text-xs text-steel-gray mt-1 font-inter">{jobData.issue_description.length}/2000 characters</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor=\"job-location" className="text-tech-white font-inter font-semibold mb-2 block">LOCATION *</Label>
                  <Input 
                    id=\"job-location\"
                    placeholder=\"Inglewood, CA" 
                    value={jobData.location}
                    onChange={(e) => setJobData({...jobData, location: e.target.value})}
                    className="tech-input\"
                    data-testid=\"job-location-input\"
                    maxLength={200}
                    aria-required=\"true\"
                  />
                </div>
                <div>
                  <Label htmlFor=\"job-budget" className="text-tech-white font-inter font-semibold mb-2 block">BUDGET (USD) *</Label>
                  <Input 
                    id=\"job-budget\"
                    type=\"number" 
                    placeholder=\"500\"
                    min=\"1\"
                    max=\"100000\"
                    step=\"0.01\"
                    value={jobData.budget}
                    onChange={(e) => setJobData({...jobData, budget: e.target.value})}
                    className="tech-input\"
                    data-testid=\"job-budget-input\"
                    aria-required=\"true\"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor=\"urgency-select" className="text-tech-white font-inter font-semibold mb-2 block">URGENCY LEVEL</Label>
                <select
                  id=\"urgency-select\"
                  value={jobData.urgency}
                  onChange={(e) => setJobData({...jobData, urgency: e.target.value})}
                  className="tech-input w-full\"
                  data-testid=\"urgency-select\"
                  aria-label=\"Select urgency level\"
                >
                  <option value=\"low">LOW - Scheduled maintenance (3-5 days)</option>
                  <option value=\"medium">MEDIUM - Standard dispatch (1-2 days)</option>
                  <option value=\"high">HIGH - Emergency repair (2-4 hours)</option>
                </select>
              </div>

              <div className="metallic-panel p-4 border-electric-blue/30">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-electric-blue mt-0.5 flex-shrink-0" fill=\"none" stroke=\"currentColor" viewBox=\"0 0 24 24">
                    <path strokeLinecap=\"round" strokeLinejoin=\"round" strokeWidth={2} d=\"M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-tech-white font-inter">
                    <p className="font-bold mb-1">PLATFORM FEE: 15%</p>
                    <p className="text-steel-gray">Commission deducted from payment. Remaining 85% goes to technician.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleCreateJob}
                className="neon-button w-full text-lg\"
                disabled={loading}
                data-testid=\"submit-job-button\"
                aria-busy={loading}
              >
                {loading ? 'SUBMITTING REQUEST...' : 'SUBMIT REPAIR REQUEST'}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </div>
  );
};

export default DashboardIndustrial;
