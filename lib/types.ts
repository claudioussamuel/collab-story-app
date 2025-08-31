// Core types for Bernice storytelling platform

export interface User {
  address: string;
  username?: string;
  avatar?: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  creator: User;
  createdAt: Date;
  isComplete: boolean;
  currentChapter: number;
  maxChapters: number;
  chapters: StoryChapter[];
  tags: string[];
  totalVotes: number;
}

export interface StoryChapter {
  id: string;
  storyId: string;
  chapterNumber: number;
  content: string;
  author: User;
  votes: number;
  createdAt: Date;
  isSelected: boolean; // Whether this chapter was chosen by the community
  submissions: StorySubmission[]; // All submissions for this chapter
}

export interface StorySubmission {
  id: string;
  storyId: string;
  chapterNumber: number;
  content: string;
  author: User;
  votes: Vote[];
  totalVotes: number;
  createdAt: Date;
  isWinner: boolean;
}

export interface Vote {
  id: string;
  submissionId: string;
  voter: User;
  transactionHash: string;
  createdAt: Date;
  weight: number; // Could be used for weighted voting in the future
}

export interface VotingRound {
  id: string;
  storyId: string;
  chapterNumber: number;
  submissions: StorySubmission[];
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  winnerSubmissionId?: string;
}

// UI State types
export type StoryCreationStep = 'details' | 'preview' | 'publish';
export type ViewMode = 'browse' | 'read' | 'write' | 'vote';

export interface StoryFilters {
  genre?: string[];
  status?: 'active' | 'complete' | 'all';
  sortBy?: 'newest' | 'popular' | 'trending';
}

// Transaction types for blockchain interactions (kept for compatibility)
export interface VoteTransaction {
  submissionId: string;
  voterAddress: string;
  timestamp: number;
}

export interface StoryCreationTransaction {
  storyId: string;
  creatorAddress: string;
  title: string;
  timestamp: number;
}


