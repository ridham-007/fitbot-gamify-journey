
export interface ChallengeType {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  startDate: string;
  endDate: string;
  xpReward: number;
  joinPriceXp: number;
  firstPlaceReward?: number;
  secondPlaceReward?: number;
  thirdPlaceReward?: number;
  createdBy: string | null;
  isJoined?: boolean;
  progress?: number;
  participants?: number;
  userChallengeId?: string;
  rank?: number;
  rewardClaimed?: boolean;
  isActive?: boolean;
  isCreatedByUser?: boolean;
}

export interface UserChallengeType {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  joinedAt: string;
  completedAt: string | null;
  challenge: ChallengeType;
}
