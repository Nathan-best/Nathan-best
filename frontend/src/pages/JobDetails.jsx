import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { api } from '../App';

const JobDetails = ({ user }) => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [matches, setMatches] = useState(null);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  const loadJob = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      toast.error('Failed to load job');
      navigate('/dashboard');
    }
  };

  const loadMatches = async () => {
    setLoadingMatches(true);
    try {
      const response = await api.get(`/jobs/${jobId}/matches`);
      setMatches(response.data);
      toast.success('AI matches loaded!');
    } catch (error) {
      toast.error('Failed to load matches');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      const originUrl = window.location.origin;
      const response = await api.post('/payments/checkout', {
        job_id: jobId,
        origin_url: originUrl
      });
      window.location.href = response.data.checkout_url;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Payment failed');
      setPaying(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewData.comment) {
      toast.error('Please add a comment');
      return;
    }

    try {
      const revieweeId = user.role === 'warehouse' ? job.assigned_tech_id : job.warehouse_id;
      await api.post('/reviews', {
        job_id: jobId,
        reviewee_id: revieweeId,
        rating: parseInt(reviewData.rating),
        comment: reviewData.comment
      });
      toast.success('Review submitted!');
      setShowReviewDialog(false);
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            data-testid="back-to-dashboard-button"
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Job Details */}
        <Card className="mb-8" data-testid="job-details-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-3">{job.title}</CardTitle>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(job.status)}>
                    {job.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{job.urgency.toUpperCase()} Priority</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-slate-900">${job.budget}</div>
                <div className="text-sm text-slate-500">Budget</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Issue Description</h3>
                <p className="text-slate-600">{job.issue_description || 'No description provided'}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Equipment Type</h3>
                  <p className="text-slate-600">{job.equipment_type}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Location</h3>
                  <p className="text-slate-600">{job.location}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Posted By</h3>
                <p className="text-slate-600">{job.warehouse_name}</p>
              </div>

              {job.assigned_tech_name && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Assigned Technician</h3>
                  <p className="text-slate-600">{job.assigned_tech_name}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {user.role === 'warehouse' && job.status === 'open' && (
                  <Button 
                    onClick={loadMatches}
                    disabled={loadingMatches}
                    className="bg-purple-600 hover:bg-purple-700"
                    data-testid="get-ai-matches-button"
                  >
                    {loadingMatches ? 'Loading...' : 'Get AI Matches'}
                  </Button>
                )}

                {user.role === 'warehouse' && job.status === 'completed' && (
                  <Button 
                    onClick={handlePayment}
                    disabled={paying}
                    className="bg-green-600 hover:bg-green-700"
                    data-testid="pay-now-button"
                  >
                    {paying ? 'Processing...' : `Pay $${job.budget}`}
                  </Button>
                )}

                {job.status === 'paid' && (
                  <Button 
                    onClick={() => setShowReviewDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-testid="leave-review-button"
                  >
                    Leave Review
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Matches */}
        {matches && (
          <Card data-testid="ai-matches-card">
            <CardHeader>
              <CardTitle>AI-Powered Technician Matches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">AI Recommendation</h4>
                    <p className="text-sm text-blue-700 whitespace-pre-wrap">{matches.ai_recommendation}</p>
                  </div>
                </div>
              </div>

              <h4 className="font-semibold text-slate-900 mb-3">Available Technicians</h4>
              <div className="space-y-3">
                {matches.technicians.map((tech) => (
                  <div key={tech.id} className="border rounded-lg p-4 hover:bg-slate-50" data-testid={`tech-${tech.id}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900">{tech.name}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          📍 {tech.location || 'Location not specified'}
                        </div>
                        <div className="text-sm text-slate-600">
                          🔧 {tech.specializations?.join(', ') || 'No specializations listed'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-semibold">{tech.rating.toFixed(1)}</span>
                          <span className="text-sm text-slate-500">({tech.total_reviews})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent data-testid="review-dialog">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({...reviewData, rating: star})}
                    className="text-3xl transition-colors"
                    data-testid={`star-${star}`}
                  >
                    <span className={star <= reviewData.rating ? 'text-yellow-500' : 'text-slate-300'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Comment</Label>
              <Textarea 
                placeholder="Share your experience..." 
                value={reviewData.comment}
                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                rows={4}
                data-testid="review-comment-input"
              />
            </div>

            <Button 
              onClick={handleSubmitReview}
              className="w-full bg-blue-600 hover:bg-blue-700"
              data-testid="submit-review-button"
            >
              Submit Review
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default JobDetails;
