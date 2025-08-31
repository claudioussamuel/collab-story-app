"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import {
    useChainId,
    useWriteContract,
    useAccount,
    useWaitForTransactionReceipt,
    useReadContract,
    useReadContracts,
    useWatchContractEvent,
    useBlockNumber,
} from "wagmi"
import { chainsToTSender, berniceAbi } from "../../constants"
import { readContract } from "@wagmi/core"
import { useConfig } from "wagmi"
import { CgSpinner } from "react-icons/cg"
import { RiAlertFill, RiInformationLine, RiBookOpenLine, RiEditLine, RiHeartLine } from "react-icons/ri"

// Types based on ABI analysis
interface StoryData {
    creator: string;
    title: string;
    totalChapters: bigint;
    currentChapterNumber: bigint;
    votingPeriod: bigint;
    currentChapterVotingEnd: bigint;
    completed: boolean;
}

interface SubmissionData {
    author: string;
    content: string;
    votes: bigint;
}

interface BerniceEnhancedProps {
    onStoryCreated?: (storyId: bigint) => void;
    onChapterSubmitted?: (storyId: bigint) => void;
    onVoteCast?: (storyId: bigint, submissionIndex: bigint) => void;
}

export default function BerniceEnhancedIntegration({ 
    onStoryCreated, 
    onChapterSubmitted, 
    onVoteCast 
}: BerniceEnhancedProps) {
    // Form states
    const [activeTab, setActiveTab] = useState<"create" | "submit" | "vote" | "read">("read")
    const [storyTitle, setStoryTitle] = useState("")
    const [totalChapters, setTotalChapters] = useState("10")
    const [votingPeriod, setVotingPeriod] = useState("86400") // 24 hours
    const [firstChapterContent, setFirstChapterContent] = useState("")
    const [selectedStoryId, setSelectedStoryId] = useState("1")
    const [chapterContent, setChapterContent] = useState("")
    const [selectedSubmissionIndex, setSelectedSubmissionIndex] = useState("0")
    const [errorMessage, setErrorMessage] = useState("")
    const [successMessage, setSuccessMessage] = useState("")

    // Wagmi hooks
    const config = useConfig()
    const account = useAccount()
    const chainId = useChainId()
    const { data: blockNumber } = useBlockNumber()

    // Contract address
    const berniceAddress = chainsToTSender[chainId]?.bernice

    // Write contract hook
    const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })

    // Read story data
    const { data: storyData, isLoading: isLoadingStory, refetch: refetchStory } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "getStory",
        args: [BigInt(selectedStoryId)],
        query: {
            enabled: !!berniceAddress && selectedStoryId !== "",
        }
    })

    // Read total story count
    const { data: storyCount } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "s_storyCount",
        query: {
            enabled: !!berniceAddress,
        }
    })

    // Read submissions count for current chapter
    const { data: submissionsCount, refetch: refetchSubmissionsCount } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "getSubmissionsCount",
        args: [BigInt(selectedStoryId)],
        query: {
            enabled: !!berniceAddress && selectedStoryId !== "",
        }
    })

    // Read specific submission
    const { data: submissionData, isLoading: isLoadingSubmission } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "getSubmission",
        args: [BigInt(selectedStoryId), storyData?.[3] || 1n, BigInt(selectedSubmissionIndex)],
        query: {
            enabled: !!berniceAddress && selectedStoryId !== "" && selectedSubmissionIndex !== "" && !!storyData,
        }
    })

    // Check if user has voted
    const { data: hasVoted } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "s_hasVoted",
        args: [BigInt(selectedStoryId), storyData?.[3] || 1n, account.address as `0x${string}`],
        query: {
            enabled: !!berniceAddress && selectedStoryId !== "" && !!account.address && !!storyData,
        }
    })

    // Read chapter content
    const { data: chapterContentData } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "getChapterContent",
        args: [BigInt(selectedStoryId), storyData?.[3] || 1n],
        query: {
            enabled: !!berniceAddress && selectedStoryId !== "" && !!storyData,
        }
    })

    // Event listeners
    useWatchContractEvent({
        address: berniceAddress as `0x${string}`,
        abi: berniceAbi,
        eventName: "StoryCreated",
        onLogs(logs) {
            console.log("New story created:", logs)
            logs.forEach((log) => {
                if (onStoryCreated && log.args.storyId) {
                    onStoryCreated(log.args.storyId)
                }
            })
        },
    })

    useWatchContractEvent({
        address: berniceAddress as `0x${string}`,
        abi: berniceAbi,
        eventName: "SubmissionAdded",
        onLogs(logs) {
            console.log("New submission added:", logs)
            refetchSubmissionsCount()
            if (onChapterSubmitted) {
                logs.forEach((log) => {
                    if (log.args.storyId) {
                        onChapterSubmitted(log.args.storyId)
                    }
                })
            }
        },
    })

    useWatchContractEvent({
        address: berniceAddress as `0x${string}`,
        abi: berniceAbi,
        eventName: "VoteCast",
        onLogs(logs) {
            console.log("Vote cast:", logs)
            refetchStory()
            if (onVoteCast) {
                logs.forEach((log) => {
                    if (log.args.storyId && log.args.submissionIndex) {
                        onVoteCast(log.args.storyId, log.args.submissionIndex)
                    }
                })
            }
        },
    })

    useWatchContractEvent({
        address: berniceAddress as `0x${string}`,
        abi: berniceAbi,
        eventName: "ChapterFinalized",
        onLogs(logs) {
            console.log("Chapter finalized:", logs)
            refetchStory()
            refetchSubmissionsCount()
        },
    })

    // Helper functions
    const isVotingActive = useMemo(() => {
        if (!storyData || !blockNumber) return false
        const [, , , , , currentChapterVotingEnd] = storyData as StoryData
        return blockNumber * 12n < currentChapterVotingEnd // Assuming 12 second blocks
    }, [storyData, blockNumber])

    const timeUntilVotingEnds = useMemo(() => {
        if (!storyData || !blockNumber) return null
        const [, , , , , currentChapterVotingEnd] = storyData as StoryData
        const secondsLeft = Number(currentChapterVotingEnd) - (Number(blockNumber) * 12)
        return Math.max(0, secondsLeft)
    }, [storyData, blockNumber])

    // Contract interaction functions
    async function handleCreateStory() {
        setErrorMessage("")
        setSuccessMessage("")
        
        if (!berniceAddress) {
            setErrorMessage("Bernice contract not available on this chain!")
            return
        }

        if (!storyTitle.trim() || !firstChapterContent.trim()) {
            setErrorMessage("Please fill in all required fields!")
            return
        }

        try {
            await writeContractAsync({
                abi: berniceAbi,
                address: berniceAddress as `0x${string}`,
                functionName: "createStory",
                args: [
                    storyTitle.trim(),
                    BigInt(totalChapters),
                    BigInt(votingPeriod),
                    firstChapterContent.trim(),
                ],
            })
        } catch (err) {
            console.error("Error creating story:", err)
        }
    }

    async function handleSubmitChapter() {
        setErrorMessage("")
        setSuccessMessage("")
        
        if (!berniceAddress) {
            setErrorMessage("Bernice contract not available on this chain!")
            return
        }

        if (!chapterContent.trim()) {
            setErrorMessage("Please write some content for your chapter!")
            return
        }

        try {
            await writeContractAsync({
                abi: berniceAbi,
                address: berniceAddress as `0x${string}`,
                functionName: "submitContinuation",
                args: [BigInt(selectedStoryId), chapterContent.trim()],
            })
        } catch (err) {
            console.error("Error submitting chapter:", err)
        }
    }

    async function handleVote() {
        setErrorMessage("")
        setSuccessMessage("")
        
        if (!berniceAddress) {
            setErrorMessage("Bernice contract not available on this chain!")
            return
        }

        if (hasVoted) {
            setErrorMessage("You have already voted for this chapter!")
            return
        }

        try {
            await writeContractAsync({
                abi: berniceAbi,
                address: berniceAddress as `0x${string}`,
                functionName: "vote",
                args: [BigInt(selectedStoryId), BigInt(selectedSubmissionIndex)],
            })
        } catch (err) {
            console.error("Error voting:", err)
        }
    }

    async function handleFinalizeChapter() {
        setErrorMessage("")
        setSuccessMessage("")
        
        if (!berniceAddress) {
            setErrorMessage("Bernice contract not available on this chain!")
            return
        }

        try {
            await writeContractAsync({
                abi: berniceAbi,
                address: berniceAddress as `0x${string}`,
                functionName: "finalizeCurrentChapter",
                args: [BigInt(selectedStoryId)],
            })
        } catch (err) {
            console.error("Error finalizing chapter:", err)
        }
    }

    function getButtonContent(action: string) {
        if (isPending)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Confirming in wallet...</span>
                </div>
            )
        if (isConfirming)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <CgSpinner className="animate-spin" size={20} />
                    <span>Processing transaction...</span>
                </div>
            )
        if (error || isError) {
            console.log(error)
            return (
                <div className="flex items-center justify-center gap-2 w-full">
                    <span>Error, see console.</span>
                </div>
            )
        }
        if (isConfirmed) {
            setSuccessMessage(`${action} successful!`)
            return `${action} successful!`
        }
        return action
    }

    // Local storage persistence
    useEffect(() => {
        const savedTitle = localStorage.getItem('bernice_story_title')
        const savedFirstChapter = localStorage.getItem('bernice_first_chapter')
        const savedChapterContent = localStorage.getItem('bernice_chapter_content')

        if (savedTitle) setStoryTitle(savedTitle)
        if (savedFirstChapter) setFirstChapterContent(savedFirstChapter)
        if (savedChapterContent) setChapterContent(savedChapterContent)
    }, [])

    useEffect(() => {
        localStorage.setItem('bernice_story_title', storyTitle)
    }, [storyTitle])

    useEffect(() => {
        localStorage.setItem('bernice_first_chapter', firstChapterContent)
    }, [firstChapterContent])

    useEffect(() => {
        localStorage.setItem('bernice_chapter_content', chapterContent)
    }, [chapterContent])

    if (!account.isConnected) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                    <RiAlertFill className="mx-auto mb-4 text-yellow-600" size={48} />
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">Wallet Not Connected</h3>
                    <p className="text-yellow-700">
                        Please connect your wallet to interact with the Bernice storytelling platform.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-3xl font-bold text-zinc-900 mb-4">
                    Bernice Storytelling Platform
                </h1>
                <p className="text-zinc-600 mb-6">
                    Collaborative storytelling powered by blockchain technology
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm">
                    <div className="bg-blue-100 px-3 py-1 rounded-full">
                        <span className="text-blue-800 font-medium">
                            {storyCount?.toString() || "0"} Stories Created
                        </span>
                    </div>
                    <div className="bg-green-100 px-3 py-1 rounded-full">
                        <span className="text-green-800 font-medium">
                            Network: {chainId}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex items-center justify-center">
                <div className="flex space-x-1 bg-zinc-100 p-1 rounded-xl">
                    {[
                        { key: "read", label: "Read Stories", icon: RiBookOpenLine },
                        { key: "create", label: "Create Story", icon: RiEditLine },
                        { key: "submit", label: "Submit Chapter", icon: RiEditLine },
                        { key: "vote", label: "Vote", icon: RiHeartLine },
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key as any)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                activeTab === key
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-zinc-600 hover:text-zinc-900"
                            }`}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Error and Success Messages */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                        <RiAlertFill className="text-red-600" size={20} />
                        <span className="text-red-800 font-medium">{errorMessage}</span>
                    </div>
                </div>
            )}
            
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                        <span className="text-green-600">✓</span>
                        <span className="text-green-800 font-medium">{successMessage}</span>
                    </div>
                </div>
            )}

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-lg border border-zinc-200 p-8">
                {activeTab === "read" && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-zinc-900">Read Stories</h2>
                        
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-zinc-700">Story ID:</label>
                            <input
                                type="number"
                                min="1"
                                value={selectedStoryId}
                                onChange={(e) => setSelectedStoryId(e.target.value)}
                                className="px-3 py-2 border border-zinc-300 rounded-lg w-24"
                            />
                        </div>

                        {isLoadingStory ? (
                            <div className="flex items-center justify-center py-8">
                                <CgSpinner className="animate-spin" size={24} />
                                <span className="ml-2">Loading story...</span>
                            </div>
                        ) : storyData ? (
                            <div className="space-y-6">
                                {/* Story Details */}
                                <div className="bg-zinc-50 rounded-xl p-6">
                                    <h3 className="text-xl font-semibold mb-4">{(storyData as StoryData).title}</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div>
                                            <div className="text-sm text-zinc-600">Creator</div>
                                            <div className="font-mono text-sm">
                                                {(storyData as StoryData).creator.slice(0, 6)}...
                                                {(storyData as StoryData).creator.slice(-4)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-zinc-600">Progress</div>
                                            <div className="font-semibold">
                                                {(storyData as StoryData).currentChapterNumber.toString()}/
                                                {(storyData as StoryData).totalChapters.toString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-zinc-600">Status</div>
                                            <div className={`font-semibold ${
                                                (storyData as StoryData).completed ? "text-green-600" : "text-blue-600"
                                            }`}>
                                                {(storyData as StoryData).completed ? "Complete" : "In Progress"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-zinc-600">Submissions</div>
                                            <div className="font-semibold">
                                                {submissionsCount?.toString() || "0"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Chapter Content */}
                                {chapterContentData && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                        <h4 className="font-semibold text-blue-900 mb-3">
                                            Current Chapter Content
                                        </h4>
                                        <p className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                                            {chapterContentData as string}
                                        </p>
                                    </div>
                                )}

                                {/* Voting Status */}
                                {!isVotingActive && Number(submissionsCount) > 0 && (
                                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                                        <h4 className="font-semibold text-orange-900 mb-2">
                                            Chapter Ready for Finalization
                                        </h4>
                                        <p className="text-orange-800 mb-4">
                                            Voting has ended. Someone can finalize this chapter to select the winner.
                                        </p>
                                        <button
                                            onClick={handleFinalizeChapter}
                                            disabled={isPending || isConfirming}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                                        >
                                            {getButtonContent("Finalize Chapter")}
                                        </button>
                                    </div>
                                )}

                                {/* Voting Timer */}
                                {isVotingActive && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                                        <h4 className="font-semibold text-green-900 mb-2">
                                            Voting Active
                                        </h4>
                                        <p className="text-green-800">
                                            Time remaining: {Math.floor((timeUntilVotingEnds || 0) / 3600)}h{" "}
                                            {Math.floor(((timeUntilVotingEnds || 0) % 3600) / 60)}m
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-zinc-500">
                                Story not found or invalid ID
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "create" && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-zinc-900">Create New Story</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    Story Title *
                                </label>
                                <input
                                    type="text"
                                    value={storyTitle}
                                    onChange={(e) => setStoryTitle(e.target.value)}
                                    placeholder="Enter your story title..."
                                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    maxLength={100}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        Total Chapters
                                    </label>
                                    <select
                                        value={totalChapters}
                                        onChange={(e) => setTotalChapters(e.target.value)}
                                        className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="5">5 Chapters</option>
                                        <option value="10">10 Chapters</option>
                                        <option value="15">15 Chapters</option>
                                        <option value="20">20 Chapters</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                                        Voting Period
                                    </label>
                                    <select
                                        value={votingPeriod}
                                        onChange={(e) => setVotingPeriod(e.target.value)}
                                        className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="3600">1 Hour</option>
                                        <option value="21600">6 Hours</option>
                                        <option value="43200">12 Hours</option>
                                        <option value="86400">24 Hours</option>
                                        <option value="172800">48 Hours</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-zinc-700 mb-2">
                                    First Chapter Content *
                                </label>
                                <textarea
                                    value={firstChapterContent}
                                    onChange={(e) => setFirstChapterContent(e.target.value)}
                                    placeholder="Write the opening chapter of your story..."
                                    className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-zinc-800 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
                                    rows={8}
                                    maxLength={2000}
                                />
                                <div className="text-xs text-zinc-500 mt-1">
                                    {firstChapterContent.length}/2000 characters
                                </div>
                            </div>

                            <button
                                onClick={handleCreateStory}
                                disabled={isPending || isConfirming || !storyTitle.trim() || !firstChapterContent.trim()}
                                className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                            >
                                {getButtonContent("Create Story")}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "submit" && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-zinc-900">Submit Chapter</h2>
                        
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-zinc-700">Story ID:</label>
                            <input
                                type="number"
                                min="1"
                                value={selectedStoryId}
                                onChange={(e) => setSelectedStoryId(e.target.value)}
                                className="px-3 py-2 border border-zinc-300 rounded-lg w-24"
                            />
                        </div>

                        {storyData && (
                            <div className="bg-zinc-50 rounded-xl p-4">
                                <h3 className="font-semibold mb-2">{(storyData as StoryData).title}</h3>
                                <p className="text-sm text-zinc-600">
                                    Chapter {((storyData as StoryData).currentChapterNumber + 1n).toString()} of{" "}
                                    {(storyData as StoryData).totalChapters.toString()}
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-2">
                                Chapter Content *
                            </label>
                            <textarea
                                value={chapterContent}
                                onChange={(e) => setChapterContent(e.target.value)}
                                placeholder="Write your continuation of the story..."
                                className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-zinc-800 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
                                rows={10}
                                maxLength={2000}
                            />
                            <div className="text-xs text-zinc-500 mt-1">
                                {chapterContent.length}/2000 characters
                            </div>
                        </div>

                        <button
                            onClick={handleSubmitChapter}
                            disabled={isPending || isConfirming || !chapterContent.trim()}
                            className="w-full py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {getButtonContent("Submit Chapter")}
                        </button>
                    </div>
                )}

                {activeTab === "vote" && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-zinc-900">Vote on Submissions</h2>
                        
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-zinc-700">Story ID:</label>
                            <input
                                type="number"
                                min="1"
                                value={selectedStoryId}
                                onChange={(e) => setSelectedStoryId(e.target.value)}
                                className="px-3 py-2 border border-zinc-300 rounded-lg w-24"
                            />
                            <label className="text-sm font-medium text-zinc-700">Submission:</label>
                            <input
                                type="number"
                                min="0"
                                value={selectedSubmissionIndex}
                                onChange={(e) => setSelectedSubmissionIndex(e.target.value)}
                                className="px-3 py-2 border border-zinc-300 rounded-lg w-24"
                            />
                        </div>

                        {hasVoted && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-yellow-800">
                                    ✓ You have already voted for this chapter
                                </p>
                            </div>
                        )}

                        {isLoadingSubmission ? (
                            <div className="flex items-center justify-center py-8">
                                <CgSpinner className="animate-spin" size={24} />
                                <span className="ml-2">Loading submission...</span>
                            </div>
                        ) : submissionData ? (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h4 className="font-semibold text-blue-900">
                                            Submission #{selectedSubmissionIndex}
                                        </h4>
                                        <p className="text-sm text-blue-700">
                                            By {(submissionData as SubmissionData).author.slice(0, 6)}...
                                            {(submissionData as SubmissionData).author.slice(-4)}
                                        </p>
                                    </div>
                                    <div className="text-sm text-blue-700">
                                        {(submissionData as SubmissionData).votes.toString()} votes
                                    </div>
                                </div>
                                <p className="text-blue-800 leading-relaxed whitespace-pre-wrap mb-4">
                                    {(submissionData as SubmissionData).content}
                                </p>
                                
                                <button
                                    onClick={handleVote}
                                    disabled={isPending || isConfirming || hasVoted || !isVotingActive}
                                    className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                                >
                                    {getButtonContent("Vote for This Submission")}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-zinc-500">
                                Submission not found or invalid index
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
