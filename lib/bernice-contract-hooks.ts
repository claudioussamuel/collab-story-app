"use client"

import { useState, useEffect, useMemo } from "react"
import {
    useChainId,
    useAccount,
    useReadContract,
    useReadContracts,
    useWatchContractEvent,
    useBlockNumber,
} from "wagmi"
import { chainsToTSender, berniceAbi } from "../constants"
import { Story, StoryChapter, User } from "./types"

// Hook to get bernice contract address
export function useBerniceContract() {
    const chainId = useChainId()
    const berniceAddress = chainsToTSender[chainId]?.bernice
    
    return {
        address: berniceAddress as `0x${string}`,
        isAvailable: !!berniceAddress,
        chainId
    }
}

// Hook to get total story count
export function useStoryCount() {
    const { address, isAvailable } = useBerniceContract()
    
    const { data: storyCount, isLoading, error, refetch } = useReadContract({
        abi: berniceAbi,
        address,
        functionName: "s_storyCount",
        query: {
            enabled: isAvailable,
        }
    })

    return {
        count: storyCount ? Number(storyCount) : 0,
        isLoading,
        error,
        refetch
    }
}

// Hook to get story data by ID
export function useStoryData(storyId: string) {
    const { address, isAvailable } = useBerniceContract()
    
    const { data: storyData, isLoading, error, refetch } = useReadContract({
        abi: berniceAbi,
        address,
        functionName: "getStory",
        args: [BigInt(storyId || "0")],
        query: {
            enabled: isAvailable && storyId !== "" && storyId !== "0",
        }
    })

    const story: Story | null = useMemo(() => {
        if (!storyData) return null
        
        const [creator, title, totalChapters, currentChapterNumber, votingPeriod, currentChapterVotingEnd, completed] = storyData as [
            string, string, bigint, bigint, bigint, bigint, boolean
        ]

        return {
            id: storyId,
            title,
            description: "Collaborative story", // Contract doesn't store description
            creator: { address: creator } as User,
            createdAt: new Date(), // Contract doesn't store creation date
            isComplete: completed,
            currentChapter: Number(currentChapterNumber),
            maxChapters: Number(totalChapters),
            chapters: [], // Will be fetched separately
            tags: [], // Contract doesn't store tags
            totalVotes: 0, // Will be calculated from submissions
        }
    }, [storyData, storyId])

    return {
        story,
        isLoading,
        error,
        refetch
    }
}

// Hook to get chapter content
export function useChapterContent(storyId: string, chapterNumber: number) {
    const { address, isAvailable } = useBerniceContract()
    
    const { data: content, isLoading, error, refetch } = useReadContract({
        abi: berniceAbi,
        address,
        functionName: "getChapterContent",
        args: [BigInt(storyId || "0"), BigInt(chapterNumber || "0")],
        query: {
            enabled: isAvailable && storyId !== "" && chapterNumber > 0,
        }
    })

    return {
        content: content as string || "",
        isLoading,
        error,
        refetch
    }
}

// Hook to get submissions count for a story
export function useSubmissionsCount(storyId: string) {
    const { address, isAvailable } = useBerniceContract()
    
    const { data: count, isLoading, error, refetch } = useReadContract({
        abi: berniceAbi,
        address,
        functionName: "getSubmissionsCount",
        args: [BigInt(storyId || "0")],
        query: {
            enabled: isAvailable && storyId !== "",
        }
    })

    return {
        count: count ? Number(count) : 0,
        isLoading,
        error,
        refetch
    }
}

