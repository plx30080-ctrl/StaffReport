export const LOCATIONS = [
  {
    code: '30080',
    name: 'Granite City',
    lead: 'Jae',
    team: ['Zire', 'Greg', 'Shantez']
  },
  {
    code: '81074',
    name: 'Peoria',
    lead: 'Marcia/Ronda',
    team: ['Ronda']
  },
  {
    code: '30046',
    name: 'Litchfield',
    lead: 'Kevin',
    team: ['Kevin'],
    note: 'On-Site at Dometic'
  }
];

export const getLocationByCode = (code) => {
  return LOCATIONS.find(loc => loc.code === code);
};

export const getLocationName = (code) => {
  const location = getLocationByCode(code);
  return location ? location.name : code;
};

export const SUBMISSION_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  LOCKED: 'locked'
};
