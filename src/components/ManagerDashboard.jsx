import { useState, useEffect } from 'react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent, StatusBadge, LoadingSpinner } from './ui';
import { LOCATIONS, getLocationName } from '../constants/locations';
import { subscribeToWeekSubmissions, getNextFriday, formatWeekEnding } from '../firebase/submissions';
import { formatTimestamp, formatDate } from '../utils/formatters';
import { exportToPDF } from '../utils/exportPDF';

export const ManagerDashboard = ({ user }) => {
  const [weekEnding, setWeekEnding] = useState(formatWeekEnding(getNextFriday()));
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedLocation, setExpandedLocation] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToWeekSubmissions(weekEnding, (data) => {
      setSubmissions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [weekEnding]);

  // Calculate totals
  const totals = submissions.reduce((acc, sub) => {
    return {
      openOrders: acc.openOrders + (sub.metrics?.openOrders || 0),
      candidatesInterviewed: acc.candidatesInterviewed + (sub.metrics?.candidatesInterviewed || 0),
      starts: acc.starts + (sub.metrics?.starts || 0),
      ends: acc.ends + (sub.metrics?.ends || 0),
      salesMeetings: acc.salesMeetings + (sub.metrics?.salesMeetings || 0),
      marketingComms: acc.marketingComms + (sub.metrics?.marketingComms || 0)
    };
  }, {
    openOrders: 0,
    candidatesInterviewed: 0,
    starts: 0,
    ends: 0,
    salesMeetings: 0,
    marketingComms: 0
  });

  const netChange = totals.starts - totals.ends;

  const getSubmissionForLocation = (locationCode) => {
    return submissions.find(sub => sub.locationCode === locationCode);
  };

  const handleExportPDF = () => {
    exportToPDF(weekEnding, submissions, totals);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Manager Dashboard
            </h1>
            <p className="text-gray-600">
              Logged in as: {user.email}
            </p>
          </div>
          <Button variant="primary" onClick={handleExportPDF}>
            Export to PDF
          </Button>
        </div>

        <Card className="mb-6">
          <div className="flex items-center gap-4">
            <Input
              label="Week Ending"
              type="date"
              value={weekEnding}
              onChange={(e) => setWeekEnding(e.target.value)}
              className="flex-1 max-w-xs"
            />
            <div className="text-sm text-gray-600 mt-6">
              Viewing week ending {formatDate(weekEnding)}
            </div>
          </div>
        </Card>

        {loading ? (
          <Card>
            <LoadingSpinner text="Loading submissions..." />
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="text-sm opacity-90 mb-1">Total Open Orders</div>
                <div className="text-3xl font-bold">{totals.openOrders}</div>
              </Card>
              <Card className={`bg-gradient-to-br ${netChange >= 0 ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'} text-white`}>
                <div className="text-sm opacity-90 mb-1">Net Headcount Change</div>
                <div className="text-3xl font-bold">{netChange > 0 ? '+' : ''}{netChange}</div>
                <div className="text-xs opacity-75 mt-1">{totals.starts} starts - {totals.ends} ends</div>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="text-sm opacity-90 mb-1">Candidates Interviewed</div>
                <div className="text-3xl font-bold">{totals.candidatesInterviewed}</div>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <div className="text-sm opacity-90 mb-1">Sales Activity</div>
                <div className="text-3xl font-bold">{totals.salesMeetings + totals.marketingComms}</div>
                <div className="text-xs opacity-75 mt-1">{totals.salesMeetings} meetings + {totals.marketingComms} comms</div>
              </Card>
            </div>

            {/* Location Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {LOCATIONS.map((location) => {
                const submission = getSubmissionForLocation(location.code);
                const isExpanded = expandedLocation === location.code;

                return (
                  <Card key={location.code} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <CardTitle className="text-lg">{location.name}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {location.code} • Lead: {location.lead}
                          </p>
                        </div>
                        {submission && (
                          <StatusBadge
                            status={submission.status}
                            lastUpdatedAt={submission.lastUpdatedAt}
                          />
                        )}
                      </div>
                      {submission && (
                        <p className="text-xs text-gray-500">
                          Updated {formatTimestamp(submission.lastUpdatedAt)}
                          {submission.lastUpdatedBy && ` by ${submission.lastUpdatedBy}`}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent>
                      {submission ? (
                        <>
                          {/* Metrics Summary */}
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Open Orders:</span>
                              <span className="font-semibold">{submission.metrics?.openOrders || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Candidates:</span>
                              <span className="font-semibold">{submission.metrics?.candidatesInterviewed || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Starts:</span>
                              <span className="font-semibold text-green-600">{submission.metrics?.starts || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Ends:</span>
                              <span className="font-semibold text-red-600">{submission.metrics?.ends || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                              <span className="text-gray-700 font-medium">Net Change:</span>
                              <span className={`font-bold ${
                                (submission.metrics?.starts || 0) - (submission.metrics?.ends || 0) > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}>
                                {((submission.metrics?.starts || 0) - (submission.metrics?.ends || 0)) > 0 ? '+' : ''}
                                {(submission.metrics?.starts || 0) - (submission.metrics?.ends || 0)}
                              </span>
                            </div>
                          </div>

                          {/* Sales Activity */}
                          <div className="bg-gray-50 rounded p-3 mb-4">
                            <div className="text-xs text-gray-600 mb-2">Sales Activity</div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <div className="text-gray-600">Meetings</div>
                                <div className="font-semibold">{submission.metrics?.salesMeetings || 0}</div>
                              </div>
                              <div>
                                <div className="text-gray-600">Comms</div>
                                <div className="font-semibold">{submission.metrics?.marketingComms || 0}</div>
                              </div>
                            </div>
                          </div>

                          {/* Expand/Collapse Details */}
                          <button
                            onClick={() => setExpandedLocation(isExpanded ? null : location.code)}
                            className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {isExpanded ? 'Show Less ▲' : 'Show Details ▼'}
                          </button>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="mt-4 space-y-3 pt-4 border-t border-gray-200">
                              {submission.textFields?.wins && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-700 mb-1">Wins This Week</div>
                                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{submission.textFields.wins}</div>
                                </div>
                              )}
                              {submission.textFields?.salesPlan && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-700 mb-1">Sales Plan</div>
                                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{submission.textFields.salesPlan}</div>
                                </div>
                              )}
                              {submission.textFields?.goals && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-700 mb-1">Goals/Targets</div>
                                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{submission.textFields.goals}</div>
                                </div>
                              )}
                              {submission.textFields?.challenges && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-700 mb-1">Current Challenges</div>
                                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{submission.textFields.challenges}</div>
                                </div>
                              )}
                              {submission.textFields?.notes && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-700 mb-1">Additional Notes</div>
                                  <div className="text-sm text-gray-600 whitespace-pre-wrap">{submission.textFields.notes}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <div className="text-2xl mb-2">📭</div>
                          <div className="text-sm">No data submitted yet</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
