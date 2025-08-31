"use client"

import { useState, useEffect } from "react"
import {
    useChainId,
    useReadContract,
    useReadContracts,
} from "wagmi"
import { chainsToTSender, berniceAbi } from "../../constants"
import { Button, Icon } from "./DemoComponents"

// Story Reader Component
interface StoryReaderProps {
    storyId: string;
}

export function StoryReader({ storyId }: StoryReaderProps) {
    const chainId = useChainId()
    const berniceAddress = chainsToTSender[chainId]?.bernice

    const { data: storyData, isLoading, error } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "getStory",
        args: [BigInt(storyId)],
    })

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl p-6 border border-zinc-200">
                <div className="animate-pulse">
                    <div className="h-4 bg-zinc-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-zinc-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-zinc-200 rounded w-1/4"></div>
                </div>
            </div>
        )
    }

    if (error || !storyData) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="text-red-600">
                    Error loading story: {error?.message || "Story not found"}
                </div>
            </div>
        )
    }

    const [creator, title, totalChapters, currentChapterNumber, votingPeriod, currentChapterVotingEnd, completed] = storyData as [
        string, string, bigint, bigint, bigint, bigint, boolean
    ]

    return (
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h2 className="text-xl font-semibold text-zinc-900 mb-2">{title}</h2>
                        <p className="text-sm text-zinc-600">
                            Created by {creator.slice(0, 6)}...{creator.slice(-4)}
                        </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        completed 
                            ? "bg-green-100 text-green-800" 
                            : "bg-blue-100 text-blue-800"
                    }`}>
                        {completed ? "Complete" : "In Progress"}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-zinc-200">
                    <div className="text-center">
                        <div className="text-lg font-semibold text-zinc-900">
                            {currentChapterNumber.toString()}
                        </div>
                        <div className="text-xs text-zinc-600">Current Chapter</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-zinc-900">
                            {totalChapters.toString()}
                        </div>
                        <div className="text-xs text-zinc-600">Total Chapters</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-zinc-900">
                            {Math.round(Number(votingPeriod) / 3600)}h
                        </div>
                        <div className="text-xs text-zinc-600">Voting Period</div>
                    </div>
                    <div className="text-center">
                        <div className="text-lg font-semibold text-zinc-900">
                            {Math.round((Number(currentChapterNumber) / Number(totalChapters)) * 100)}%
                        </div>
                        <div className="text-xs text-zinc-600">Progress</div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-zinc-200 rounded-full h-2">
                    <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                            width: `${Math.round((Number(currentChapterNumber) / Number(totalChapters)) * 100)}%` 
                        }}
                    />
                </div>

                {!completed && (
                    <div className="text-sm text-zinc-600 bg-zinc-50 rounded-lg p-3">
                        <strong>Voting ends:</strong> {" "}
                        {new Date(Number(currentChapterVotingEnd) * 1000).toLocaleString()}
                    </div>
                )}
            </div>
        </div>
    )
}

// Chapter Content Reader
interface ChapterContentReaderProps {
    storyId: string;
    chapterNumber: string;
}

export function ChapterContentReader({ storyId, chapterNumber }: ChapterContentReaderProps) {
    const chainId = useChainId()
    const berniceAddress = chainsToTSender[chainId]?.bernice

    const { data: chapterContent, isLoading, error } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "getChapterContent",
        args: [BigInt(storyId), BigInt(chapterNumber)],
    })

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl p-6 border border-zinc-200">
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-zinc-200 rounded w-full"></div>
                    <div className="h-4 bg-zinc-200 rounded w-full"></div>
                    <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
                </div>
            </div>
        )
    }

    if (error || !chapterContent) {
        return (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="text-yellow-600">
                    Chapter {chapterNumber} content not available yet
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl p-6 border border-zinc-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-900">
                    Chapter {chapterNumber}
                </h3>
                <div className="text-xs text-zinc-500">
                    Story #{storyId}
                </div>
            </div>
            <div className="prose prose-zinc max-w-none">
                <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {chapterContent as string}
                </p>
            </div>
        </div>
    )
}

// Submission Reader
interface SubmissionReaderProps {
    storyId: string;
    chapterNumber: string;
    submissionIndex: string;
}

export function SubmissionReader({ storyId, chapterNumber, submissionIndex }: SubmissionReaderProps) {
    const chainId = useChainId()
    const berniceAddress = chainsToTSender[chainId]?.bernice

    const { data: submissionData, isLoading, error } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "getSubmission",
        args: [BigInt(storyId), BigInt(chapterNumber), BigInt(submissionIndex)],
    })

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl p-4 border border-zinc-200">
                <div className="animate-pulse space-y-3">
                    <div className="h-3 bg-zinc-200 rounded w-1/4"></div>
                    <div className="h-4 bg-zinc-200 rounded w-full"></div>
                    <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
                </div>
            </div>
        )
    }

    if (error || !submissionData) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="text-red-600 text-sm">
                    Submission not found
                </div>
            </div>
        )
    }

    const [author, content, votes] = submissionData as [string, string, bigint]

    return (
        <div className="bg-white rounded-xl p-4 border border-zinc-200 shadow-sm">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-zinc-900">
                        Submission #{submissionIndex}
                    </span>
                    <span className="text-xs text-zinc-500">
                        by {author.slice(0, 6)}...{author.slice(-4)}
                    </span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-zinc-600">
                    <Icon name="heart" size="sm" />
                    <span>{votes.toString()} votes</span>
                </div>
            </div>
            <div className="prose prose-sm prose-zinc max-w-none">
                <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
                    {content}
                </p>
            </div>
        </div>
    )
}

// Story Count Reader
export function StoryCountReader() {
    const chainId = useChainId()
    const berniceAddress = chainsToTSender[chainId]?.bernice

    const { data: storyCount, isLoading } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "s_storyCount",
    })

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg px-4 py-2 border border-zinc-200">
                <div className="animate-pulse h-4 bg-zinc-200 rounded w-16"></div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg px-4 py-2 border border-zinc-200">
            <div className="text-sm text-zinc-600">
                <span className="font-semibold text-zinc-900">
                    {storyCount?.toString() || "0"}
                </span> stories created
            </div>
        </div>
    )
}

// Submissions Count Reader
interface SubmissionsCountReaderProps {
    storyId: string;
}

export function SubmissionsCountReader({ storyId }: SubmissionsCountReaderProps) {
    const chainId = useChainId()
    const berniceAddress = chainsToTSender[chainId]?.bernice

    const { data: submissionsCount, isLoading } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "getSubmissionsCount",
        args: [BigInt(storyId)],
    })

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg px-3 py-1 border border-zinc-200">
                <div className="animate-pulse h-3 bg-zinc-200 rounded w-12"></div>
            </div>
        )
    }

    return (
        <div className="bg-blue-50 rounded-lg px-3 py-1 border border-blue-200">
            <div className="text-xs text-blue-700">
                {submissionsCount?.toString() || "0"} submissions
            </div>
        </div>
    )
}

// Has Voted Check
interface HasVotedReaderProps {
    storyId: string;
    chapterNumber: string;
    voterAddress: string;
}

export function HasVotedReader({ storyId, chapterNumber, voterAddress }: HasVotedReaderProps) {
    const chainId = useChainId()
    const berniceAddress = chainsToTSender[chainId]?.bernice

    const { data: hasVoted, isLoading } = useReadContract({
        abi: berniceAbi,
        address: berniceAddress as `0x${string}`,
        functionName: "s_hasVoted",
        args: [BigInt(storyId), BigInt(chapterNumber), voterAddress as `0x${string}`],
    })

    if (isLoading) {
        return (
            <div className="inline-block">
                <div className="animate-pulse h-3 bg-zinc-200 rounded w-16"></div>
            </div>
        )
    }

    return (
        <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            hasVoted 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-600"
        }`}>
            {hasVoted ? "✓ Voted" : "Not voted"}
        </div>
    )
}