// Hook to get submission data
export function useSubmissionData(storyId: string, chapterNumber: number, submissionIndex: number) {
    const { address, isAvailable } = useBerniceContract()
    
    const { data: submissionData, isLoading, error, refetch } = useReadContract({
        abi: berniceAbi,
        address,
        functionName: "getSubmission",
        args: [BigInt(storyId || "0"), BigInt(chapterNumber || "0"), BigInt(submissionIndex || "0")],
        query: {
            enabled: isAvailable && storyId !== "" && chapterNumber > 0 && submissionIndex >= 0,
        }
    })

    const submission = useMemo(() => {
        if (!submissionData) return null
        
        const [author, content, votes] = submissionData as [string, string, bigint]
        
        return {
            id: `${storyId}_${chapterNumber}_${submissionIndex}`,
            storyId,
            chapterNumber,
            content,
            author: { address: author } as User,
            votes: [],
            totalVotes: Number(votes),
            createdAt: new Date(),
            isWinner: false,
        }
    }, [submissionData, storyId, chapterNumber, submissionIndex])

    return {
        submission,
        isLoading,
        error,
        refetch
    }
}

// Hook to check if user has voted
export function useHasVoted(storyId: string, chapterNumber: number, voterAddress?: string) {
    const { address, isAvailable } = useBerniceContract()
    
    const { data: hasVoted, isLoading, error, refetch } = useReadContract({
        abi: berniceAbi,
        address,
        functionName: "s_hasVoted",
        args: [BigInt(storyId || "0"), BigInt(chapterNumber || "0"), (voterAddress || "0x0") as `0x${string}`],
        query: {
            enabled: isAvailable && storyId !== "" && chapterNumber > 0 && !!voterAddress,
        }
    })

    return {
        hasVoted: !!hasVoted,
        isLoading,
        error,
        refetch
    }
}

// Hook to get multiple stories data efficiently
export function useMultipleStories(storyIds: string[]) {
    const { address, isAvailable } = useBerniceContract()
    
    const contracts = useMemo(() => 
        storyIds.map(id => ({
            abi: berniceAbi,
            address,
            functionName: "getStory" as const,
            args: [BigInt(id || "0")],
        })), [storyIds, address]
    )

    const { data: storiesData, isLoading, error, refetch } = useReadContracts({
        contracts,
        query: {
            enabled: isAvailable && storyIds.length > 0,
        }
    })

    const stories: Story[] = useMemo(() => {
        if (!storiesData) return []
        
        return storiesData.map((result: any, index: number) => {
            if (!result.result) return null
            
            const [creator, title, totalChapters, currentChapterNumber, votingPeriod, currentChapterVotingEnd, completed] = result.result as [
                string, string, bigint, bigint, bigint, bigint, boolean
            ]

            return {
                id: storyIds[index],
                title,
                description: "Collaborative story",
                creator: { address: creator } as User,
                createdAt: new Date(),
                isComplete: completed,
                currentChapter: Number(currentChapterNumber),
                maxChapters: Number(totalChapters),
                chapters: [],
                tags: [],
                totalVotes: 0,
            }
        }).filter(Boolean) as Story[]
    }, [storiesData, storyIds])

    return {
        stories,
        isLoading,
        error,
        refetch
    }
}

// Hook to get all stories (up to story count)
export function useAllStories() {
    const { count: storyCount } = useStoryCount()
    
    const storyIds = useMemo(() => {
        if (storyCount === 0) return []
        return Array.from({ length: storyCount }, (_, i) => (i + 1).toString())
    }, [storyCount])

    return useMultipleStories(storyIds)
}

// Hook for real-time voting period tracking
export function useVotingStatus(storyId: string) {
    const { story } = useStoryData(storyId)
    const { data: blockNumber } = useBlockNumber()
    
    const votingStatus = useMemo(() => {
        if (!story || !blockNumber) return null
        
        // Assuming 12 second blocks (Ethereum average)
        const currentTimestamp = Number(blockNumber) * 12
        const votingEndTimestamp = Number(story.currentChapter) // This would need proper timestamp from contract
        
        return {
            isActive: currentTimestamp < votingEndTimestamp,
            timeRemaining: Math.max(0, votingEndTimestamp - currentTimestamp),
            hasEnded: currentTimestamp >= votingEndTimestamp
        }
    }, [story, blockNumber])

    return votingStatus
}

