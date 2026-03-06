export type MockComment = {
  id: string;
  author: string;
  body: string;
  timestamp: string;
  isFounder?: boolean;
};

export const MOCK_COMMENTS: MockComment[] = [
  {
    id: 'c1',
    author: 'sarahchen',
    body: 'Strong monetization potential. Have you looked at white-label deals with grocery apps?',
    timestamp: '2h ago',
  },
  {
    id: 'c2',
    author: 'sarahchen',
    body: 'Thanks — we’re in talks with two regional chains. Will share an update next week.',
    timestamp: '1h ago',
    isFounder: true,
  },
  {
    id: 'c3',
    author: 'mike_dev',
    body: 'Validation score makes sense. The main risk I see is retention after the first month.',
    timestamp: '50m ago',
  },
  {
    id: 'c4',
    author: 'jess_ideas',
    body: 'Difficulty feels right. Building the recommendation engine is the hard part.',
    timestamp: '45m ago',
  },
];
