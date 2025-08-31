"use client"

import { useState, useEffect } from "react"
import {
    useChainId,
    useWriteContract,
    useAccount,
    useWaitForTransactionReceipt,
    useReadContract,
} from "wagmi"
import { chainsToTSender, berniceAbi } from "../../constants"
import { useConfig } from "wagmi"
import { CgSpinner } from "react-icons/cg"
import { Button, Icon } from "./DemoComponents"

// Create Story Form Component
interface CreateStoryFormProps {
    onStoryCreated?: (storyId: bigint) => void;
}

export function CreateStoryForm({ onStoryCreated }: CreateStoryFormProps) {
    const [title, setTitle] = useState("")
    const [totalChapters, setTotalChapters] = useState("10")
    const [votingPeriodSeconds, setVotingPeriodSeconds] = useState("86400") // 24 hours
    const [chapterOneContent, setChapterOneContent] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    
    const config = useConfig()
    const account = useAccount()
    const chainId = useChainId()
    
    const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })

    // Get bernice contract address
    const berniceAddress = chainsToTSender[chainId]?.bernice

    async function handleSubmit() {
        setErrorMessage("")
        
        if (!berniceAddress) {
            setErrorMessage("Bernice contract not available on this chain!")
            return
        }

        if (!title.trim() || !chapterOneContent.trim()) {
            setErrorMessage("Please fill in all required fields!")
            return
        }

        try {
            const result = await writeContractAsync({
                abi: berniceAbi,
                address: berniceAddress as `0x${string}`,
                functionName: "createStory",
                args: [
                    title.trim(),
                    BigInt(totalChapters),
                    BigInt(votingPeriodSeconds),
                    chapterOneContent.trim(),
                ],
            })
            
            console.log("Story creation transaction:", result)
        } catch (err) {
            console.error("Error creating story:", err)
        }
    }

    function getButtonContent() {
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
                    <span>Creating story...</span>
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
            return "Story created successfully!"
        }
        return "Create Story"
    }

    useEffect(() => {
        const savedTitle = localStorage.getItem('bernice_title')
        const savedChapterOne = localStorage.getItem('bernice_chapterOne')

        if (savedTitle) setTitle(savedTitle)
        if (savedChapterOne) setChapterOneContent(savedChapterOne)
    }, [])

    useEffect(() => {
        localStorage.setItem('bernice_title', title)
    }, [title])

    useEffect(() => {
        localStorage.setItem('bernice_chapterOne', chapterOneContent)
    }, [chapterOneContent])

    return (
        <div className="max-w-2xl w-full mx-auto p-6 flex flex-col gap-6 bg-white rounded-xl ring-[4px] border-2 border-blue-500 ring-blue-500/25">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900">Create New Story</h2>
                {!account.isConnected && (
                    <span className="text-sm text-red-500">Please connect wallet</span>
                )}
            </div>

            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-red-800 text-sm font-medium">{errorMessage}</span>
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Story Title *
                    </label>
                    <input
                        type="text"
                        placeholder="Enter your story title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            value={votingPeriodSeconds}
                            onChange={(e) => setVotingPeriodSeconds(e.target.value)}
                            className="w-full px-3 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        placeholder="Write the opening chapter of your story..."
                        value={chapterOneContent}
                        onChange={(e) => setChapterOneContent(e.target.value)}
                        className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-zinc-800 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
                        rows={8}
                        maxLength={2000}
                    />
                    <div className="text-xs text-zinc-500 mt-1">
                        {chapterOneContent.length}/2000 characters
                    </div>
                </div>

                <button
                    className="cursor-pointer flex items-center justify-center w-full py-3 rounded-lg text-white transition-colors font-semibold relative border bg-blue-500 hover:bg-blue-600 border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={isPending || isConfirming || !account.isConnected || !title.trim() || !chapterOneContent.trim()}
                >
                    <div className="absolute w-full inset-0 bg-gradient-to-b from-white/25 via-80% to-transparent mix-blend-overlay z-10 rounded-lg" />
                    <div className="absolute w-full inset-0 mix-blend-overlay z-10 border-[1.5px] border-white/20 rounded-lg" />
                    {getButtonContent()}
                </button>
            </div>
        </div>
    )
}

// Submit Chapter Continuation Form
interface SubmitChapterFormProps {
    storyId: string;
    onChapterSubmitted?: () => void;
}

