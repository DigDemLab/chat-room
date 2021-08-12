import type { BotComment, Comment, Like, UnparsedBotComment } from "./comment.type"

export type Post = {
    id: string
    time: Date
    title: string
    lead: string
    content: string
    imageName: string
    likes: Like[]
    dislikes: Like[]
}

export type RoomData = {
    id: string
    name: string
    startTime: Date
    duration: number
    post: Post
    automaticComments: BotComment[]
    userModerationEvents: Moderation[]
}

export enum ModerationType { Ban, Flag, Remove }

export type Moderation = {
    type: ModerationType
    time: Date
    target: string | number // either user id or comment id
    text: string
}

export type Notification = {
    text: string
}

/**
 * Types for unparsed Data
 */

// Type of post specification JSON file
export type UnparsedPost = {
    id: string
    time: string
    title: string
    lead: string
    content: string
    imageName: string,
    likes: number,
    dislikes: number
}

// Type of input room specification JSON file.
export type UnparsedRoomData = {
    roomName: string
    startTime: string
    duration: number
    postName: string
    bots: UnparsedBot[]
    comments: UnparsedBotComment[]
}

// Type of Bot specification JSON
export type UnparsedBot = {
    name: string
    moderation?: UnparsedModeration
}

// Type of moderation specification for users and comments
export type UnparsedModeration = {
    type: string
    time: number
    text: string
}