"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { Button, Icon } from "./DemoComponents"
import { 
    CreateStoryForm, 
    SubmitChapterForm, 
    VoteForm, 
    FinalizeChapterForm 
} from "./BerniceContractForms"
import { 
    StoryReader, 
    ChapterContentReader, 
    SubmissionReader, 
    StoryCountReader, 
    SubmissionsCountReader,
    HasVotedReader 
} from "./BerniceContractReaders"

type DemoMode = 'overview' | 'create' | 'read' | 'submit' | 'vote' | 'finalize'

export default function BerniceDemo() {
    const [mode, setMode] = useState<DemoMode>('overview')
    const [selectedStoryId, setSelectedStoryId] = useState("1")
    const [selectedChapterNumber, setSelectedChapterNumber] = useState("1")
    const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState("0")
    const account = useAccount()

    const renderModeContent = () => {
        switch (mode) {
            case 'create':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Create New Story</h2>
                            <p className="text-zinc-600 mb-8">
                                Start a collaborative story that the community can contribute to
                            </p>
                        </div>
                        <CreateStoryForm onStoryCreated={(storyId) => {
                            console.log("Story created with ID:", storyId)
                            setSelectedStoryId(storyId.toString())
                            setMode('read')
                        }} />
                    </div>
                )

            case 'read':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Read Stories</h2>
                            <p className="text-zinc-600 mb-8">
                                View story details and read chapter content
                            </p>
                        </div>
                        
                        <div className="flex items-center space-x-4 bg-zinc-50 p-4 rounded-lg">
                            <label className="text-sm font-medium text-zinc-700">Story ID:</label>
                            <input
                                type="number"
                                min="1"
                                value={selectedStoryId}
                                onChange={(e) => setSelectedStoryId(e.target.value)}
                                className="px-3 py-1 border border-zinc-300 rounded text-sm w-20"
                            />
                            <label className="text-sm font-medium text-zinc-700">Chapter:</label>
                            <input
                                type="number"
                                min="1"
                                value={selectedChapterNumber}
                                onChange={(e) => setSelectedChapterNumber(e.target.value)}
                                className="px-3 py-1 border border-zinc-300 rounded text-sm w-20"
                            />
                        </div>

                        <div className="grid gap-6">
                            <StoryReader storyId={selectedStoryId} />
                            <ChapterContentReader 
                                storyId={selectedStoryId} 
                                chapterNumber={selectedChapterNumber} 
                            />
                            <div className="flex items-center space-x-4">
                                <SubmissionsCountReader storyId={selectedStoryId} />
                                {account.address && (
                                    <HasVotedReader 
                                        storyId={selectedStoryId}
                                        chapterNumber={selectedChapterNumber}
                                        voterAddress={account.address}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )

            case 'submit':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Submit Chapter</h2>
                            <p className="text-zinc-600 mb-8">
                                Contribute your continuation to an existing story
                            </p>
                        </div>

                        <div className="flex items-center space-x-4 bg-zinc-50 p-4 rounded-lg">
                            <label className="text-sm font-medium text-zinc-700">Story ID:</label>
                            <input
                                type="number"
                                min="1"
                                value={selectedStoryId}
                                onChange={(e) => setSelectedStoryId(e.target.value)}
                                className="px-3 py-1 border border-zinc-300 rounded text-sm w-20"
                            />
                        </div>

                        <div className="grid gap-6">
                            <StoryReader storyId={selectedStoryId} />
                            <SubmitChapterForm 
                                storyId={selectedStoryId}
                                onChapterSubmitted={() => {
                                    console.log("Chapter submitted successfully")
                                    setMode('vote')
                                }}
                            />
                        </div>
                    </div>
                )

            case 'vote':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Vote on Submissions</h2>
                            <p className="text-zinc-600 mb-8">
                                Choose your favorite chapter continuation
                            </p>
                        </div>

                        <div className="flex items-center space-x-4 bg-zinc-50 p-4 rounded-lg">
                            <label className="text-sm font-medium text-zinc-700">Story ID:</label>
                            <input
                                type="number"
                                min="1"
                                value={selectedStoryId}
                                onChange={(e) => setSelectedStoryId(e.target.value)}
                                className="px-3 py-1 border border-zinc-300 rounded text-sm w-20"
                            />
                            <label className="text-sm font-medium text-zinc-700">Chapter:</label>
                            <input
                                type="number"
                                min="1"
                                value={selectedChapterNumber}
                                onChange={(e) => setSelectedChapterNumber(e.target.value)}
                                className="px-3 py-1 border border-zinc-300 rounded text-sm w-20"
                            />
                            <label className="text-sm font-medium text-zinc-700">Submission:</label>
                            <input
                                type="number"
                                min="0"
                                value={selectedSubmissionIndex}
                                onChange={(e) => setSelectedSubmissionIndex(e.target.value)}
                                className="px-3 py-1 border border-zinc-300 rounded text-sm w-20"
                            />
                        </div>

                        <div className="grid gap-6">
                            <StoryReader storyId={selectedStoryId} />
                            <SubmissionReader 
                                storyId={selectedStoryId}
                                chapterNumber={selectedChapterNumber}
                                submissionIndex={selectedSubmissionIndex}
                            />
                            <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-zinc-200">
                                <div className="flex items-center space-x-4">
                                    <SubmissionsCountReader storyId={selectedStoryId} />
                                    {account.address && (
                                        <HasVotedReader 
                                            storyId={selectedStoryId}
                                            chapterNumber={selectedChapterNumber}
                                            voterAddress={account.address}
                                        />
                                    )}
                                </div>
                                <VoteForm 
                                    storyId={selectedStoryId}
                                    submissionIndex={selectedSubmissionIndex}
                                    onVoteSubmitted={() => {
                                        console.log("Vote submitted successfully")
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )

            case 'finalize':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-zinc-900 mb-4">Finalize Chapter</h2>
                            <p className="text-zinc-600 mb-8">
                                Complete the voting process and select the winning chapter
                            </p>
                        </div>

                        <div className="flex items-center space-x-4 bg-zinc-50 p-4 rounded-lg">
                            <label className="text-sm font-medium text-zinc-700">Story ID:</label>
                            <input
                                type="number"
                                min="1"
                                value={selectedStoryId}
                                onChange={(e) => setSelectedStoryId(e.target.value)}
                                className="px-3 py-1 border border-zinc-300 rounded text-sm w-20"
                            />
                        </div>

                        <div className="grid gap-6">
                            <StoryReader storyId={selectedStoryId} />
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-orange-900 mb-2">
                                            Finalize Current Chapter
                                        </h3>
                                        <p className="text-orange-700 text-sm">
                                            This will end the voting period and select the chapter with the most votes.
                                            Only call this when the voting period has ended.
                                        </p>
                                    </div>
                                    <FinalizeChapterForm 
                                        storyId={selectedStoryId}
                                        onChapterFinalized={() => {
                                            console.log("Chapter finalized successfully")
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )

            default:
                return (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-zinc-900 mb-4">
                                Bernice Smart Contract Demo
                            </h1>
                            <p className="text-lg text-zinc-600 mb-8 max-w-2xl mx-auto">
                                A collaborative storytelling platform powered by blockchain technology. 
                                Create stories, submit chapters, vote on continuations, and build narratives together.
                            </p>
                            <div className="flex items-center justify-center">
                                <StoryCountReader />
                            </div>
                        </div>

                        {!account.isConnected && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                                <div className="text-yellow-800 mb-4">
                                    <Icon name="arrow-right" className="mx-auto mb-2" />
                                    <h3 className="font-semibold">Wallet Not Connected</h3>
                                </div>
                                <p className="text-yellow-700 text-sm">
                                    Please connect your wallet to interact with the Bernice smart contract.
                                    You can still view read-only functions below.
                                </p>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Create Story Card */}
                            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-blue-600 mb-4">
                                    <Icon name="plus" size="lg" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Create Story</h3>
                                <p className="text-zinc-600 text-sm mb-4">
                                    Start a new collaborative story with title, chapters, and voting period.
                                </p>
                                <Button 
                                    onClick={() => setMode('create')} 
                                    size="sm"
                                    disabled={!account.isConnected}
                                >
                                    Create Story
                                </Button>
                            </div>

                            {/* Read Stories Card */}
                            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-green-600 mb-4">
                                    <Icon name="plus" size="lg" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Read Stories</h3>
                                <p className="text-zinc-600 text-sm mb-4">
                                    View story details, progress, and read chapter content.
                                </p>
                                <Button 
                                    onClick={() => setMode('read')} 
                                    variant="secondary"
                                    size="sm"
                                >
                                    Browse Stories
                                </Button>
                            </div>

                            {/* Submit Chapter Card */}
                            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-purple-600 mb-4">
                                    <Icon name="plus" size="lg" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Submit Chapter</h3>
                                <p className="text-zinc-600 text-sm mb-4">
                                    Contribute your continuation to existing stories.
                                </p>
                                <Button 
                                    onClick={() => setMode('submit')} 
                                    variant="secondary"
                                    size="sm"
                                    disabled={!account.isConnected}
                                >
                                    Write Chapter
                                </Button>
                            </div>

                            {/* Vote Card */}
                            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-orange-600 mb-4">
                                    <Icon name="heart" size="lg" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Vote</h3>
                                <p className="text-zinc-600 text-sm mb-4">
                                    Choose your favorite chapter continuations from submissions.
                                </p>
                                <Button 
                                    onClick={() => setMode('vote')} 
                                    variant="secondary"
                                    size="sm"
                                    disabled={!account.isConnected}
                                >
                                    Vote Now
                                </Button>
                            </div>

                            {/* Finalize Card */}
                            <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-red-600 mb-4">
                                    <Icon name="check" size="lg" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Finalize</h3>
                                <p className="text-zinc-600 text-sm mb-4">
                                    Complete voting periods and advance stories to the next chapter.
                                </p>
                                <Button 
                                    onClick={() => setMode('finalize')} 
                                    variant="secondary"
                                    size="sm"
                                    disabled={!account.isConnected}
                                >
                                    Finalize Chapter
                                </Button>
                            </div>

                            {/* Contract Info Card */}
                            <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-xl p-6 border border-zinc-200">
                                <div className="text-zinc-600 mb-4">
                                    <Icon name="plus" size="lg" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900 mb-2">Contract Info</h3>
                                <p className="text-zinc-600 text-sm mb-4">
                                    View blockchain data and contract statistics.
                                </p>
                                <div className="space-y-2">
                                    <StoryCountReader />
                                    <div className="text-xs text-zinc-500">
                                        Network: {account.chainId || "Not connected"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="font-semibold text-blue-900 mb-3">How It Works</h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 font-bold text-xs flex-shrink-0 mt-0.5">1</div>
                                    <span><strong>Create:</strong> Start a story with title, chapter limit, and voting period</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 font-bold text-xs flex-shrink-0 mt-0.5">2</div>
                                    <span><strong>Submit:</strong> Writers contribute their version of the next chapter</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 font-bold text-xs flex-shrink-0 mt-0.5">3</div>
                                    <span><strong>Vote:</strong> Community votes on their favorite continuation</span>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-blue-900 font-bold text-xs flex-shrink-0 mt-0.5">4</div>
                                    <span><strong>Finalize:</strong> Winning chapter becomes canon and the cycle continues</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100">
            <div className="container mx-auto px-4 py-8">
                {/* Navigation */}
                {mode !== 'overview' && (
                    <div className="mb-8">
                        <Button 
                            onClick={() => setMode('overview')} 
                            variant="ghost"
                            icon={<Icon name="arrow-right" size="sm" />}
                        >
                            Back to Overview
                        </Button>
                    </div>
                )}

                {/* Main Content */}
                {renderModeContent()}
            </div>
        </div>
    )
}