export function SubmitChapterForm({ storyId, onChapterSubmitted }: SubmitChapterFormProps) {
    const [content, setContent] = useState("")
    const [errorMessage, setErrorMessage] = useState("")
    
    const config = useConfig()
    const account = useAccount()
    const chainId = useChainId()
    
    const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })

    const berniceAddress = chainsToTSender[chainId]?.bernice

    async function handleSubmit() {
        setErrorMessage("")
        
        if (!berniceAddress) {
            setErrorMessage("Bernice contract not available on this chain!")
            return
        }

        if (!content.trim()) {
            setErrorMessage("Please write some content for your chapter!")
            return
        }

        try {
            await writeContractAsync({
                abi: berniceAbi,
                address: berniceAddress as `0x${string}`,
                functionName: "submitContinuation",
                args: [
                    BigInt(storyId),
                    content.trim(),
                ],
            })
            
            if (onChapterSubmitted) {
                onChapterSubmitted()
            }
        } catch (err) {
            console.error("Error submitting chapter:", err)
        }
    }

    function getButtonContent() {
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
                    <span>Submitting chapter...</span>
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
            return "Chapter submitted!"
        }
        return "Submit Chapter"
    }

    useEffect(() => {
        const savedContent = localStorage.getItem(`bernice_chapter_${storyId}`)
        if (savedContent) setContent(savedContent)
    }, [storyId])

    useEffect(() => {
        localStorage.setItem(`bernice_chapter_${storyId}`, content)
    }, [content, storyId])

    return (
        <div className="max-w-2xl w-full mx-auto p-6 flex flex-col gap-6 bg-white rounded-xl ring-[4px] border-2 border-green-500 ring-green-500/25">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-zinc-900">Submit Chapter Continuation</h2>
                <span className="text-sm text-zinc-600">Story #{storyId}</span>
            </div>

            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <span className="text-red-800 text-sm font-medium">{errorMessage}</span>
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-2">
                        Chapter Content *
                    </label>
                    <textarea
                        placeholder="Write your continuation of the story..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-zinc-800 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none"
                        rows={10}
                        maxLength={2000}
                    />
                    <div className="text-xs text-zinc-500 mt-1">
                        {content.length}/2000 characters
                    </div>
                </div>

                <button
                    className="cursor-pointer flex items-center justify-center w-full py-3 rounded-lg text-white transition-colors font-semibold relative border bg-green-500 hover:bg-green-600 border-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={isPending || isConfirming || !account.isConnected || !content.trim()}
                >
                    <div className="absolute w-full inset-0 bg-gradient-to-b from-white/25 via-80% to-transparent mix-blend-overlay z-10 rounded-lg" />
                    <div className="absolute w-full inset-0 mix-blend-overlay z-10 border-[1.5px] border-white/20 rounded-lg" />
                    {getButtonContent()}
                </button>
            </div>
        </div>
    )
}

// Vote Form Component
interface VoteFormProps {
    storyId: string;
    submissionIndex: string;
    onVoteSubmitted?: () => void;
}

export function VoteForm({ storyId, submissionIndex, onVoteSubmitted }: VoteFormProps) {
    const config = useConfig()
    const account = useAccount()
    const chainId = useChainId()
    
    const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })

    const berniceAddress = chainsToTSender[chainId]?.bernice

    async function handleVote() {
        if (!berniceAddress) {
            console.error("Bernice contract not available on this chain!")
            return
        }

        try {
            await writeContractAsync({
                abi: berniceAbi,
                address: berniceAddress as `0x${string}`,
                functionName: "vote",
                args: [
                    BigInt(storyId),
                    BigInt(submissionIndex),
                ],
            })
            
            if (onVoteSubmitted) {
                onVoteSubmitted()
            }
        } catch (err) {
            console.error("Error voting:", err)
        }
    }

    function getButtonContent() {
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
                    <span>Submitting vote...</span>
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
            return "Vote submitted!"
        }
        return "Vote"
    }

    return (
        <button
            className="cursor-pointer flex items-center justify-center px-4 py-2 rounded-lg text-white transition-colors font-semibold relative border bg-purple-500 hover:bg-purple-600 border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleVote}
            disabled={isPending || isConfirming || !account.isConnected}
        >
            <div className="absolute w-full inset-0 bg-gradient-to-b from-white/25 via-80% to-transparent mix-blend-overlay z-10 rounded-lg" />
            <div className="absolute w-full inset-0 mix-blend-overlay z-10 border-[1.5px] border-white/20 rounded-lg" />
            {getButtonContent()}
        </button>
    )
}

// Finalize Chapter Form (for story creators or when voting period ends)
interface FinalizeChapterFormProps {
    storyId: string;
    onChapterFinalized?: () => void;
}

export function FinalizeChapterForm({ storyId, onChapterFinalized }: FinalizeChapterFormProps) {
    const config = useConfig()
    const account = useAccount()
    const chainId = useChainId()
    
    const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
        confirmations: 1,
        hash,
    })

    const berniceAddress = chainsToTSender[chainId]?.bernice

    async function handleFinalize() {
        if (!berniceAddress) {
            console.error("Bernice contract not available on this chain!")
            return
        }

        try {
            await writeContractAsync({
                abi: berniceAbi,
                address: berniceAddress as `0x${string}`,
                functionName: "finalizeCurrentChapter",
                args: [BigInt(storyId)],
            })
            
            if (onChapterFinalized) {
                onChapterFinalized()
            }
        } catch (err) {
            console.error("Error finalizing chapter:", err)
        }
    }

    function getButtonContent() {
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
                    <span>Finalizing chapter...</span>
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
            return "Chapter finalized!"
        }
        return "Finalize Chapter"
    }

    return (
        <button
            className="cursor-pointer flex items-center justify-center px-4 py-2 rounded-lg text-white transition-colors font-semibold relative border bg-orange-500 hover:bg-orange-600 border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleFinalize}
            disabled={isPending || isConfirming || !account.isConnected}
        >
            <div className="absolute w-full inset-0 bg-gradient-to-b from-white/25 via-80% to-transparent mix-blend-overlay z-10 rounded-lg" />
            <div className="absolute w-full inset-0 mix-blend-overlay z-10 border-[1.5px] border-white/20 rounded-lg" />
            {getButtonContent()}
        </button>
    )
}
