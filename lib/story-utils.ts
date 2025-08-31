import { Story, StorySubmission, Vote } from './types';

// Mock data for development - replace with API/database calls
const stories: Story[] = [
  {
    id: "story_1",
    title: "The Digital Realm Chronicles",
    description: "In a world where consciousness can be uploaded to digital realms, a group of explorers discovers that reality itself might be just another layer of code.",
    creator: { address: "0x1234...5678", username: "CyberScribe" },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isComplete: false,
    currentChapter: 2,
    maxChapters: 10,
    chapters: [
      {
        id: "chapter_1_1",
        storyId: "story_1",
        chapterNumber: 1,
        content: "Maya's fingers trembled as she placed the neural interface crown on her head...",
        author: { address: "0x1234...5678", username: "CyberScribe" },
        votes: 23,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        isSelected: true,
        submissions: []
      },
      {
        id: "chapter_1_2",
        storyId: "story_1",
        chapterNumber: 2,
        content: "The digital realm stretched endlessly in all directions...",
        author: { address: "0x9876...4321", username: "QuantumDreamer" },
        votes: 31,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isSelected: true,
        submissions: []
      }
    ],
    tags: ["sci-fi", "cyberpunk", "virtual reality"],
    totalVotes: 54
  },
];

const submissions: StorySubmission[] = [];
const votes: Vote[] = [];

export class StoryManager {
  static async createStory(
    title: string,
    description: string,
    creatorAddress: string,
    maxChapters: number = 10,
    tags: string[] = []
  ): Promise<Story> {
    const story: Story = {
      id: `story_${Date.now()}`,
      title,
      description,
      creator: { address: creatorAddress },
      createdAt: new Date(),
      isComplete: false,
      currentChapter: 0,
      maxChapters,
      chapters: [],
      tags,
      totalVotes: 0,
    };

    stories.push(story);
    return story;
  }

  static async getStory(storyId: string): Promise<Story | null> {
    return stories.find(s => s.id === storyId) || null;
  }

  static async getAllStories(): Promise<Story[]> {
    return [...stories].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  static async getActiveStories(): Promise<Story[]> {
    return stories.filter(s => !s.isComplete);
  }

  static async submitChapter(
    storyId: string,
    content: string,
    authorAddress: string
  ): Promise<StorySubmission> {
    const story = await this.getStory(storyId);
    if (!story) throw new Error('Story not found');

    const chapterNumber = story.currentChapter + 1;

    // First chapter (chapter 1) is automatically accepted
    if (chapterNumber === 1) {
      const chapter = {
        id: `chapter_${storyId}_${chapterNumber}`,
        storyId,
        chapterNumber,
        content,
        author: { address: authorAddress },
        votes: 1,
        createdAt: new Date(),
        isSelected: true,
        submissions: []
      };

      story.chapters.push(chapter);
      story.currentChapter = chapterNumber;
      story.totalVotes += 1;

      const submission: StorySubmission = {
        id: `submission_${Date.now()}`,
        storyId,
        chapterNumber,
        content,
        author: { address: authorAddress },
        votes: [],
        totalVotes: 1,
        createdAt: new Date(),
        isWinner: true,
      };

      return submission;
    }

    const submission: StorySubmission = {
      id: `submission_${Date.now()}`,
      storyId,
      chapterNumber,
      content,
      author: { address: authorAddress },
      votes: [],
      totalVotes: 0,
      createdAt: new Date(),
      isWinner: false,
    };

    submissions.push(submission);
    return submission;
  }

  static async getSubmissionsForChapter(
    storyId: string,
    chapterNumber: number
  ): Promise<StorySubmission[]> {
    return submissions.filter(
      s => s.storyId === storyId && s.chapterNumber === chapterNumber
    ).sort((a, b) => b.totalVotes - a.totalVotes);
  }

  static async voteForSubmission(
    submissionId: string,
    voterAddress: string,
    transactionHash: string
  ): Promise<Vote> {
    const existingVote = votes.find(
      v => v.submissionId === submissionId && v.voter.address === voterAddress
    );
    
    if (existingVote) {
      throw new Error('User has already voted for this submission');
    }

    const vote: Vote = {
      id: `vote_${Date.now()}`,
      submissionId,
      voter: { address: voterAddress },
      transactionHash,
      createdAt: new Date(),
      weight: 1,
    };

    votes.push(vote);

    const submission = submissions.find(s => s.id === submissionId);
    if (submission) {
      submission.votes.push(vote);
      submission.totalVotes += 1;
    }

    return vote;
  }

  static async selectWinningSubmission(
    storyId: string,
    chapterNumber: number
  ): Promise<StorySubmission | null> {
    const chapterSubmissions = await this.getSubmissionsForChapter(storyId, chapterNumber);
    
    if (chapterSubmissions.length === 0) return null;

    const winner = chapterSubmissions.reduce((prev, current) => 
      current.totalVotes > prev.totalVotes ? current : prev
    );

    winner.isWinner = true;

    const story = stories.find(s => s.id === storyId);
    if (story) {
      story.chapters.push({
        id: `chapter_${storyId}_${chapterNumber}`,
        storyId,
        chapterNumber,
        content: winner.content,
        author: winner.author,
        votes: winner.totalVotes,
        createdAt: winner.createdAt,
        isSelected: true,
        submissions: chapterSubmissions,
      });

      story.currentChapter = chapterNumber;
      story.totalVotes += winner.totalVotes;

      if (chapterNumber >= story.maxChapters) {
        story.isComplete = true;
      }
    }

    return winner;
  }

  static async getStoryProgress(storyId: string): Promise<{
    currentChapter: number;
    totalChapters: number;
    pendingSubmissions: number;
    isVotingOpen: boolean;
  }> {
    const story = await this.getStory(storyId);
    if (!story) throw new Error('Story not found');

    const pendingSubmissions = submissions.filter(
      s => s.storyId === storyId && s.chapterNumber === story.currentChapter + 1
    ).length;

    return {
      currentChapter: story.currentChapter,
      totalChapters: story.maxChapters,
      pendingSubmissions,
      isVotingOpen: pendingSubmissions > 0 && !story.isComplete,
    };
  }

  static async getUserVotes(userAddress: string): Promise<Vote[]> {
    return votes.filter(v => v.voter.address === userAddress);
  }

  static async getUserSubmissions(userAddress: string): Promise<StorySubmission[]> {
    return submissions.filter(s => s.author.address === userAddress);
  }

  static getStoryExcerpt(story: Story, maxLength: number = 150): string {
    if (story.chapters.length === 0) return story.description;
    
    const firstChapter = story.chapters[0];
    const text = firstChapter.content;
    
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  static calculateEngagementScore(story: Story): number {
    const chapterCount = story.chapters.length;
    const voteCount = story.totalVotes;
    const submissionCount = submissions.filter(s => s.storyId === story.id).length;
    
    return (chapterCount * 10) + (voteCount * 2) + (submissionCount * 5);
  }
}


