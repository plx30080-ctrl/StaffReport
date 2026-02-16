import { useState, useEffect, useCallback } from 'react';
import { Button, Input, TextArea, Select, Card, CardHeader, CardTitle, CardContent, StatusBadge, LoadingSpinner } from './ui';
import { LOCATIONS, getLocationName } from '../constants/locations';
import { saveSubmission, getSubmission, subscribeToSubmission, getNextFriday, formatWeekEnding, isSubmissionLocked } from '../firebase/submissions';
import { useAutoSave } from '../hooks/useAutoSave';
import { formatTimestamp, formatDateInput } from '../utils/formatters';

export const TeamMemberForm = ({ user }) => {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [weekEnding, setWeekEnding] = useState(formatDateInput(getNextFriday()));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [locked, setLocked] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    openOrders: '',
    candidatesInterviewed: '',
    starts: '',
    ends: '',
    salesMeetings: '',
    marketingComms: '',
    wins: '',
    salesPlan: '',
    goals: '',
    challenges: '',
    notes: ''
  });

  const [submission, setSubmission] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load saved location preference
  useEffect(() => {
    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      setSelectedLocation(savedLocation);
    }
  }, []);

  // Save location preference
  useEffect(() => {
    if (selectedLocation) {
      localStorage.setItem('selectedLocation', selectedLocation);
    }
  }, [selectedLocation]);

  // Check if submission is locked
  useEffect(() => {
    setLocked(isSubmissionLocked(weekEnding));
  }, [weekEnding]);

  // Load submission data
  useEffect(() => {
    if (!selectedLocation || !weekEnding) return;

    setLoading(true);
    const unsubscribe = subscribeToSubmission(weekEnding, selectedLocation, (data) => {
      setSubmission(data);
      if (data) {
        setFormData({
          openOrders: data.metrics?.openOrders ?? '',
          candidatesInterviewed: data.metrics?.candidatesInterviewed ?? '',
          starts: data.metrics?.starts ?? '',
          ends: data.metrics?.ends ?? '',
          salesMeetings: data.metrics?.salesMeetings ?? '',
          marketingComms: data.metrics?.marketingComms ?? '',
          wins: data.textFields?.wins ?? '',
          salesPlan: data.textFields?.salesPlan ?? '',
          goals: data.textFields?.goals ?? '',
          challenges: data.textFields?.challenges ?? '',
          notes: data.textFields?.notes ?? ''
        });
      } else {
        // Reset form for new submission
        setFormData({
          openOrders: '',
          candidatesInterviewed: '',
          starts: '',
          ends: '',
          salesMeetings: '',
          marketingComms: '',
          wins: '',
          salesPlan: '',
          goals: '',
          challenges: '',
          notes: ''
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedLocation, weekEnding]);

  // Auto-save function
  const saveFunction = useCallback(async (data) => {
    if (!selectedLocation || !weekEnding) return;
    if (locked) throw new Error('This submission is locked');

    await saveSubmission({
      location: getLocationName(selectedLocation),
      locationCode: selectedLocation,
      weekEnding,
      status: submission?.status || 'draft',
      metrics: {
        openOrders: Number(data.openOrders) || 0,
        candidatesInterviewed: Number(data.candidatesInterviewed) || 0,
        starts: Number(data.starts) || 0,
        ends: Number(data.ends) || 0,
        salesMeetings: Number(data.salesMeetings) || 0,
        marketingComms: Number(data.marketingComms) || 0
      },
      textFields: {
        wins: data.wins || '',
        salesPlan: data.salesPlan || '',
        goals: data.goals || '',
        challenges: data.challenges || '',
        notes: data.notes || ''
      }
    }, user);
  }, [selectedLocation, weekEnding, user, submission, locked]);

  const { saving, lastSaved, error: autoSaveError, saveNow } = useAutoSave(formData, saveFunction);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedLocation || !weekEnding) {
      setMessage({ type: 'error', text: 'Please select a location and week ending date' });
      return;
    }

    if (locked) {
      setMessage({ type: 'error', text: 'This submission is locked and cannot be edited' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await saveSubmission({
        location: getLocationName(selectedLocation),
        locationCode: selectedLocation,
        weekEnding,
        status: 'submitted',
        metrics: {
          openOrders: Number(formData.openOrders) || 0,
          candidatesInterviewed: Number(formData.candidatesInterviewed) || 0,
          starts: Number(formData.starts) || 0,
          ends: Number(formData.ends) || 0,
          salesMeetings: Number(formData.salesMeetings) || 0,
          marketingComms: Number(formData.marketingComms) || 0
        },
        textFields: {
          wins: formData.wins || '',
          salesPlan: formData.salesPlan || '',
          goals: formData.goals || '',
          challenges: formData.challenges || '',
          notes: formData.notes || ''
        }
      }, user);

      setMessage({ type: 'success', text: 'Successfully submitted!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const netChange = (Number(formData.starts) || 0) - (Number(formData.ends) || 0);

  const locationOptions = [
    { value: '', label: 'Select Location...' },
    ...LOCATIONS.map(loc => ({
      value: loc.code,
      label: `${loc.name} (${loc.code})`
    }))
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Weekly KPI Report
          </h1>
          <p className="text-gray-600">
            Logged in as: {user.email}
          </p>
        </div>

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Location"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              options={locationOptions}
              required
              disabled={loading}
            />
            <Input
              label="Week Ending (Friday)"
              type="date"
              value={weekEnding}
              onChange={(e) => setWeekEnding(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {submission && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <StatusBadge status={submission.status} lastUpdatedAt={submission.lastUpdatedAt} />
                <span className="text-gray-600">
                  Last updated {formatTimestamp(submission.lastUpdatedAt)} by {submission.lastUpdatedBy}
                </span>
              </div>
            </div>
          )}

          {locked && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg text-sm text-yellow-800">
              This submission is locked (past Monday 9 AM deadline) and cannot be edited.
            </div>
          )}
        </Card>

        {loading ? (
          <Card>
            <LoadingSpinner text="Loading data..." />
          </Card>
        ) : selectedLocation && weekEnding ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Daily Metrics</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Update these as often as needed during the week
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Current Open Orders"
                    type="number"
                    value={formData.openOrders}
                    onChange={(e) => handleInputChange('openOrders', e.target.value)}
                    min="0"
                    disabled={locked}
                    placeholder="e.g., 15"
                  />
                  <Input
                    label="Candidates Sent to Interviews"
                    type="number"
                    value={formData.candidatesInterviewed}
                    onChange={(e) => handleInputChange('candidatesInterviewed', e.target.value)}
                    min="0"
                    disabled={locked}
                    placeholder="Cumulative for the week"
                  />
                  <Input
                    label="Assignment Starts"
                    type="number"
                    value={formData.starts}
                    onChange={(e) => handleInputChange('starts', e.target.value)}
                    min="0"
                    disabled={locked}
                    placeholder="Cumulative for the week"
                  />
                  <Input
                    label="Assignment Ends"
                    type="number"
                    value={formData.ends}
                    onChange={(e) => handleInputChange('ends', e.target.value)}
                    min="0"
                    disabled={locked}
                    placeholder="Cumulative for the week"
                  />
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Net Headcount Change:</span>
                    <span className={`text-xl font-bold ${netChange > 0 ? 'text-green-600' : netChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                      {netChange > 0 ? '+' : ''}{netChange}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Weekly Wrap-Up</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Typically filled once at the end of the week
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Client Meetings / Site Visits"
                    type="number"
                    value={formData.salesMeetings}
                    onChange={(e) => handleInputChange('salesMeetings', e.target.value)}
                    min="0"
                    disabled={locked}
                    placeholder="Count for the week"
                  />
                  <Input
                    label="Skill Marketing Communications Sent"
                    type="number"
                    value={formData.marketingComms}
                    onChange={(e) => handleInputChange('marketingComms', e.target.value)}
                    min="0"
                    disabled={locked}
                    placeholder="Count for the week"
                  />
                </div>

                <TextArea
                  label="Wins This Week"
                  value={formData.wins}
                  onChange={(e) => handleInputChange('wins', e.target.value)}
                  rows={3}
                  disabled={locked}
                  placeholder="New accounts, renewals, order increases, positive feedback..."
                />

                <TextArea
                  label="Sales Plan for Next Week"
                  value={formData.salesPlan}
                  onChange={(e) => handleInputChange('salesPlan', e.target.value)}
                  rows={3}
                  disabled={locked}
                  placeholder="Specific targets, prospects, meetings scheduled..."
                />

                <TextArea
                  label="Branch Goals/Targets for Next Week"
                  value={formData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  rows={3}
                  disabled={locked}
                  placeholder="Team objectives and key targets..."
                />

                <TextArea
                  label="Current Challenges"
                  value={formData.challenges}
                  onChange={(e) => handleInputChange('challenges', e.target.value)}
                  rows={3}
                  disabled={locked}
                  placeholder="Obstacles, concerns, areas needing support..."
                />

                <TextArea
                  label="Additional Notes (Optional)"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={2}
                  disabled={locked}
                  placeholder="Any other relevant information..."
                />
              </CardContent>
            </Card>

            <Card>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-sm text-gray-600">
                  {saving && <span className="text-blue-600">Saving...</span>}
                  {!saving && lastSaved && <span>Last saved {formatTimestamp(lastSaved)}</span>}
                  {!saving && !lastSaved && <span>Auto-save enabled (every 60 seconds)</span>}
                  {autoSaveError && <span className="text-red-600">Error: {autoSaveError}</span>}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    variant="secondary"
                    onClick={saveNow}
                    disabled={saving || locked || submitting}
                    fullWidth
                  >
                    Save Progress
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                    disabled={saving || locked || submitting || submission?.status === 'submitted'}
                    fullWidth
                  >
                    {submitting ? 'Submitting...' : 'Mark as Submitted'}
                  </Button>
                </div>
              </div>

              {message.text && (
                <div className={`mt-4 p-3 rounded-lg text-sm ${
                  message.type === 'success'
                    ? 'bg-green-100 border border-green-300 text-green-800'
                    : 'bg-red-100 border border-red-300 text-red-800'
                }`}>
                  {message.text}
                </div>
              )}
            </Card>
          </>
        ) : (
          <Card>
            <div className="text-center py-8 text-gray-600">
              Please select a location and week ending date to begin
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};
