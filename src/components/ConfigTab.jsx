import { useState, useEffect } from 'react';
import { Button, Input, TextArea, Card, CardHeader, CardTitle, CardContent, LoadingSpinner } from './ui';
import { useConfig } from '../hooks/useConfig';
import { updateConfig } from '../firebase/config-service';

export const ConfigTab = ({ user }) => {
  const { config: initialConfig, loading } = useConfig();
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('locations');

  useEffect(() => {
    if (initialConfig) {
      setConfig(JSON.parse(JSON.stringify(initialConfig))); // Deep copy
    }
  }, [initialConfig]);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      await updateConfig(config, user);
      setMessage({ type: 'success', text: 'Configuration saved successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  // Location management
  const addLocation = () => {
    const newLocation = {
      code: '',
      name: '',
      lead: '',
      team: [],
      enabled: true
    };
    setConfig(prev => ({
      ...prev,
      locations: [...(prev.locations || []), newLocation]
    }));
  };

  const updateLocation = (index, field, value) => {
    setConfig(prev => {
      const locations = [...prev.locations];
      if (field === 'team') {
        locations[index][field] = value.split(',').map(s => s.trim()).filter(s => s);
      } else {
        locations[index][field] = value;
      }
      return { ...prev, locations };
    });
  };

  const toggleLocation = (index) => {
    setConfig(prev => {
      const locations = [...prev.locations];
      locations[index].enabled = !locations[index].enabled;
      return { ...prev, locations };
    });
  };

  const removeLocation = (index) => {
    if (!confirm('Are you sure you want to remove this location?')) return;
    setConfig(prev => ({
      ...prev,
      locations: prev.locations.filter((_, i) => i !== index)
    }));
  };

  // Section management
  const toggleSection = (sectionId) => {
    setConfig(prev => ({
      ...prev,
      formSections: {
        ...prev.formSections,
        [sectionId]: {
          ...prev.formSections[sectionId],
          enabled: !prev.formSections[sectionId].enabled
        }
      }
    }));
  };

  const updateSectionTitle = (sectionId, title) => {
    setConfig(prev => ({
      ...prev,
      formSections: {
        ...prev.formSections,
        [sectionId]: {
          ...prev.formSections[sectionId],
          title
        }
      }
    }));
  };

  // Field management
  const addField = (sectionId) => {
    const newField = {
      id: `custom_${Date.now()}`,
      label: '',
      type: 'text',
      placeholder: '',
      enabled: true
    };
    setConfig(prev => ({
      ...prev,
      formSections: {
        ...prev.formSections,
        [sectionId]: {
          ...prev.formSections[sectionId],
          fields: [...(prev.formSections[sectionId].fields || []), newField]
        }
      }
    }));
  };

  const updateField = (sectionId, fieldIndex, updates) => {
    setConfig(prev => {
      const fields = [...prev.formSections[sectionId].fields];
      fields[fieldIndex] = { ...fields[fieldIndex], ...updates };
      return {
        ...prev,
        formSections: {
          ...prev.formSections,
          [sectionId]: {
            ...prev.formSections[sectionId],
            fields
          }
        }
      };
    });
  };

  const toggleField = (sectionId, fieldIndex) => {
    setConfig(prev => {
      const fields = [...prev.formSections[sectionId].fields];
      fields[fieldIndex].enabled = !fields[fieldIndex].enabled;
      return {
        ...prev,
        formSections: {
          ...prev.formSections,
          [sectionId]: {
            ...prev.formSections[sectionId],
            fields
          }
        }
      };
    });
  };

  const removeField = (sectionId, fieldIndex) => {
    if (!confirm('Are you sure you want to remove this field?')) return;
    setConfig(prev => ({
      ...prev,
      formSections: {
        ...prev.formSections,
        [sectionId]: {
          ...prev.formSections[sectionId],
          fields: prev.formSections[sectionId].fields.filter((_, i) => i !== fieldIndex)
        }
      }
    }));
  };

  if (loading || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading configuration..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            System Configuration
          </h1>
          <p className="text-gray-600">
            Manage locations, form sections, and system settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4 overflow-x-auto">
            {['locations', 'sections', 'settings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Locations</h2>
              <Button onClick={addLocation} variant="primary">
                + Add Location
              </Button>
            </div>

            {config.locations?.map((location, index) => (
              <Card key={index} className={!location.enabled ? 'opacity-60' : ''}>
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-lg">
                      {location.name || 'New Location'}
                    </h3>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleLocation(index)}
                        variant={location.enabled ? 'secondary' : 'primary'}
                        className="text-sm"
                      >
                        {location.enabled ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        onClick={() => removeLocation(index)}
                        variant="danger"
                        className="text-sm"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Location Code"
                      value={location.code}
                      onChange={(e) => updateLocation(index, 'code', e.target.value)}
                      placeholder="e.g., 30080"
                    />
                    <Input
                      label="Location Name"
                      value={location.name}
                      onChange={(e) => updateLocation(index, 'name', e.target.value)}
                      placeholder="e.g., Granite City"
                    />
                    <Input
                      label="Team Lead"
                      value={location.lead}
                      onChange={(e) => updateLocation(index, 'lead', e.target.value)}
                      placeholder="e.g., Jae"
                    />
                    <Input
                      label="Team Members (comma-separated)"
                      value={location.team?.join(', ') || ''}
                      onChange={(e) => updateLocation(index, 'team', e.target.value)}
                      placeholder="e.g., Zire, Greg, Shantez"
                    />
                    <Input
                      label="Note (optional)"
                      value={location.note || ''}
                      onChange={(e) => updateLocation(index, 'note', e.target.value)}
                      placeholder="e.g., On-Site at Dometic"
                      className="md:col-span-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            {Object.entries(config.formSections || {}).map(([sectionId, section]) => (
              <Card key={sectionId} className={!section.enabled ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <Input
                      value={section.title}
                      onChange={(e) => updateSectionTitle(sectionId, e.target.value)}
                      className="max-w-md mb-0"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => toggleSection(sectionId)}
                        variant={section.enabled ? 'secondary' : 'primary'}
                      >
                        {section.enabled ? 'Disable Section' : 'Enable Section'}
                      </Button>
                      <Button
                        onClick={() => addField(sectionId)}
                        variant="primary"
                      >
                        + Add Field
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.fields?.map((field, fieldIndex) => (
                      <div
                        key={fieldIndex}
                        className={`border border-gray-200 rounded-lg p-4 ${!field.enabled ? 'opacity-60 bg-gray-50' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-medium text-gray-900">
                            {field.label || 'New Field'}
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => toggleField(sectionId, fieldIndex)}
                              variant="secondary"
                              className="text-sm"
                            >
                              {field.enabled ? 'Disable' : 'Enable'}
                            </Button>
                            <Button
                              onClick={() => removeField(sectionId, fieldIndex)}
                              variant="danger"
                              className="text-sm"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="Field ID"
                            value={field.id}
                            onChange={(e) => updateField(sectionId, fieldIndex, { id: e.target.value })}
                            placeholder="e.g., openOrders"
                            disabled={!field.id.startsWith('custom_')}
                          />
                          <Input
                            label="Label"
                            value={field.label}
                            onChange={(e) => updateField(sectionId, fieldIndex, { label: e.target.value })}
                            placeholder="e.g., Current Open Orders"
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Field Type
                            </label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(sectionId, fieldIndex, { type: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-base"
                            >
                              <option value="number">Number</option>
                              <option value="text">Text</option>
                              <option value="textarea">Textarea</option>
                            </select>
                          </div>
                          <Input
                            label="Placeholder"
                            value={field.placeholder || ''}
                            onChange={(e) => updateField(sectionId, fieldIndex, { placeholder: e.target.value })}
                            placeholder="e.g., Enter value..."
                            className="md:col-span-2"
                          />
                          {field.type === 'textarea' && (
                            <Input
                              label="Rows"
                              type="number"
                              value={field.rows || 3}
                              onChange={(e) => updateField(sectionId, fieldIndex, { rows: Number(e.target.value) })}
                              min="2"
                              max="10"
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                <Input
                  label="Auto-save Interval (milliseconds)"
                  type="number"
                  value={config.settings?.autoSaveInterval || 60000}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      autoSaveInterval: Number(e.target.value)
                    }
                  }))}
                  min="10000"
                  max="300000"
                  placeholder="60000"
                />
                <p className="text-sm text-gray-600 -mt-2">
                  Default: 60000ms (60 seconds)
                </p>

                <Input
                  label="Submission Deadline Day"
                  type="number"
                  value={config.settings?.deadlineDay || 5}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      deadlineDay: Number(e.target.value)
                    }
                  }))}
                  min="0"
                  max="6"
                  placeholder="5"
                />
                <p className="text-sm text-gray-600 -mt-2">
                  0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
                </p>

                <Input
                  label="Submission Deadline Time"
                  type="time"
                  value={config.settings?.deadlineTime || '17:00'}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    settings: {
                      ...prev.settings,
                      deadlineTime: e.target.value
                    }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        <Card className="mt-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Changes are not saved until you click "Save Configuration"
            </div>
            <Button
              onClick={handleSave}
              variant="success"
              disabled={saving}
              className="min-w-[200px]"
            >
              {saving ? 'Saving...' : 'Save Configuration'}
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
      </div>
    </div>
  );
};
