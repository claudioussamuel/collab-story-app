# Infinite Re-render Fix

## Problem
The `HomeContent.tsx` component was experiencing infinite re-renders due to:

1. **Unstable callback functions** in `BerniceEnhancedIntegration` props
2. **Events array dependency** causing continuous useEffect triggers
3. **Growing events array** from `useBerniceEvents` hook

## Root Causes

### 1. **Unstable Callback Functions**
```typescript
// BEFORE - Recreated on every render
<BerniceEnhancedIntegration
  onStoryCreated={(storyId) => {
    console.log("Story created with ID:", storyId)
  }}
  // ... more callbacks
/>
```

### 2. **Events Array Dependency**
```typescript
// BEFORE - events array kept growing, causing infinite loops
useEffect(() => {
  // ... refresh logic
}, [events, refetchStories, refetchStory]) // events array changes constantly
```

### 3. **Accumulating Events Array**
```typescript
// BEFORE - Events kept accumulating in useBerniceEvents
const [events, setEvents] = useState<any[]>([])
setEvents(prev => [...prev, ...logs.map(log => ({ type: "StoryCreated", ...log }))])
```

## Solutions Applied

### 1. **Stabilized Callback Functions with useCallback**
```typescript
// AFTER - Stable callbacks with proper dependencies
<BerniceEnhancedIntegration
  onStoryCreated={useCallback((storyId: bigint) => {
    console.log("Story created with ID:", storyId)
    refetchStories()
  }, [refetchStories])}
  onChapterSubmitted={useCallback((storyId: bigint) => {
    console.log("Chapter submitted for story:", storyId)
    refetchStory()
    refetchStories()
  }, [refetchStory, refetchStories])}
  onVoteCast={useCallback((storyId: bigint, submissionIndex: bigint) => {
    console.log("Vote cast for story:", storyId, "submission:", submissionIndex)
    refetchStory()
    refetchStories()
  }, [refetchStory, refetchStories])}
/>
```

### 2. **Callback-Based Event Handling**
```typescript
// AFTER - Direct callbacks instead of events array dependency
const handleStoryCreated = useCallback(() => {
  console.log("Story created - refreshing data")
  refetchStories()
}, [refetchStories])

const handleSubmissionOrVote = useCallback(() => {
  console.log("Submission added or vote cast - refreshing data")
  refetchStory()
  refetchStories()
}, [refetchStory, refetchStories])

// Use events hook with callbacks
useBerniceEvents({
  onStoryCreated: handleStoryCreated,
  onSubmissionAdded: handleSubmissionOrVote,
  onVoteCast: handleSubmissionOrVote,
  onChapterFinalized: handleChapterFinalized,
})
```

### 3. **Refactored useBerniceEvents Hook**
```typescript
// AFTER - Callback-based approach, no accumulating array
interface BerniceEventsCallbacks {
  onStoryCreated?: () => void;
  onSubmissionAdded?: () => void;
  onVoteCast?: () => void;
  onChapterFinalized?: () => void;
  onStoryCompleted?: () => void;
}

export function useBerniceEvents(callbacks: BerniceEventsCallbacks = {}) {
  const { onStoryCreated, onSubmissionAdded, onVoteCast, onChapterFinalized } = callbacks

  useWatchContractEvent({
    address,
    abi: berniceAbi,
    eventName: "StoryCreated",
    onLogs(logs) {
      console.log("StoryCreated events:", logs)
      onStoryCreated?.() // Direct callback, no state updates
    },
    enabled: isAvailable,
  })
  // ... other events
}
```

## Key Improvements

### ✅ **Stable References**
- All callback functions now use `useCallback` with proper dependencies
- No more function recreation on every render
- Stable props passed to child components

### ✅ **Efficient Event Handling**
- Removed accumulating events array
- Direct callback invocation on events
- No more useEffect dependency on changing arrays

### ✅ **Optimized Re-rendering**
- Eliminated infinite render loops
- Only re-render when actual data changes
- Proper dependency arrays in all hooks

### ✅ **Maintained Functionality**
- All real-time updates still work
- Event-driven data refresh preserved
- No loss of features or responsiveness

## Files Modified

### 1. `app/components/HomeContent.tsx`
- Added `useCallback` for all `BerniceEnhancedIntegration` props
- Replaced events array dependency with callback-based event handling
- Created stable event handler functions

### 2. `lib/bernice-contract-hooks.ts`
- Refactored `useBerniceEvents` to accept callbacks instead of returning events array
- Removed state management for events accumulation
- Added proper TypeScript interface for callbacks

## Result

- ✅ **No more infinite re-renders**
- ✅ **Maintained real-time functionality**
- ✅ **Better performance** with fewer unnecessary renders
- ✅ **Cleaner code** with proper React patterns
- ✅ **Stable user experience** without render interruptions

The application now runs smoothly without infinite re-render issues while preserving all real-time blockchain event handling capabilities.
