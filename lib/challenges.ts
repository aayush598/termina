// lib/challenges.ts

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

// Import all categories statically (bundled by Next.js)
import defaultChallenges from '../challenges/default.json';
import docker from '../challenges/docker.json';
import networking from '../challenges/networking.json';
import processes from '../challenges/processes.json';

// Map of all categories
export const challengeCategories: Record<string, Challenge[]> = {
  default: defaultChallenges as Challenge[],
  'docker': docker as Challenge[],
  'processes': processes as Challenge[],
  'networking': networking as Challenge[],
};

// Default export (used for backward compatibility)
export const builtInChallenges = challengeCategories.default;

// Utility to get a challenge list by category
export const getChallengesByCategory = (category: string): Challenge[] =>
  challengeCategories[category] || builtInChallenges;

// --- Existing helper functions ---
export const getChallengeById = (id: string, category: string = 'default'): Challenge | undefined =>
  getChallengesByCategory(category).find(c => c.id === id);

export const getNextChallenge = (currentChallengeId: string, category: string = 'default'): Challenge | undefined => {
  const challenges = getChallengesByCategory(category);
  const current = challenges.find(c => c.id === currentChallengeId);
  if (!current) return challenges[0];

  const nextIndex = challenges.findIndex(c => c.orderIndex > current.orderIndex);
  return nextIndex >= 0 ? challenges[nextIndex] : undefined;
};

export const validateCommand = (challenge: Challenge, command: string): boolean => {
  const normalizedCommand = command.trim().toLowerCase();
  return challenge.expectedCommands.some(expected =>
    normalizedCommand === expected.toLowerCase() ||
    normalizedCommand.startsWith(expected.toLowerCase())
  );
};
