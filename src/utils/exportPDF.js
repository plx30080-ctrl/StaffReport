import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatDate } from './formatters';
import { getLocationName } from '../constants/locations';

export const exportToPDF = (weekEnding, submissions, totals) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Weekly KPI Report', 14, 20);

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Week Ending: ${formatDate(weekEnding)}`, 14, 28);
  doc.text(`Generated: ${formatDate(new Date())}`, 14, 34);

  // Summary Section
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Summary', 14, 45);

  const summaryData = [
    ['Total Open Orders', totals.openOrders],
    ['Total Starts', totals.starts],
    ['Total Ends', totals.ends],
    ['Net Change', `${totals.starts - totals.ends > 0 ? '+' : ''}${totals.starts - totals.ends}`],
    ['Candidates Interviewed', totals.candidatesInterviewed],
    ['Sales Meetings', totals.salesMeetings],
    ['Marketing Communications', totals.marketingComms]
  ];

  doc.autoTable({
    startY: 50,
    head: [['Metric', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235] },
    margin: { left: 14, right: 14 }
  });

  let currentY = doc.lastAutoTable.finalY + 10;

  // Location Details
  submissions.forEach((submission, index) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`${submission.location} (${submission.locationCode})`, 14, currentY);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Status: ${submission.status} | Last Updated: ${new Date(submission.lastUpdatedAt?.toDate?.() || Date.now()).toLocaleString()}`, 14, currentY + 6);

    currentY += 12;

    // Metrics Table
    const metricsData = [
      ['Open Orders', submission.metrics?.openOrders || 0],
      ['Candidates Interviewed', submission.metrics?.candidatesInterviewed || 0],
      ['Starts', submission.metrics?.starts || 0],
      ['Ends', submission.metrics?.ends || 0],
      ['Net Change', (submission.metrics?.starts || 0) - (submission.metrics?.ends || 0)],
      ['Sales Meetings', submission.metrics?.salesMeetings || 0],
      ['Marketing Communications', submission.metrics?.marketingComms || 0]
    ];

    doc.autoTable({
      startY: currentY,
      body: metricsData,
      theme: 'plain',
      margin: { left: 20, right: 14 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 80 },
        1: { cellWidth: 'auto' }
      }
    });

    currentY = doc.lastAutoTable.finalY + 5;

    // Text Fields
    if (submission.textFields?.wins) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text('Wins This Week:', 20, currentY);
      currentY += 5;
      doc.setFont(undefined, 'normal');
      const winsLines = doc.splitTextToSize(submission.textFields.wins, 170);
      doc.text(winsLines, 20, currentY);
      currentY += winsLines.length * 5 + 5;
    }

    if (submission.textFields?.salesPlan) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text('Sales Plan:', 20, currentY);
      currentY += 5;
      doc.setFont(undefined, 'normal');
      const planLines = doc.splitTextToSize(submission.textFields.salesPlan, 170);
      doc.text(planLines, 20, currentY);
      currentY += planLines.length * 5 + 5;
    }

    if (submission.textFields?.challenges) {
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      doc.setFont(undefined, 'bold');
      doc.text('Challenges:', 20, currentY);
      currentY += 5;
      doc.setFont(undefined, 'normal');
      const challengesLines = doc.splitTextToSize(submission.textFields.challenges, 170);
      doc.text(challengesLines, 20, currentY);
      currentY += challengesLines.length * 5 + 10;
    }
  });

  // Save the PDF
  doc.save(`KPI_Report_${weekEnding}.pdf`);
};

export const exportAllDataJSON = async (getAllSubmissions) => {
  try {
    const allData = await getAllSubmissions();
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kpi_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};
