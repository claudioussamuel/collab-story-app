"use client";

import { useState, useEffect, useCallback } from "react";
import { Story, StorySubmission, StoryFilters } from "../../lib/types";
import { StoryManager } from "../../lib/story-utils";
import { Button, Icon } from "./DemoComponents";

// Story Card Component
interface StoryCardProps {
  story: Story;
  onClick: () => void;
}

function StoryCard({ story, onClick }: StoryCardProps) {
  const progress = (story.currentChapter / story.maxChapters) * 100;
  const excerpt = StoryManager.getStoryExcerpt(story);
  const engagement = StoryManager.calculateEngagementScore(story);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden transition-all hover:shadow-md hover:border-neutral-300 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {story.title.startsWith("Untitled Story") ? (
              <h3 className="text-lg font-semibold text-neutral-500 italic">
                Story by {story.creator.username || `${story.creator.address.slice(0, 6)}...`}
              </h3>
            ) : (
              <h3 className="text-lg font-semibold text-black line-clamp-2">
                {story.title}
              </h3>
            )}
          </div>
          <div className="flex items-center space-x-1 text-sm text-neutral-500">
            <Icon name="star" size="sm" />
            <span className="font-medium">{engagement}</span>
          </div>
        </div>

        <p className="text-neutral-600 text-sm mb-6 line-clamp-3 leading-relaxed">
          {excerpt}
        </p>

        <div className="space-y-4">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-neutral-500 mb-2 font-medium">
              <span>Chapter {story.currentChapter} of {story.maxChapters}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Tags */}
          {story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {story.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs font-medium rounded-full"
                >
                  {tag}
                </span>
              ))}
              {story.tags.length > 3 && (
                <span className="text-xs text-neutral-500 font-medium">
                  +{story.tags.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Icon name="heart" size="sm" />
                <span>{story.totalVotes}</span>
              </span>
              <span>By {story.creator.username || `${story.creator.address.slice(0, 6)}...`}</span>
            </div>
            <span className={story.isComplete ? "text-green-600" : "text-blue-600"}>
              {story.isComplete ? "Complete" : "Active"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Story Browser Component
interface StoryBrowserProps {
  onStorySelect: (story: Story) => void;
  onCreateStory: () => void;
}

export function StoryBrowser({ onStorySelect, onCreateStory }: StoryBrowserProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StoryFilters>({
    status: 'all',
    sortBy: 'newest'
  });

  const loadStories = useCallback(async () => {
    setLoading(true);
    try {
      let fetchedStories = await StoryManager.getAllStories();
      
      // Apply filters
      if (filters.status === 'active') {
        fetchedStories = fetchedStories.filter(s => !s.isComplete);
      } else if (filters.status === 'complete') {
        fetchedStories = fetchedStories.filter(s => s.isComplete);
      }

      // Apply sorting
      if (filters.sortBy === 'popular') {
        fetchedStories.sort((a, b) => b.totalVotes - a.totalVotes);
      } else if (filters.sortBy === 'trending') {
        fetchedStories.sort((a, b) => 
          StoryManager.calculateEngagementScore(b) - StoryManager.calculateEngagementScore(a)
        );
      }

      setStories(fetchedStories);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--app-foreground-muted)]">Loading stories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-12">
        <div>
          <h1 className="text-3xl font-bold text-black mb-3 tracking-tight">
            Discover Stories
          </h1>
          <p className="text-neutral-600 text-lg leading-relaxed max-w-2xl">
            Pure creativity, no constraints — stories that emerge from collective imagination
          </p>
        </div>
      
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-2xl">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-neutral-700">Filter:</span>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as "all" | "active" | "complete" }))}
              className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-700 font-medium focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              <option value="all">All Stories</option>
              <option value="active">Active</option>
              <option value="complete">Complete</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-sm font-semibold text-neutral-700">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as "newest" | "popular" | "trending" }))}
              className="bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm text-neutral-700 font-medium focus:outline-none focus:ring-2 focus:ring-neutral-200"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Votes</option>
              <option value="trending">Trending</option>
            </select>
          </div>
        </div>
        
        <div className="text-sm text-neutral-500 font-medium">
          {stories.length} stories
        </div>
      </div>

      {/* Stories Grid */}
      {stories.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Icon name="plus" className="text-neutral-400" size="lg" />
          </div>
          <h3 className="text-xl font-semibold text-black mb-3">No stories yet</h3>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            Be the first to spark a collaborative tale and inspire others to join your creative journey.
          </p>
          <Button onClick={onCreateStory} icon={<Icon name="plus" size="sm" />} size="lg">
            Create the First Story
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard
              key={story.id}
              story={story}
              onClick={() => onStorySelect(story)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Story Creation Component
interface StoryCreationProps {
  onStoryCreated: (story: Story) => void;
  onCancel: () => void;
}

export function StoryCreation({ onStoryCreated, onCancel }: StoryCreationProps) {
  const [maxChapters, setMaxChapters] = useState(10);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateStory = async () => {
    setIsCreating(true);
    try {
      // Generate a simple auto-title and let the first chapter define the story
      const autoTitle = `Untitled Story #${Date.now().toString().slice(-6)}`;
      const autoDescription = "A collaborative story waiting to be told...";
      
      const story = await StoryManager.createStory(
        autoTitle, 
        autoDescription, 
        "user123", // Mock user address
        maxChapters, 
        []
      );
      
      onStoryCreated(story);
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black tracking-tight">
          Create a New Story
        </h1>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-12 border border-neutral-200 shadow-sm">
        <div className="text-center space-y-8">
          {/* Philosophy */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-black">
              Pure Creative Freedom
            </h2>
            <p className="text-neutral-600 leading-relaxed text-lg max-w-2xl mx-auto">
              No titles, no descriptions, no genres to constrain your imagination. 
              Just start writing the first chapter and let the story unfold naturally through community collaboration.
            </p>
          </div>

          {/* Max Chapters - The only constraint */}
          <div className="bg-neutral-50 rounded-2xl p-8">
            <label className="block text-lg font-semibold text-black mb-6">
              How long should this collaborative journey be?
            </label>
            <select
              value={maxChapters}
              onChange={(e) => setMaxChapters(Number(e.target.value))}
              className="w-full max-w-md mx-auto px-6 py-4 bg-white border border-neutral-200 rounded-xl text-neutral-700 font-medium focus:outline-none focus:ring-2 focus:ring-neutral-300 text-center"
            >
              <option value={5}>5 Chapters — Quick Adventure</option>
              <option value={10}>10 Chapters — Classic Tale</option>
              <option value={15}>15 Chapters — Epic Journey</option>
              <option value={20}>20 Chapters — Grand Saga</option>
            </select>
          </div>

          {/* How it works */}
          <div className="bg-blue-50 rounded-2xl p-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-6 text-center text-lg">
              How it works
            </h3>
            <div className="space-y-4 text-blue-800">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm flex-shrink-0">1</div>
                <span className="font-medium">You write the opening chapter — set any scene, any world, any story you want</span>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm flex-shrink-0">2</div>
                <span className="font-medium">Other writers contribute their versions of what happens next</span>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm flex-shrink-0">3</div>
                <span className="font-medium">The community votes on their favorite continuation</span>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm flex-shrink-0">4</div>
                <span className="font-medium">The winning chapter becomes canon, and the cycle continues</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4 pt-6">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateStory}
              disabled={isCreating}
              icon={isCreating ? undefined : <Icon name="plus" size="sm" />}
              size="lg"
            >
              {isCreating ? "Creating..." : "Begin Your Story"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Story Reader Component
interface StoryReaderProps {
  story: Story;
  onBackToBrowse?: () => void;
  onWriteChapter: () => void;
  onVoteForSubmissions: () => void;
}

export function StoryReader({ story, onWriteChapter, onVoteForSubmissions }: StoryReaderProps) {
  const [storyProgress, setStoryProgress] = useState<{
    currentChapter: number;
    totalChapters: number;
    pendingSubmissions: number;
    isVotingOpen: boolean;
  } | null>(null);

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const progress = await StoryManager.getStoryProgress(story.id);
        setStoryProgress(progress);
      } catch (error) {
        console.error('Error loading story progress:', error);
      }
    };

    loadProgress();
  }, [story.id]);

  const canWriteNext = !story.isComplete && storyProgress && storyProgress.pendingSubmissions === 0;
  const canVote = storyProgress && storyProgress.isVotingOpen;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-[var(--app-card-bg)] rounded-xl p-6 border border-[var(--app-card-border)]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {story.title.startsWith("Untitled Story") ? (
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-[var(--app-foreground-muted)] italic mb-1">
                  A Collaborative Story
                </h1>
                <p className="text-[var(--app-foreground-muted)] text-sm">
                  Started by {story.creator.username || `${story.creator.address.slice(0, 6)}...`}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <h1 className="text-3xl font-bold text-[var(--app-foreground)] mb-2">
                  {story.title}
                </h1>
                <p className="text-[var(--app-foreground-muted)] mb-4">
                  {story.description}
                </p>
              </div>
            )}
            
            {/* Story Meta */}
            <div className="flex items-center space-x-4 text-sm text-[var(--app-foreground-muted)]">
              <span>{story.totalVotes} total votes</span>
              <span>•</span>
              <span className={story.isComplete ? "text-green-500" : "text-[var(--app-accent)]"}>
                {story.isComplete ? "Complete" : "In Progress"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {canWriteNext && (
              <Button onClick={onWriteChapter} icon={<Icon name="plus" size="sm" />}>
                Write Next Chapter
              </Button>
            )}
            {canVote && (
              <Button variant="outline" onClick={onVoteForSubmissions}>
                Vote on Submissions ({storyProgress?.pendingSubmissions})
              </Button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {storyProgress && (
          <div>
            <div className="flex justify-between text-sm text-[var(--app-foreground-muted)] mb-2">
              <span>Chapter {storyProgress.currentChapter} of {storyProgress.totalChapters}</span>
              <span>{Math.round((storyProgress.currentChapter / storyProgress.totalChapters) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-[var(--app-gray)] rounded-full h-2">
              <div
                className="bg-[var(--app-accent)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(storyProgress.currentChapter / storyProgress.totalChapters) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Tags */}
        {story.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-[var(--app-accent-light)] text-[var(--app-accent)] text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Chapters */}
      <div className="space-y-6">
        {story.chapters.map((chapter) => (
          <div
            key={chapter.id}
            className="bg-[var(--app-card-bg)] rounded-xl p-6 border border-[var(--app-card-border)]"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--app-foreground)]">
                Chapter {chapter.chapterNumber}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-[var(--app-foreground-muted)]">
                <span className="flex items-center space-x-1">
                  <Icon name="heart" size="sm" />
                  <span>{chapter.votes} votes</span>
                </span>
                <span>By {chapter.author.username || `${chapter.author.address.slice(0, 6)}...`}</span>
              </div>
            </div>
            
            <div className="prose prose-gray max-w-none">
              <p className="text-[var(--app-foreground)] leading-relaxed text-base">
                {chapter.content}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Next Chapter Status */}
      {!story.isComplete && storyProgress && (
        <div className="bg-[var(--app-card-bg)] rounded-xl p-6 border border-[var(--app-card-border)]">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-[var(--app-foreground)] mb-2">
              What happens next?
            </h3>
            {storyProgress.pendingSubmissions > 0 ? (
              <div>
                <p className="text-[var(--app-foreground-muted)] mb-4">
                  {storyProgress.pendingSubmissions} writers have submitted their version of Chapter {storyProgress.currentChapter + 1}.
                  Vote for your favorite to continue the story!
                </p>
                <Button onClick={onVoteForSubmissions} variant="primary">
                  Vote on Submissions ({storyProgress.pendingSubmissions})
                </Button>
              </div>
            ) : (
              <div>
                {story.currentChapter === 0 ? (
                  <p className="text-[var(--app-foreground-muted)] mb-4">
                    This story needs its first chapter! You can start writing immediately.
                  </p>
                ) : (
                  <p className="text-[var(--app-foreground-muted)] mb-4">
                    The community is waiting for writers to submit Chapter {storyProgress.currentChapter + 1}.
                    Add your version to the mix!
                  </p>
                )}
                <Button onClick={onWriteChapter} icon={<Icon name="plus" size="sm" />}>
                  {story.currentChapter === 0 ? "Write First Chapter" : `Write Chapter ${storyProgress.currentChapter + 1}`}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {story.isComplete && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Icon name="check" className="text-green-600" />
            <h3 className="text-lg font-semibold text-green-800">Story Complete!</h3>
          </div>
          <p className="text-green-700">
            This collaborative story has reached its conclusion with {story.chapters.length} chapters 
            and {story.totalVotes} total community votes.
          </p>
        </div>
      )}
    </div>
  );
}

// Chapter Writing Component
interface ChapterWriterProps {
  story: Story;
  onChapterSubmitted: (submission: StorySubmission) => void;
  onCancel: () => void;
}

export function ChapterWriter({ story, onChapterSubmitted, onCancel }: ChapterWriterProps) {
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextChapterNumber = story.currentChapter + 1;
  const maxLength = 1000; // Maximum characters for a chapter
  const minLength = 100; // Minimum characters for a chapter

  const handleSubmitChapter = async () => {
    if (!content.trim() || content.length < minLength) return;

    setIsSubmitting(true);
    try {
      const submission = await StoryManager.submitChapter(
        story.id,
        content.trim(),
        "user123" // Mock user address
      );
      
      onChapterSubmitted(submission);
    } catch (error) {
      console.error('Error submitting chapter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = content.trim().length >= minLength && content.trim().length <= maxLength;
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">
            Write Chapter {nextChapterNumber}
          </h1>
          <p className="text-[var(--app-foreground-muted)]">
            Continue the story {story.title.startsWith("Untitled") ? `by ${story.creator.username || story.creator.address.slice(0, 6) + "..."}` : story.title}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            icon={<Icon name="star" size="sm" />}
          >
            {showPreview ? "Edit" : "Preview"}
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Story Context - Show previous chapter or first chapter guidance */}
      {story.chapters.length > 0 ? (
        <div className="bg-[var(--app-card-bg)] rounded-xl p-6 border border-[var(--app-card-border)]">
          <h3 className="text-lg font-semibold text-[var(--app-foreground)] mb-3">
            Previous Chapter (Chapter {story.chapters[story.chapters.length - 1].chapterNumber})
          </h3>
          <div className="bg-[var(--app-gray)] rounded-lg p-4 max-h-40 overflow-y-auto">
            <p className="text-[var(--app-foreground-muted)] text-sm leading-relaxed">
              {story.chapters[story.chapters.length - 1].content}
            </p>
          </div>
          <div className="text-xs text-[var(--app-foreground-muted)] mt-2">
            By {story.chapters[story.chapters.length - 1].author.username || 
                `${story.chapters[story.chapters.length - 1].author.address.slice(0, 6)}...`}
          </div>
        </div>
      ) : (
        <div className="bg-[var(--app-accent-light)] rounded-xl p-6">
          <h3 className="text-lg font-semibold text-[var(--app-accent)] mb-3">
            🌟 You&apos;re writing the first chapter!
          </h3>
          <p className="text-[var(--app-accent)] text-sm leading-relaxed">
            This is your blank canvas. Set any scene, create any world, introduce any characters you want. 
            The story will grow from whatever seed you plant here. There are no rules except your imagination!
          </p>
        </div>
      )}

      {/* Writing Interface */}
      <div className="bg-[var(--app-card-bg)] rounded-xl p-6 border border-[var(--app-card-border)]">
        {!showPreview ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--app-foreground)]">
                Your Chapter
              </h3>
              <div className="text-sm text-[var(--app-foreground-muted)]">
                {wordCount} words • {content.length}/{maxLength} characters
              </div>
            </div>
            
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={story.chapters.length === 0 
                ? `Begin your story here... Set any scene, any world, any genre you want!

This is Chapter 1 - you're creating the foundation that other writers will build upon. 
There are no constraints, no expectations, just pure creative freedom.

Some ideas to get started:
• Start with a character in an interesting situation
• Set a mysterious or intriguing scene
• Jump right into action or dialogue
• Create a world that sparks curiosity

Remember: There are no wrong directions - only different possibilities!`
                : `What happens next in this story? Let your imagination run wild...

Remember: 
• This is your interpretation of where the story should go
• Other writers will submit their versions too
• The community will vote on their favorite continuation
• There are no wrong directions - only different possibilities!`}
              className="w-full h-80 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-zinc-800 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none font-mono text-sm leading-relaxed"
              maxLength={maxLength}
            />
            
            {/* Character/Word Count Indicators */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4">
                <span className={content.length < minLength ? "text-yellow-500" : "text-green-500"}>
                  {content.length < minLength ? `${minLength - content.length} more characters needed` : "Length requirement met ✓"}
                </span>
                {content.length > maxLength * 0.9 && (
                  <span className="text-yellow-500">
                    Approaching character limit
                  </span>
                )}
              </div>
              <div className="text-[var(--app-foreground-muted)]">
                Minimum: {minLength} characters
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--app-foreground)]">
              Preview
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="prose prose-gray max-w-none">
                <p className="text-[var(--app-foreground)] leading-relaxed whitespace-pre-wrap">
                  {content || "Your chapter content will appear here..."}
                </p>
              </div>
            </div>
            {content && (
              <div className="text-sm text-[var(--app-foreground-muted)]">
                {wordCount} words • {content.length} characters
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-[var(--app-card-border)] mt-6">
          <div className="text-sm text-[var(--app-foreground-muted)]">
            {nextChapterNumber === 1 
              ? "Your first chapter will be automatically accepted"
              : "Your submission will be available for community voting"
            }
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitChapter}
              disabled={!canSubmit || isSubmitting}
              icon={isSubmitting ? undefined : <Icon name="plus" size="sm" />}
            >
              {isSubmitting 
                ? "Submitting..." 
                : nextChapterNumber === 1 
                  ? "Publish Chapter" 
                  : "Submit Chapter"
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Writing Tips */}
      <div className="bg-[var(--app-accent-light)] rounded-xl p-6">
        <h3 className="font-semibold text-[var(--app-accent)] mb-3">
          💡 Writing Tips
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-[var(--app-accent)]">
          <div>
            <h4 className="font-medium mb-1">Build on what came before</h4>
            <p>Reference characters, settings, or events from previous chapters</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Leave room for others</h4>
            <p>Create new mysteries or situations for future writers to explore</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Stay true to the tone</h4>
            <p>Match the mood and style established by earlier chapters</p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Be creative!</h4>
            <p>There&apos;s no single right direction - surprise the community</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Voting Interface Component
interface VotingInterfaceProps {
  onBackToBrowse: () => void;
}

export function VotingInterface({ onBackToBrowse }: VotingInterfaceProps) {
  const [pendingSubmissions, setPendingSubmissions] = useState<{
    [storyId: string]: {
      story: Story;
      submissions: StorySubmission[];
    }
  }>({});
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);

  useEffect(() => {
    const loadPendingSubmissions = async () => {
      setLoading(true);
      try {
        const stories = await StoryManager.getAllStories();
        const submissionsByStory: typeof pendingSubmissions = {};

        for (const story of stories) {
          if (!story.isComplete) {
            const submissions = await StoryManager.getSubmissionsForChapter(
              story.id,
              story.currentChapter + 1
            );
            if (submissions.length > 0) {
              submissionsByStory[story.id] = { story, submissions };
            }
          }
        }

        setPendingSubmissions(submissionsByStory);
      } catch (error) {
        console.error('Error loading pending submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPendingSubmissions();
  }, []);

  const handleVote = async (submissionId: string) => {
    setVoting(submissionId);
    try {
      await StoryManager.voteForSubmission(submissionId, "user123", "mock_tx_hash"); // Mock user address and transaction hash
      console.log('Vote submitted successfully!');
    } catch (error) {
      console.error('Error voting:', error);
      console.error(`Error: ${error instanceof Error ? error.message : 'Failed to vote'}`);
    } finally {
      setVoting(null);
    }
  };

  const totalPendingSubmissions = Object.values(pendingSubmissions).reduce(
    (total, { submissions }) => total + submissions.length,
    0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-[var(--app-foreground-muted)]">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--app-foreground)] mb-2">
            Vote on Submissions
          </h1>
          <p className="text-[var(--app-foreground-muted)]">
            Help decide which chapters continue these collaborative stories
          </p>
        </div>
        <div className="text-sm text-[var(--app-foreground-muted)]">
          {totalPendingSubmissions} submissions waiting for votes
        </div>
      </div>

      {totalPendingSubmissions === 0 ? (
        <div className="text-center py-12">
          <div className="text-[var(--app-foreground-muted)] mb-4">
            No submissions are currently waiting for votes.
          </div>
          <Button onClick={onBackToBrowse} icon={<Icon name="arrow-right" size="sm" className="rotate-180" />}>
            Browse Stories
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(pendingSubmissions).map(([storyId, { story, submissions }]) => (
            <div key={storyId} className="bg-[var(--app-card-bg)] rounded-xl p-6 border border-[var(--app-card-border)]">
              {/* Story Header */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-[var(--app-foreground)] mb-2">
                  {story.title.startsWith("Untitled") 
                    ? `Story by ${story.creator.username || story.creator.address.slice(0, 6) + "..."}`
                    : story.title
                  }
                </h2>
                <div className="flex items-center space-x-4 text-sm text-[var(--app-foreground-muted)]">
                  <span>Chapter {story.currentChapter + 1} submissions</span>
                  <span>•</span>
                  <span>{submissions.length} versions to choose from</span>
                  <span>•</span>
                  <span>{story.chapters.length}/{story.maxChapters} chapters complete</span>
                </div>
              </div>

              {/* Last Chapter Context */}
              {story.chapters.length > 0 && (
                <div className="mb-6 p-4 bg-[var(--app-gray)] rounded-lg">
                  <h4 className="font-medium text-[var(--app-foreground)] mb-2">
                    Previous Chapter (Chapter {story.chapters[story.chapters.length - 1].chapterNumber})
                  </h4>
                  <p className="text-sm text-[var(--app-foreground-muted)] line-clamp-3">
                    {story.chapters[story.chapters.length - 1].content}
                  </p>
                </div>
              )}

              {/* Submissions */}
              <div className="space-y-4">
                <h4 className="font-medium text-[var(--app-foreground)]">
                  Choose your favorite continuation:
                </h4>
                {submissions.map((submission, index) => (
                  <div
                    key={submission.id}
                    className="border border-[var(--app-card-border)] rounded-lg p-4 hover:bg-[var(--app-gray)] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="bg-[var(--app-accent)] text-[var(--app-background)] text-sm font-medium px-2 py-1 rounded">
                          Option {index + 1}
                        </span>
                        <span className="text-sm text-[var(--app-foreground-muted)]">
                          By {submission.author.username || `${submission.author.address.slice(0, 6)}...`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1 text-sm text-[var(--app-foreground-muted)]">
                          <Icon name="heart" size="sm" />
                          <span>{submission.totalVotes}</span>
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleVote(submission.id)}
                          disabled={voting === submission.id}
                          icon={voting === submission.id ? undefined : <Icon name="heart" size="sm" />}
                        >
                          {voting === submission.id ? "Voting..." : "Vote"}
                        </Button>
                      </div>
                    </div>
                    <p className="text-[var(--app-foreground)] leading-relaxed text-sm">
                      {submission.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