// Hook for comprehensive story data with chapters
export function useCompleteStoryData(storyId: string) {
    const { story, isLoading: isLoadingStory, refetch: refetchStory } = useStoryData(storyId)
    const { count: submissionsCount, refetch: refetchSubmissions } = useSubmissionsCount(storyId)
    
    // Fetch chapter content for all completed chapters
    const chapterContents = useMemo(() => {
        if (!story) return []
        return Array.from({ length: story.currentChapter }, (_, i) => i + 1)
    }, [story])

    const { address, isAvailable } = useBerniceContract()
    
    const chapterContracts = useMemo(() => 
        chapterContents.map(chapterNum => ({
            abi: berniceAbi,
            address,
            functionName: "getChapterContent" as const,
            args: [BigInt(storyId || "0"), BigInt(chapterNum)],
        })), [chapterContents, address, storyId]
    )

    const { data: chaptersData, isLoading: isLoadingChapters } = useReadContracts({
        contracts: chapterContracts,
        query: {
            enabled: isAvailable && chapterContents.length > 0,
        }
    })

    const completeStory = useMemo(() => {
        if (!story || !chaptersData) return story
        
        const chapters: StoryChapter[] = chaptersData.map((result: any, index: number) => {
            const content = result.result as string || ""
            const chapterNumber = index + 1
            
            return {
                id: `chapter_${storyId}_${chapterNumber}`,
                storyId,
                chapterNumber,
                content,
                author: { address: "0x0" } as User, // Contract doesn't store chapter authors
                votes: 0,
                createdAt: new Date(),
                isSelected: true,
                submissions: []
            }
        })

        return {
            ...story,
            chapters
        }
    }, [story, chaptersData, storyId])

    return {
        story: completeStory,
        submissionsCount,
        isLoading: isLoadingStory || isLoadingChapters,
        refetchStory,
        refetchSubmissions
    }
}

// Event listener hook for real-time updates
interface BerniceEventsCallbacks {
    onStoryCreated?: () => void;
    onSubmissionAdded?: () => void;
    onVoteCast?: () => void;
    onChapterFinalized?: () => void;
    onStoryCompleted?: () => void;
}

export function useBerniceEvents(callbacks: BerniceEventsCallbacks = {}) {
    const { address, isAvailable } = useBerniceContract()
    
    const {
        onStoryCreated,
        onSubmissionAdded,
        onVoteCast,
        onChapterFinalized,
        onStoryCompleted,
    } = callbacks

    useWatchContractEvent({
        address,
        abi: berniceAbi,
        eventName: "StoryCreated",
        onLogs(logs: any[]) {
            console.log("StoryCreated events:", logs)
            onStoryCreated?.()
        },
        enabled: isAvailable,
    })

    useWatchContractEvent({
        address,
        abi: berniceAbi,
        eventName: "SubmissionAdded",
        onLogs(logs: any[]) {
            console.log("SubmissionAdded events:", logs)
            onSubmissionAdded?.()
        },
        enabled: isAvailable,
    })

    useWatchContractEvent({
        address,
        abi: berniceAbi,
        eventName: "VoteCast",
        onLogs(logs: any[]) {
            console.log("VoteCast events:", logs)
            onVoteCast?.()
        },
        enabled: isAvailable,
    })

    useWatchContractEvent({
        address,
        abi: berniceAbi,
        eventName: "ChapterFinalized",
        onLogs(logs: any[]) {
            console.log("ChapterFinalized events:", logs)
            onChapterFinalized?.()
        },
        enabled: isAvailable,
    })

    useWatchContractEvent({
        address,
        abi: berniceAbi,
        eventName: "StoryCompleted",
        onLogs(logs: any[]) {
            console.log("StoryCompleted events:", logs)
            onStoryCompleted?.()
        },
        enabled: isAvailable,
    })
}
