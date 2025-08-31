# Bernice ABI Analysis

## Events

### 1. ChapterFinalized
- **Purpose**: Emitted when a chapter voting period ends and a winner is selected
- **Indexed Parameters**: storyId, chapterNumber
- **Data**: winner (address), votes (uint256), content (string)

### 2. StoryCompleted
- **Purpose**: Emitted when a story reaches its final chapter
- **Indexed Parameters**: storyId

### 3. StoryCreated
- **Purpose**: Emitted when a new story is created
- **Indexed Parameters**: storyId, creator
- **Data**: title (string), totalChapters (uint256), votingPeriodSeconds (uint256)

### 4. SubmissionAdded
- **Purpose**: Emitted when someone submits a chapter continuation
- **Indexed Parameters**: storyId, chapterNumber, submissionIndex
- **Data**: author (address), content (string)

### 5. VoteCast
- **Purpose**: Emitted when someone votes on a submission
- **Indexed Parameters**: storyId, chapterNumber, submissionIndex
- **Data**: voter (address)

### 6. VotingExtended
- **Purpose**: Emitted when voting period is extended
- **Indexed Parameters**: storyId, chapterNumber
- **Data**: newVotingEnd (uint256)

## Functions

### Write Functions (nonpayable)

#### 1. createStory
- **Parameters**: title (string), totalChapters (uint256), votingPeriodSeconds (uint256), chapterOneContent (string)
- **Returns**: storyId (uint256)
- **Purpose**: Creates a new collaborative story with first chapter

#### 2. submitContinuation
- **Parameters**: storyId (uint256), content (string)
- **Returns**: void
- **Purpose**: Submit a chapter continuation for voting

#### 3. vote
- **Parameters**: storyId (uint256), submissionIndex (uint256)
- **Returns**: void
- **Purpose**: Vote for a specific submission

#### 4. finalizeCurrentChapter
- **Parameters**: storyId (uint256)
- **Returns**: void
- **Purpose**: Finalize the current chapter (select winner, advance story)

#### 5. extendVoting
- **Parameters**: storyId (uint256), extraSeconds (uint256)
- **Returns**: void
- **Purpose**: Extend the voting period for current chapter

### Read Functions (view)

#### 1. getStory
- **Parameters**: storyId (uint256)
- **Returns**: creator (address), title (string), totalChapters (uint256), currentChapterNumber (uint256), votingPeriod (uint256), currentChapterVotingEnd (uint256), completed (bool)
- **Purpose**: Get complete story information

#### 2. getChapterContent
- **Parameters**: storyId (uint256), chapterNumber (uint256)
- **Returns**: content (string)
- **Purpose**: Get the finalized content of a specific chapter

#### 3. getSubmission
- **Parameters**: storyId (uint256), chapterNumber (uint256), submissionIndex (uint256)
- **Returns**: author (address), content (string), votes (uint256)
- **Purpose**: Get details of a specific submission

#### 4. getSubmissionsCount
- **Parameters**: storyId (uint256)
- **Returns**: count (uint256)
- **Purpose**: Get number of submissions for current chapter

#### 5. s_storyCount
- **Parameters**: none
- **Returns**: uint256
- **Purpose**: Get total number of stories created

#### 6. s_hasVoted
- **Parameters**: storyId (uint256), chapterNumber (uint256), voter (address)
- **Returns**: bool
- **Purpose**: Check if an address has already voted

#### 7. s_stories (mapping access)
- **Parameters**: storyId (uint256)
- **Returns**: Same as getStory
- **Purpose**: Direct access to story mapping (same as getStory)

## Integration Requirements

### State Management Needed
1. Story creation form state
2. Chapter submission state  
3. Voting interface state
4. Real-time story data
5. User voting status

### Wagmi Hooks to Use
1. `useWriteContract` - For all write functions
2. `useReadContract` - For individual read calls
3. `useReadContracts` - For batch reading
4. `useWaitForTransactionReceipt` - For transaction confirmations
5. `useWatchContractEvent` - For real-time event listening
6. `useBlockNumber` - For timing/voting period checks

### Error Handling Needed
1. Voting period validation
2. Duplicate voting prevention
3. Story completion checks
4. Permission validations
5. Network/transaction errors
