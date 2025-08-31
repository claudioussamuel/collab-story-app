interface ContractsConfig {
    [chainId: number]: {
      
        bernice: string
    }
}

export const chainsToTSender: ContractsConfig = {
    84532: {
       
        bernice: "0x1502b55CB677ae1c514cd87aA103a3A33aD82876" // Add actual bernice contract address for Base Sepolia
    },
    1: {
       
        bernice: "0x..." // Add actual bernice contract address for Mainnet
    },
    42161: {
       
        bernice: "0x..." // Add actual bernice contract address for Arbitrum
    },
    10: {
       
        bernice: "0x..." // Add actual bernice contract address for Optimism
    },
    8453: {
       
        bernice: "0x..." // Add actual bernice contract address for Base
    },
    31337: {
       
        bernice: "0x5FbDB2315678afecb367f032d93F642f64180aa4" // Example local address
    },
    11155111: {
       
        bernice: "0x..." // Add actual bernice contract address for Sepolia
    }
}



export const berniceAbi = [
    {"anonymous":false,
        "inputs":[{"indexed":true,"internalType":"uint256","name":"storyId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"chapterNumber","type":"uint256"},{"indexed":false,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"votes","type":"uint256"},{"indexed":false,"internalType":"string","name":"content","type":"string"}],"name":"ChapterFinalized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"storyId","type":"uint256"}],"name":"StoryCompleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"storyId","type":"uint256"},{"indexed":true,"internalType":"address","name":"creator","type":"address"},{"indexed":false,"internalType":"string","name":"title","type":"string"},{"indexed":false,"internalType":"uint256","name":"totalChapters","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"votingPeriodSeconds","type":"uint256"}],"name":"StoryCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"storyId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"chapterNumber","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"submissionIndex","type":"uint256"},{"indexed":false,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"}],"name":"SubmissionAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"storyId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"chapterNumber","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"submissionIndex","type":"uint256"},{"indexed":false,"internalType":"address","name":"voter","type":"address"}],"name":"VoteCast","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"storyId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"chapterNumber","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"newVotingEnd","type":"uint256"}],"name":"VotingExtended","type":"event"},{"inputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"uint256","name":"totalChapters","type":"uint256"},{"internalType":"uint256","name":"votingPeriodSeconds","type":"uint256"},{"internalType":"string","name":"chapterOneContent","type":"string"}],"name":"createStory","outputs":[{"internalType":"uint256","name":"storyId","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"storyId","type":"uint256"},{"internalType":"uint256","name":"extraSeconds","type":"uint256"}],"name":"extendVoting","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"storyId","type":"uint256"}],"name":"finalizeCurrentChapter","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"storyId","type":"uint256"},{"internalType":"uint256","name":"chapterNumber","type":"uint256"}],"name":"getChapterContent","outputs":[{"internalType":"string","name":"content","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"storyId","type":"uint256"}],"name":"getStory","outputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"uint256","name":"totalChapters","type":"uint256"},{"internalType":"uint256","name":"currentChapterNumber","type":"uint256"},{"internalType":"uint256","name":"votingPeriod","type":"uint256"},{"internalType":"uint256","name":"currentChapterVotingEnd","type":"uint256"},{"internalType":"bool","name":"completed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"storyId","type":"uint256"},{"internalType":"uint256","name":"chapterNumber","type":"uint256"},{"internalType":"uint256","name":"submissionIndex","type":"uint256"}],"name":"getSubmission","outputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"string","name":"content","type":"string"},{"internalType":"uint256","name":"votes","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"storyId","type":"uint256"}],"name":"getSubmissionsCount","outputs":[{"internalType":"uint256","name":"count","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"s_hasVoted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"s_stories","outputs":[{"internalType":"address","name":"creator","type":"address"},{"internalType":"string","name":"title","type":"string"},{"internalType":"uint256","name":"totalChapters","type":"uint256"},{"internalType":"uint256","name":"currentChapterNumber","type":"uint256"},{"internalType":"uint256","name":"votingPeriod","type":"uint256"},{"internalType":"uint256","name":"currentChapterVotingEnd","type":"uint256"},{"internalType":"bool","name":"completed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"s_storyCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"storyId","type":"uint256"},{"internalType":"string","name":"content","type":"string"}],"name":"submitContinuation","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"storyId","type":"uint256"},{"internalType":"uint256","name":"submissionIndex","type":"uint256"}],"name":"vote","outputs":[],"stateMutability":"nonpayable","type":"function"}]
