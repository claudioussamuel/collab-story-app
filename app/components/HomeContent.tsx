"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Icon } from "./DemoComponents";
import { StoryBrowser, StoryCreation, StoryReader, ChapterWriter, VotingInterface } from "./StoryComponents";
import BerniceDemo from "./BerniceDemo";
import { Story, StorySubmission } from "../../lib/types";
import { useAccount, useChainId } from "wagmi"
import { 
  useStoryCount, 
  useAllStories, 
  useCompleteStoryData,
  useBerniceEvents 
} from "../../lib/bernice-contract-hooks"
import { CgSpinner } from "react-icons/cg";

export default function HomeContent() {
  const [activeView, setActiveView] = useState<"browse" | "create" | "read" | "write" | "vote" | "contract" | "enhanced">("browse");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const { isConnected } = useAccount()
  const chainId = useChainId()
  
  // Contract data hooks
  const { count: totalStories, isLoading: isLoadingCount } = useStoryCount()
  const { stories: allStories, isLoading: isLoadingStories, refetch: refetchStories } = useAllStories()
  
  // Selected story data with complete information
  const { 
    story: selectedStoryData, 
    submissionsCount, 
    isLoading: isLoadingSelectedStory,
    refetchStory 
  } = useCompleteStoryData(selectedStory?.id || "")
  
  // Event handlers for data refresh
  const handleStoryCreatedEvent = useCallback(() => {
    console.log("Story created - refreshing data")
    refetchStories()
  }, [refetchStories])
  
  const handleSubmissionOrVote = useCallback(() => {
    console.log("Submission added or vote cast - refreshing data")
    refetchStory()
    refetchStories()
  }, [refetchStory, refetchStories])
  
  const handleChapterFinalizedEvent = useCallback(() => {
    console.log("Chapter finalized - refreshing data")
    refetchStory()
    refetchStories()
  }, [refetchStory, refetchStories])
  
  // Use events hook with callbacks to prevent infinite re-renders
  useBerniceEvents({
    onStoryCreated: handleStoryCreatedEvent,
    onSubmissionAdded: handleSubmissionOrVote,
    onVoteCast: handleSubmissionOrVote,
    onChapterFinalized: handleChapterFinalizedEvent,
  })

  const handleStorySelect = useCallback((story: Story) => {
    setSelectedStory(story);
    setActiveView("read");
  }, []);

  const handleStoryCreated = useCallback((story: Story) => {
    setSelectedStory(story);
    // Refresh stories list to include new story
    refetchStories();
    // Redirect to write the first chapter
    setActiveView("write");
  }, [refetchStories]);

  const handleBackToBrowse = useCallback(() => {
    setActiveView("browse");
    setSelectedStory(null);
  }, []);

  const handleChapterSubmitted = useCallback((submission: StorySubmission) => {
    // Refresh story data to show new submission
    refetchStory();
    refetchStories();
    console.log(submission.isWinner 
      ? "Chapter published successfully! Your story is now live and ready for the next writer."
      : "Chapter submitted successfully! The community can now vote on all submissions for this chapter."
    );
    setActiveView("read");
  }, [refetchStory, refetchStories]);
 
  return (
    <div className="min-h-screen bg-white">
      {/* Clean geometric background */}

      {!isConnected ? (
                <div className="flex items-center justify-center">
                    <h2 className="text-xl font-medium text-zinc-600">
                        Please connect a wallet...
                    </h2>
                </div>
            ) :
      (<><div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-50 rounded-full -translate-y-48 translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-50 rounded-full translate-y-40 -translate-x-40"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-yellow-50 rounded-full -translate-x-32 -translate-y-32"></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-6 py-8">
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-black tracking-tight">
                Bernice
              </h1>
              <p className="text-base text-neutral-600 font-normal">
                Collaborative Storytelling
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-neutral-100 rounded-xl">
              <span className="text-sm text-neutral-700 font-medium">
                {isLoadingCount ? (
                  <div className="flex items-center space-x-2">
                    <CgSpinner className="animate-spin" size={14} />
                    <span>Loading...</span>
                  </div>
                ) : (
                  `${totalStories} Stories Created`
                )}
              </span>
            </div>
            {isConnected && (
              <div className="px-4 py-2 bg-blue-100 rounded-xl">
                <span className="text-sm text-blue-700 font-medium">
                  Chain: {chainId || "Unknown"}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Navigation Tabs - only show on main views */}
        {(activeView === "browse" || activeView === "vote" || activeView === "contract" || activeView === "enhanced") && (
          <div className="flex items-center space-x-1 mb-12 p-1 bg-neutral-100 rounded-2xl w-fit fade-in">
            <button
              onClick={() => setActiveView("browse")}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeView === "browse"
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-600 hover:text-neutral-800"
              }`}
            >
              Stories
            </button>
          
            <button
              onClick={() => setActiveView("contract")}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                activeView === "contract"
                  ? "bg-white text-black shadow-sm"
                  : "text-neutral-600 hover:text-neutral-800"
              }`}
            >
              Write Story
            </button>
           
          </div>
        )}

        {/* Back button for other views */}
        {activeView !== "browse" && activeView !== "vote" && activeView !== "contract" && activeView !== "enhanced" && (
          <div className="mb-12">
            <button
              onClick={handleBackToBrowse}
              className="flex items-center space-x-2 px-4 py-2 text-neutral-700 hover:text-black transition-colors duration-200 fade-in"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">Back to Stories</span>
            </button>
          </div>
        )}

        <main className="flex-1 space-y-8">
          <div className="fade-in">
            {activeView === "browse" && (
              <div className="space-y-6">
                {/* Stories Header */}
                <div className="flex items-start justify-between mb-12">
                  <div>
                    <h1 className="text-3xl font-bold text-black mb-3 tracking-tight">
                      Discover Stories
                    </h1>
                    <p className="text-neutral-600 text-lg leading-relaxed max-w-2xl">
                      Pure creativity, no constraints — stories that emerge from collective imagination
                    </p>
                  </div>
                  <Button onClick={() => setActiveView("create")} icon={<Icon name="plus" size="sm" />} size="lg">
                    Create Story
                  </Button>
                </div>

                {/* Loading State */}
                {isLoadingStories ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <CgSpinner className="animate-spin" size={24} />
                      <span className="text-neutral-600">Loading stories from blockchain...</span>
                    </div>
                  </div>
                ) : allStories.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-neutral-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <Icon name="plus" className="text-neutral-400" size="lg" />
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-3">No stories yet</h3>
                    <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                      Be the first to spark a collaborative tale and inspire others to join your creative journey.
                    </p>
                    <Button onClick={() => setActiveView("create")} icon={<Icon name="plus" size="sm" />} size="lg">
                      Create the First Story
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {allStories.map((story) => (
                      <div
                        key={story.id}
                        className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden transition-all hover:shadow-md hover:border-neutral-300 cursor-pointer"
                        onClick={() => handleStorySelect(story)}
                      >
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-black line-clamp-2">
                                {story.title}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-1 text-sm text-neutral-500">
                              <Icon name="star" size="sm" />
                              <span className="font-medium">{story.totalVotes}</span>
                            </div>
                          </div>

                          <p className="text-neutral-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                            {story.description}
                          </p>

                          <div className="space-y-4">
                            {/* Progress Bar */}
                            <div>
                              <div className="flex justify-between text-xs text-neutral-500 mb-2 font-medium">
                                <span>Chapter {story.currentChapter} of {story.maxChapters}</span>
                                <span>{Math.round((story.currentChapter / story.maxChapters) * 100)}%</span>
                              </div>
                              <div className="w-full bg-neutral-100 rounded-full h-2">
                                <div
                                  className="bg-black h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${(story.currentChapter / story.maxChapters) * 100}%` }}
                                />
                              </div>
                            </div>

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
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeView === "create" && (
              <StoryCreation
                onStoryCreated={handleStoryCreated}
                onCancel={handleBackToBrowse}
              />
            )}
            {activeView === "read" && selectedStory && (
              <div className="space-y-6">
                {isLoadingSelectedStory ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-3">
                      <CgSpinner className="animate-spin" size={24} />
                      <span className="text-neutral-600">Loading story details...</span>
                    </div>
                  </div>
                ) : selectedStoryData ? (
                  <StoryReader
                    story={selectedStoryData}
                    onBackToBrowse={handleBackToBrowse}
                    onWriteChapter={() => setActiveView("write")}
                    onVoteForSubmissions={() => setActiveView("vote")}
                  />
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-xl font-semibold text-red-600 mb-3">Story Not Found</h3>
                    <p className="text-neutral-600 mb-6">
                      The selected story could not be loaded from the blockchain.
                    </p>
                    <Button onClick={handleBackToBrowse}>
                      Back to Stories
                    </Button>
                  </div>
                )}
              </div>
            )}
            {activeView === "write" && selectedStory && (
              <ChapterWriter
                story={selectedStory}
                onChapterSubmitted={handleChapterSubmitted}
                onCancel={() => setActiveView("read")}
              />
            )}
            {activeView === "vote" && (
              <VotingInterface
                onBackToBrowse={handleBackToBrowse}
              />
            )}
            {activeView === "contract" && (
              <BerniceDemo />
            )}

          </div>
        </main>

        <footer className="mt-24 pt-12 flex justify-center border-t border-neutral-200">
          <div className="text-neutral-400 text-sm font-medium">
            <span>Built with Next.js and Pure Creativity</span>
          </div>
        </footer>
      </div></>)}


    </div>
  );
}