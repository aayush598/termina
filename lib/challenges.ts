import defaultChallenges from '../challenges/default.json';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  level: number;
  scenario: string;
  expectedCommands: string[];
  hints: string[];
  xpReward: number;
  orderIndex: number;
}

export const builtInChallenges = defaultChallenges as Challenge[];

export const getChallengeById = (id: string): Challenge | undefined =>
  builtInChallenges.find(c => c.id === id);

export const getChallengesByLevel = (level: number): Challenge[] =>
  builtInChallenges.filter(c => c.level === level);

export const getNextChallenge = (currentChallengeId: string): Challenge | undefined => {
  const current = builtInChallenges.find(c => c.id === currentChallengeId);
  if (!current) return builtInChallenges[0];

  const nextIndex = builtInChallenges.findIndex(c => c.orderIndex > current.orderIndex);
  return nextIndex >= 0 ? builtInChallenges[nextIndex] : undefined;
};

export const validateCommand = (challenge: Challenge, command: string): boolean => {
  const normalizedCommand = command.trim().toLowerCase();
  return challenge.expectedCommands.some(expected =>
    normalizedCommand === expected.toLowerCase() ||
    normalizedCommand.startsWith(expected.toLowerCase())
  );
};
