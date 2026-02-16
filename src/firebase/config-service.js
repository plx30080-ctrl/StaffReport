import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

const CONFIG_DOC_ID = 'app-config';
const CONFIG_COLLECTION = 'settings';

// Default configuration
export const DEFAULT_CONFIG = {
  locations: [
    {
      code: '30080',
      name: 'Granite City',
      lead: 'Jae',
      team: ['Zire', 'Greg', 'Shantez'],
      enabled: true
    },
    {
      code: '81074',
      name: 'Peoria',
      lead: 'Marcia/Ronda',
      team: ['Ronda'],
      enabled: true
    },
    {
      code: '30046',
      name: 'Litchfield',
      lead: 'Kevin',
      team: ['Kevin'],
      note: 'On-Site at Dometic',
      enabled: true
    }
  ],
  formSections: {
    branchOperations: {
      title: 'Branch Operations',
      enabled: true,
      fields: [
        {
          id: 'openOrders',
          label: 'Current Open Orders',
          type: 'number',
          placeholder: 'e.g., 15',
          enabled: true
        },
        {
          id: 'candidatesInterviewed',
          label: 'Candidates Sent to Interviews',
          type: 'number',
          placeholder: 'Cumulative for the week',
          enabled: true
        },
        {
          id: 'starts',
          label: 'Assignment Starts',
          type: 'number',
          placeholder: 'Cumulative for the week',
          enabled: true
        },
        {
          id: 'ends',
          label: 'Assignment Ends',
          type: 'number',
          placeholder: 'Cumulative for the week',
          enabled: true
        }
      ]
    },
    sales: {
      title: 'Sales',
      enabled: true,
      fields: [
        {
          id: 'salesMeetings',
          label: 'Client Meetings / Site Visits',
          type: 'number',
          placeholder: 'Count for the week',
          enabled: true
        },
        {
          id: 'marketingComms',
          label: 'Skill Marketing Communications Sent',
          type: 'number',
          placeholder: 'Count for the week',
          enabled: true
        },
        {
          id: 'wins',
          label: 'Wins This Week',
          type: 'textarea',
          placeholder: 'New accounts, renewals, order increases, positive feedback...',
          rows: 3,
          enabled: true
        },
        {
          id: 'salesPlan',
          label: 'Sales Plan for Next Week',
          type: 'textarea',
          placeholder: 'Specific targets, prospects, meetings scheduled...',
          rows: 3,
          enabled: true
        }
      ]
    },
    updates: {
      title: 'Updates',
      enabled: true,
      fields: [
        {
          id: 'goals',
          label: 'Branch Goals/Targets',
          type: 'textarea',
          placeholder: 'Team objectives and key targets...',
          rows: 3,
          enabled: true
        },
        {
          id: 'challenges',
          label: 'Current Challenges',
          type: 'textarea',
          placeholder: 'Obstacles, concerns, areas needing support...',
          rows: 3,
          enabled: true
        },
        {
          id: 'notes',
          label: 'Additional Notes',
          type: 'textarea',
          placeholder: 'Any other relevant information...',
          rows: 2,
          enabled: true
        }
      ]
    }
  },
  settings: {
    autoSaveInterval: 60000, // 60 seconds
    deadlineDay: 5, // Friday
    deadlineTime: '17:00'
  }
};

// Get configuration
export const getConfig = async () => {
  const configRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);
  const snapshot = await getDoc(configRef);

  if (snapshot.exists()) {
    return snapshot.data();
  }

  // Initialize with default config if not exists
  await setDoc(configRef, {
    ...DEFAULT_CONFIG,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return DEFAULT_CONFIG;
};

// Update configuration
export const updateConfig = async (config, user) => {
  const configRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);

  await setDoc(configRef, {
    ...config,
    updatedAt: serverTimestamp(),
    updatedBy: user.email
  }, { merge: true });
};

// Subscribe to configuration changes
export const subscribeToConfig = (callback) => {
  const configRef = doc(db, CONFIG_COLLECTION, CONFIG_DOC_ID);

  return onSnapshot(configRef, async (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    } else {
      // Initialize if doesn't exist
      const config = await getConfig();
      callback(config);
    }
  });
};

// Helper to get active locations
export const getActiveLocations = (config) => {
  return config?.locations?.filter(loc => loc.enabled) || [];
};

// Helper to get enabled fields for a section
export const getEnabledFields = (config, sectionId) => {
  const section = config?.formSections?.[sectionId];
  if (!section || !section.enabled) return [];
  return section.fields?.filter(field => field.enabled) || [];
};

// Helper to get all enabled sections
export const getEnabledSections = (config) => {
  const sections = config?.formSections || {};
  return Object.entries(sections)
    .filter(([_, section]) => section.enabled)
    .map(([id, section]) => ({ id, ...section }));
};
