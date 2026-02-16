import { useState, useEffect, useCallback } from 'react';
import { Button, Input, TextArea, Select, Card, CardHeader, CardTitle, CardContent, StatusBadge, LoadingSpinner } from './ui';
import { saveSubmission, subscribeToSubmission, getNextFriday, formatWeekEnding } from '../firebase/submissions';
import { useAutoSave } from '../hooks/useAutoSave';
import { useConfig } from '../hooks/useConfig';
import { formatTimestamp, formatDateInput } from '../utils/formatters';
import { getActiveLocations } from '../firebase/config-service';

export const TeamMemberForm = ({ user }) => {
  const { config, loading: configLoading } = useConfig();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [weekEnding, setWeekEnding] = useState(formatDateInput(getNextFriday()));
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({});
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

  // Initialize form data structure from config
  useEffect(() => {
    if (config && Object.keys(formData).length === 0) {
      const initialData = {};
      Object.values(config.formSections || {}).forEach(section => {
        if (section.enabled) {
          section.fields?.forEach(field => {
            if (field.enabled) {
              initialData[field.id] = '';
            }
          });
        }
      });
      setFormData(initialData);
    }
  }, [config, formData]);

  // Load submission data
  useEffect(() => {
    if (!selectedLocation || !weekEnding) return;

    setLoading(true);
    const unsubscribe = subscribeToSubmission(weekEnding, selectedLocation, (data) => {
      setSubmission(data);
      if (data) {
        const loadedData = {};
        // Load metrics
        Object.keys(data.metrics || {}).forEach(key => {
          loadedData[key] = data.metrics[key] ?? '';
        });
        // Load text fields
        Object.keys(data.textFields || {}).forEach(key => {
          loadedData[key] = data.textFields[key] ?? '';
        });
        setFormData(prev => ({ ...prev, ...loadedData }));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedLocation, weekEnding]);

  // Auto-save function
  const saveFunction = useCallback(async (data) => {
    if (!selectedLocation || !weekEnding) return;

    const metrics = {};
    const textFields = {};

    // Separate metrics and text fields based on field types
    Object.values(config.formSections || {}).forEach(section => {
      if (section.enabled) {
        section.fields?.forEach(field => {
          if (field.enabled && data[field.id] !== undefined) {
            if (field.type === 'number') {
              metrics[field.id] = Number(data[field.id]) || 0;
            } else {
              textFields[field.id] = data[field.id] || '';
            }
          }
        });
      }
    });

    const location = getActiveLocations(config).find(loc => loc.code === selectedLocation);

    await saveSubmission({
      location: location?.name || selectedLocation,
      locationCode: selectedLocation,
      weekEnding,
      status: 'submitted',
      metrics,
      textFields
    }, user);
  }, [selectedLocation, weekEnding, user, config]);

  const { saving, lastSaved, error: autoSaveError, saveNow } = useAutoSave(
    formData,
    saveFunction,
    config?.settings?.autoSaveInterval || 60000
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedLocation || !weekEnding) {
      setMessage({ type: 'error', text: 'Please select a location and week ending date' });
      return;
    }

    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      await saveNow();
      setMessage({ type: 'success', text: 'Successfully submitted!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate net change for branch operations
  const netChange = (Number(formData.starts) || 0) - (Number(formData.ends) || 0);

  const locations = getActiveLocations(config);
  const locationOptions = [
    { value: '', label: 'Select Location...' },
    ...locations.map(loc => ({
      value: loc.code,
      label: `${loc.name} (${loc.code})`
    }))
  ];

  const renderField = (field) => {
    const commonProps = {
      key: field.id,
      label: field.label,
      value: formData[field.id] || '',
      onChange: (e) => handleInputChange(field.id, e.target.value),
      placeholder: field.placeholder,
      disabled: loading || submitting
    };

    if (field.type === 'number') {
      return <Input {...commonProps} type="number" min="0" />;
    } else if (field.type === 'textarea') {
      return <TextArea {...commonProps} rows={field.rows || 3} />;
    }
    return <Input {...commonProps} />;
  };

  if (configLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading configuration..." />
      </div>
    );
  }

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
        </Card>

        {loading ? (
          <Card>
            <LoadingSpinner text="Loading data..." />
          </Card>
        ) : selectedLocation && weekEnding ? (
          <>
            {/* Render dynamic sections */}
            {Object.entries(config.formSections || {}).map(([sectionId, section]) => {
              if (!section.enabled) return null;

              const enabledFields = section.fields?.filter(f => f.enabled) || [];
              if (enabledFields.length === 0) return null;

              // Check if this is branch operations (has starts/ends fields)
              const isBranchOps = enabledFields.some(f => f.id === 'starts' || f.id === 'ends');

              return (
                <Card key={sectionId} className="mb-6">
                  <CardHeader>
                    <CardTitle>{section.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Number fields in grid */}
                    {enabledFields.filter(f => f.type === 'number').length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {enabledFields
                          .filter(f => f.type === 'number')
                          .map(field => renderField(field))}
                      </div>
                    )}

                    {/* Show net change for branch operations */}
                    {isBranchOps && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">Net Headcount Change:</span>
                          <span className={`text-xl font-bold ${netChange > 0 ? 'text-green-600' : netChange < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                            {netChange > 0 ? '+' : ''}{netChange}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Text area fields */}
                    {enabledFields
                      .filter(f => f.type === 'textarea')
                      .map(field => renderField(field))}
                  </CardContent>
                </Card>
              );
            })}

            {/* Submit section */}
            <Card>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="text-sm text-gray-600">
                  {saving && <span className="text-blue-600">Saving...</span>}
                  {!saving && lastSaved && <span>Auto-saved {formatTimestamp(lastSaved)}</span>}
                  {!saving && !lastSaved && <span>Auto-save enabled</span>}
                  {autoSaveError && <span className="text-red-600">Error: {autoSaveError}</span>}
                </div>
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={saving || submitting}
                  className="w-full md:w-auto min-w-[200px]"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
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
