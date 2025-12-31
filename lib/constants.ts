const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'whisperrnote.space';

export const ECOSYSTEM_APPS = [
  {
    name: 'Note',
    shortName: 'Note',
    icon: '📝',
    color: '#6366F1',
    description: 'Secure workspace & thinking',
    url: `https://app.${DOMAIN}`,
  },
  {
    name: 'Keep',
    shortName: 'Keep',
    icon: '🔐',
    color: '#8B5CF6',
    description: 'Privacy-first vault',
    url: `https://keep.${DOMAIN}`,
  },
  {
    name: 'Flow',
    shortName: 'Flow',
    icon: '🚀',
    color: '#00F0FF',
    description: 'Smart task navigation',
    url: `https://flow.${DOMAIN}`,
  },
  {
    name: 'Connect',
    shortName: 'Connect',
    icon: '💬',
    color: '#EC4899',
    description: 'Secure bridge & chat',
    active: true,
    url: `https://connect.${DOMAIN}`,
  },
  {
    name: 'Identity',
    shortName: 'ID',
    icon: '🛡️',
    color: '#00F0FF',
    description: 'SSO & Identity management',
    url: `https://accounts.${DOMAIN}`,
  },
];
