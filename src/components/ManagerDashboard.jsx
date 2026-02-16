import { useState, useEffect } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, StatusBadge, LoadingSpinner } from './ui';
import { subscribeToWeekSubmissions, getNextFriday, formatWeekEnding, getAllSubmissions } from '../firebase/submissions';
import { useConfig } from '../hooks/useConfig';
import { formatTimestamp, formatDateInput, formatDate } from '../utils/formatters';
import { exportToPDF, exportAllDataJSON } from '../utils/exportPDF';
import { getActiveLocations } from '../firebase/config-service';

export const ManagerDashboard = () => {
  const { config, loading: configLoading } = useConfig();
  const [weekEnding, setWeekEnding] = useState(formatDateInput(getNextFriday()));
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLocation, setExpandedLocation] = useState(null);

  // Subscribe to submissions for the selected week
  useEffect(() => {
    if (!weekEnding) return;

    setLoading(true);
    const unsubscribe = subscribeToWeekSubmissions(weekEnding, (data) => {
      setSubmissions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [weekEnding]);

  const handleExportPDF = () => {
    const totals = calculateTotals();
    exportToPDF(weekEnding, submissions, totals);
  };

  const handleExportJSON = async () => {
    try {
      await exportAllDataJSON(getAllSubmissions);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data');
    }
  };

  const calculateTotals = () => {
    const totals = {};

    submissions.forEach(sub => {
      Object.entries(sub.metrics || {}).forEach(([key, value]) => {
        totals[key] = (totals[key] || 0) + Number(value || 0);
      });
    });

    return totals;
  };

  const getLocationSubmission = (locationCode) => {
    return submissions.find(sub => sub.locationCode === locationCode);
  };

  const toggleExpanded = (locationCode) => {
    setExpandedLocation(expandedLocation === locationCode ? null : locationCode);
  };

  if (configLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  const totals = calculateTotals();
  const locations = getActiveLocations(config);
  const netChange = (totals.starts || 0) - (totals.ends || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Manager Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time view of all location submissions
          </p>
        </div>

        {/* Week Selector and Actions */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="w-full md:w-64">
              <Input
                label="Week Ending"
                type="date"
                value={weekEnding}
                onChange={(e) => setWeekEnding(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                onClick={handleExportPDF}
                variant="primary"
                className="flex-1 md:flex-none"
              >
                Export PDF
              </Button>
              <Button
                onClick={handleExportJSON}
                variant="secondary"
                className="flex-1 md:flex-none"
              >
                Backup JSON
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent>
              <div className="text-sm text-gray-600 mb-1">Total Open Orders</div>
              <div className="text-3xl font-bold text-gray-900">{totals.openOrders || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-sm text-gray-600 mb-1">Assignment Starts</div>
              <div className="text-3xl font-bold text-green-600">{totals.starts || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-sm text-gray-600 mb-1">Assignment Ends</div>
              <div className="text-3xl font-bold text-red-600">{totals.ends || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-sm text-gray-600 mb-1">Net Change</div>
              <div className={`text-3xl font-bold ${
                netChange > 0 ? 'text-green-600' : netChange < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                {netChange > 0 ? '+' : ''}{netChange}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-sm text-gray-600 mb-1">Candidates Interviewed</div>
              <div className="text-3xl font-bold text-blue-600">{totals.candidatesInterviewed || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-sm text-gray-600 mb-1">Sales Meetings</div>
              <div className="text-3xl font-bold text-purple-600">{totals.salesMeetings || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-sm text-gray-600 mb-1">Marketing Communications</div>
              <div className="text-3xl font-bold text-indigo-600">{totals.marketingComms || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="text-sm text-gray-600 mb-1">Locations Submitted</div>
              <div className="text-3xl font-bold text-gray-900">
                {submissions.length} / {locations.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Cards */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Location Details</h2>

          {locations.map(location => {
            const submission = getLocationSubmission(location.code);
            const isExpanded = expandedLocation === location.code;

            return (
              <Card key={location.code} className="overflow-hidden">
                <div
                  className="p-4 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(location.code)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {location.name} ({location.code})
                        </h3>
                        {submission && (
                          <StatusBadge
                            status={submission.status}
                            lastUpdatedAt={submission.lastUpdatedAt}
                          />
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <div>Lead: {location.lead}</div>
                        {location.note && <div className="text-xs italic">{location.note}</div>}
                      </div>
                    </div>

                    {submission && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Open Orders</div>
                          <div className="font-bold text-lg">{submission.metrics?.openOrders || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Starts</div>
                          <div className="font-bold text-lg text-green-600">{submission.metrics?.starts || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Ends</div>
                          <div className="font-bold text-lg text-red-600">{submission.metrics?.ends || 0}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Net</div>
                          <div className={`font-bold text-lg ${
                            ((submission.metrics?.starts || 0) - (submission.metrics?.ends || 0)) > 0
                              ? 'text-green-600'
                              : ((submission.metrics?.starts || 0) - (submission.metrics?.ends || 0)) < 0
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }`}>
                            {((submission.metrics?.starts || 0) - (submission.metrics?.ends || 0)) > 0 ? '+' : ''}
                            {(submission.metrics?.starts || 0) - (submission.metrics?.ends || 0)}
                          </div>
                        </div>
                      </div>
                    )}

                    {!submission && (
                      <div className="text-sm text-gray-500 italic">
                        No submission for this week
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && submission && (
                  <div className="border-t border-gray-200 bg-gray-50 p-4 md:p-6">
                    <div className="space-y-6">
                      {/* All Metrics */}
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {Object.entries(submission.metrics || {}).map(([key, value]) => (
                            <div key={key}>
                              <div className="text-gray-600 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="font-semibold">{value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Text Fields */}
                      {Object.entries(submission.textFields || {}).map(([key, value]) => {
                        if (!value) return null;
                        return (
                          <div key={key}>
                            <h4 className="font-semibold text-gray-900 mb-2 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </h4>
                            <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white p-3 rounded border border-gray-200">
                              {value}
                            </div>
                          </div>
                        );
                      })}

                      {/* Last Updated */}
                      <div className="text-xs text-gray-500">
                        Last updated {formatTimestamp(submission.lastUpdatedAt)} by {submission.lastUpdatedBy}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
