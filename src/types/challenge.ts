
export interface ChallengeType {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: number;
  start_date: string;  // Changed from startDate
  end_date: string;    // Changed from endDate
  xp_reward: number;
  join_price_xp: number;
  first_place_reward?: number;
  second_place_reward?: number;
  third_place_reward?: number;
  created_by: string | null;
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
