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

const Dashboard = ({ user, setUser }) => {
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
    if (!jobData.title || !jobData.equipment_type || !jobData.budget) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await api.post('/jobs', {
        ...jobData,
        budget: parseFloat(jobData.budget)
      });
      toast.success('Job posted successfully!');
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
      toast.error('Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/accept`);
      toast.success('Job accepted!');
      loadJobs();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to accept job');
    }
  };

  const handleCompleteJob = async (jobId) => {
    try {
      await api.post(`/jobs/${jobId}/complete`);
      toast.success('Job marked as completed!');
      loadJobs();
    } catch (error) {
      toast.error('Failed to complete job');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-700',
      accepted: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-purple-100 text-purple-700',
      paid: 'bg-slate-100 text-slate-700'
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getUrgencyColor = (urgency) => {
    const colors = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-orange-100 text-orange-600',
      high: 'bg-red-100 text-red-600'
    };
    return colors[urgency] || 'bg-slate-100 text-slate-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-slate-500">Welcome back,</div>
                <div className="font-bold text-slate-900">{user.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="capitalize">{user.role}</Badge>
              {user.role === 'technician' && (
                <Badge className={user.verified ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                  {user.verified ? 'Verified' : 'Pending Verification'}
                </Badge>
              )}
              <Button variant="outline" onClick={handleLogout} data-testid="logout-button">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Admin Stats */}
        {user.role === 'admin' && stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8" data-testid="admin-stats-section">
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-slate-900">{stats.total_jobs}</div>
                <div className="text-sm text-slate-600 mt-1">Total Jobs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-slate-900">{stats.verified_technicians}</div>
                <div className="text-sm text-slate-600 mt-1">Verified Techs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-slate-900">${stats.total_platform_revenue.toFixed(2)}</div>
                <div className="text-sm text-slate-600 mt-1">Platform Revenue</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-slate-900">${stats.total_transaction_volume.toFixed(2)}</div>
                <div className="text-sm text-slate-600 mt-1">Transaction Volume</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {user.role === 'warehouse' ? 'My Jobs' : user.role === 'technician' ? 'Available Jobs' : 'All Jobs'}
          </h1>
          {user.role === 'warehouse' && (
            <Button 
              onClick={() => setShowJobDialog(true)}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="post-job-button"
            >
              Post New Job
            </Button>
          )}
        </div>

        {/* Jobs List */}
        <div className="grid gap-6" data-testid="jobs-list">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-slate-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-slate-600 font-medium">No jobs available</p>
                <p className="text-sm text-slate-500 mt-2">
                  {user.role === 'warehouse' ? 'Post your first job to get started' : 'Check back soon for new opportunities'}
                </p>
              </CardContent>
            </Card>
          ) : (
            jobs.map((job) => (
              <Card 
                key={job.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/jobs/${job.id}`)}
                data-testid={`job-card-${job.id}`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                      <div className="flex gap-2 mb-3">
                        <Badge className={getStatusColor(job.status)}>
                          {job.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <Badge className={getUrgencyColor(job.urgency)}>
                          {job.urgency.toUpperCase()} Priority
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-2">{job.issue_description}</p>
                      <div className="flex gap-4 text-sm text-slate-500">
                        <span>📍 {job.location}</span>
                        <span>🔧 {job.equipment_type}</span>
                        <span>💰 ${job.budget}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {user.role === 'technician' && job.status === 'open' && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptJob(job.id);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`accept-job-${job.id}`}
                        >
                          Accept Job
                        </Button>
                      )}
                      {user.role === 'technician' && job.assigned_tech_id === user.id && job.status === 'accepted' && (
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCompleteJob(job.id);
                          }}
                          className="bg-purple-600 hover:bg-purple-700"
                          data-testid={`complete-job-${job.id}`}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create Job Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-2xl" data-testid="create-job-dialog">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Post New Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Job Title *</Label>
              <Input 
                placeholder="e.g., Repair conveyor belt motor" 
                value={jobData.title}
                onChange={(e) => setJobData({...jobData, title: e.target.value})}
                data-testid="job-title-input"
              />
            </div>

            <div>
              <Label>Equipment Type *</Label>
              <Input 
                placeholder="e.g., Conveyor belt, Pallet mover, AGV" 
                value={jobData.equipment_type}
                onChange={(e) => setJobData({...jobData, equipment_type: e.target.value})}
                data-testid="equipment-type-input"
              />
            </div>

            <div>
              <Label>Issue Description</Label>
              <Textarea 
                placeholder="Describe the problem in detail..." 
                value={jobData.issue_description}
                onChange={(e) => setJobData({...jobData, issue_description: e.target.value})}
                rows={4}
                data-testid="issue-description-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location *</Label>
                <Input 
                  placeholder="Inglewood, CA" 
                  value={jobData.location}
                  onChange={(e) => setJobData({...jobData, location: e.target.value})}
                  data-testid="job-location-input"
                />
              </div>
              <div>
                <Label>Budget (USD) *</Label>
                <Input 
                  type="number" 
                  placeholder="500" 
                  value={jobData.budget}
                  onChange={(e) => setJobData({...jobData, budget: e.target.value})}
                  data-testid="job-budget-input"
                />
              </div>
            </div>

            <div>
              <Label>Urgency</Label>
              <Select value={jobData.urgency} onValueChange={(val) => setJobData({...jobData, urgency: val})}>
                <SelectTrigger data-testid="urgency-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleCreateJob}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
              data-testid="submit-job-button"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
