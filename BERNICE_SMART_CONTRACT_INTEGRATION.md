# Bernice Smart Contract Integration

This document describes the smart contract integration implemented for the Bernice collaborative storytelling platform.

## Overview

The integration follows the same pattern as `AirdropForm.tsx` from the ts-tsender-ui-cu project, using wagmi hooks for blockchain interactions. The implementation includes:

1. **Smart Contract Forms** - Components for writing to the blockchain
2. **Smart Contract Readers** - Components for reading blockchain data  
3. **Demo Interface** - A comprehensive demo showcasing all functionality
4. **Integration** - Added to the main application as a "Smart Contract" tab

## Files Created

### 1. `app/components/BerniceContractForms.tsx`
Contains form components for blockchain write operations:

- **CreateStoryForm** - Creates new collaborative stories
- **SubmitChapterForm** - Submits chapter continuations
- **VoteForm** - Votes on chapter submissions
- **FinalizeChapterForm** - Finalizes chapters when voting ends

### 2. `app/components/BerniceContractReaders.tsx`
Contains components for reading blockchain data:

- **StoryReader** - Displays story details and progress
- **ChapterContentReader** - Shows finalized chapter content
- **SubmissionReader** - Displays individual submissions
- **StoryCountReader** - Shows total number of stories
- **SubmissionsCountReader** - Shows submission count per story
- **HasVotedReader** - Checks if user has voted

### 3. `app/components/BerniceDemo.tsx`
A comprehensive demo interface with:

- Overview page with feature cards
- Create story workflow
- Read stories and chapters
- Submit chapter continuations
- Vote on submissions
- Finalize chapters
- Real-time blockchain data display

### 4. Updated `constants.ts`
Added bernice contract addresses for all supported chains:

```typescript
interface ContractsConfig {
    [chainId: number]: {
        tsender: string
        bernice?: string  // Added bernice addresses
    }
}
```

## Smart Contract Functions Integrated

Based on the `berniceAbi`, the following contract functions are integrated:

### Write Functions
- `createStory(title, totalChapters, votingPeriodSeconds, chapterOneContent)`
- `submitContinuation(storyId, content)`
- `vote(storyId, submissionIndex)`
- `finalizeCurrentChapter(storyId)`
- `extendVoting(storyId, extraSeconds)`

### Read Functions
- `getStory(storyId)` - Returns story details
- `getChapterContent(storyId, chapterNumber)` - Returns finalized chapter content
- `getSubmission(storyId, chapterNumber, submissionIndex)` - Returns submission details
- `getSubmissionsCount(storyId)` - Returns number of submissions
- `s_storyCount()` - Returns total story count
- `s_hasVoted(storyId, chapterNumber, voter)` - Checks voting status

## Integration Pattern

The implementation follows the exact pattern from `AirdropForm.tsx`:

### 1. Wagmi Hooks Used
```typescript
import {
    useChainId,
    useWriteContract,
    useAccount,
    useWaitForTransactionReceipt,
    useReadContract,
    useReadContracts,
} from "wagmi"
```

### 2. Contract Address Resolution
```typescript
const berniceAddress = chainsToTSender[chainId]?.bernice
```

### 3. Transaction Handling
```typescript
const { data: hash, isPending, error, writeContractAsync } = useWriteContract()
const { isLoading: isConfirming, isSuccess: isConfirmed, isError } = useWaitForTransactionReceipt({
    confirmations: 1,
    hash,
})
```

### 4. Form State Management
- Local storage persistence for form data
- Loading states with spinners
- Error handling with console logging
- Success states with user feedback

### 5. UI Components
- Consistent styling with the existing design system
- Gradient overlays and borders matching AirdropForm
- Responsive layout with proper spacing
- Disabled states when wallet not connected

## Usage

### Access the Demo
1. Navigate to the application
2. Connect your wallet
3. Click the "Smart Contract" tab
4. Explore the different contract interaction modes

### Contract Addresses
The implementation includes placeholder contract addresses that need to be updated with actual deployed contract addresses:

```typescript
// Update these with real deployed addresses
bernice: "0x..." // Add actual bernice contract address
```

### Features Demonstrated
1. **Create Story** - Full story creation with title, chapter limits, voting periods
2. **Read Stories** - View story progress, details, and chapter content
3. **Submit Chapters** - Contribute continuations to existing stories
4. **Vote** - Vote on chapter submissions during voting periods
5. **Finalize** - Complete voting rounds and advance stories

## Error Handling

The implementation includes comprehensive error handling:
- Wallet connection checks
- Contract availability validation
- Transaction error logging
- User-friendly error messages
- Loading state management

## Local Storage

Form data is persisted to local storage for better UX:
- Story creation form data
- Chapter submission content
- User preferences

## Next Steps

1. **Deploy Contracts** - Deploy the bernice smart contract to desired networks
2. **Update Addresses** - Replace placeholder addresses with actual contract addresses
3. **Test Integration** - Test all functions with deployed contracts
4. **Add Events** - Listen to contract events for real-time updates
5. **Enhance UI** - Add more sophisticated error handling and loading states

## Technical Notes

- All components are client-side rendered (`"use client"`)
- TypeScript types are properly defined for all contract interactions
- Components are modular and reusable
- Styling follows the existing application design system
- Code follows the same patterns as the reference AirdropForm implementation

This integration provides a complete interface for interacting with the Bernice smart contract while maintaining consistency with the existing codebase architecture and design patterns.
