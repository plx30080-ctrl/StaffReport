import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';
import { format, startOfDay, addDays } from 'date-fns';

const SUBMISSIONS_COLLECTION = 'submissions';

// Get the next Friday from today
export const getNextFriday = (date = new Date()) => {
  const dayOfWeek = date.getDay();
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
  const friday = addDays(date, daysUntilFriday);
  return startOfDay(friday);
};

// Format week ending date for storage (YYYY-MM-DD)
export const formatWeekEnding = (date) => {
  return format(date, 'yyyy-MM-dd');
};

// Create submission ID
const createSubmissionId = (weekEnding, locationCode) => {
  return `${formatWeekEnding(weekEnding)}_${locationCode}`;
};

// Create or update a submission
export const saveSubmission = async (data, user) => {
  const submissionId = createSubmissionId(data.weekEnding, data.locationCode);
  const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);

  // Get existing submission for update history
  const existingDoc = await getDoc(submissionRef);
  const existing = existingDoc.exists() ? existingDoc.data() : null;

  const updateHistory = existing?.updateHistory || [];

  // Track changes
  const changes = [];
  if (existing) {
    Object.keys(data.metrics || {}).forEach(key => {
      if (existing.metrics?.[key] !== data.metrics[key]) {
        changes.push({
          timestamp: serverTimestamp(),
          field: `metrics.${key}`,
          oldValue: existing.metrics?.[key] || null,
          newValue: data.metrics[key],
          updatedBy: user.email
        });
      }
    });

    Object.keys(data.textFields || {}).forEach(key => {
      if (existing.textFields?.[key] !== data.textFields[key]) {
        changes.push({
          timestamp: serverTimestamp(),
          field: `textFields.${key}`,
          oldValue: existing.textFields?.[key] || null,
          newValue: data.textFields[key],
          updatedBy: user.email
        });
      }
    });
  }

  const submissionData = {
    location: data.location,
    locationCode: data.locationCode,
    weekEnding: data.weekEnding,
    lastUpdatedBy: user.email,
    lastUpdatedAt: serverTimestamp(),
    status: data.status || 'draft',
    metrics: data.metrics || {},
    textFields: data.textFields || {},
    updateHistory: [...updateHistory, ...changes].slice(-50) // Keep last 50 changes
  };

  await setDoc(submissionRef, submissionData, { merge: true });
  return submissionId;
};

// Get a specific submission
export const getSubmission = async (weekEnding, locationCode) => {
  const submissionId = createSubmissionId(weekEnding, locationCode);
  const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);
  const snapshot = await getDoc(submissionRef);

  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() };
  }
  return null;
};

// Get all submissions for a specific week
export const getWeekSubmissions = async (weekEnding) => {
  const weekEndingStr = formatWeekEnding(weekEnding);
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where('weekEnding', '==', weekEndingStr)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Get submissions for a location (for history view)
export const getLocationSubmissions = async (locationCode, limit = 10) => {
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where('locationCode', '==', locationCode),
    orderBy('weekEnding', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).slice(0, limit);
};

// Subscribe to real-time updates for a specific week
export const subscribeToWeekSubmissions = (weekEnding, callback) => {
  const weekEndingStr = formatWeekEnding(weekEnding);
  const q = query(
    collection(db, SUBMISSIONS_COLLECTION),
    where('weekEnding', '==', weekEndingStr)
  );

  return onSnapshot(q, (snapshot) => {
    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(submissions);
  });
};

// Subscribe to a specific submission
export const subscribeToSubmission = (weekEnding, locationCode, callback) => {
  const submissionId = createSubmissionId(weekEnding, locationCode);
  const submissionRef = doc(db, SUBMISSIONS_COLLECTION, submissionId);

  return onSnapshot(submissionRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  });
};

// Get all submissions (for export/backup)
export const getAllSubmissions = async () => {
  const snapshot = await getDocs(collection(db, SUBMISSIONS_COLLECTION));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
