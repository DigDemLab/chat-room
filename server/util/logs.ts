import path from "path";
import fs from 'fs';
import type { Log, RoomData } from "../../types/room.type";
import type { BotComment, BotLike, Like, LoggedComment, Comment, Reply, ActionsUpdate} from "../../types/comment.type";
import type { UserExtended } from "../../types/user.type";
import moment from "moment";

const __dirname = path.resolve();
const privateDir = path.join(__dirname, "server", "private")
const logDir = path.join(privateDir, "chatLogs")
export module Logs {
    
    let logs = {}
    // replies maps comment ids to an array of its replies
    let replies = {}
    let rawReplies:Reply[] = []
    let actions = {}
    let rawActions: ActionsUpdate[] = []

    const botLikeToLike = (botDislike: BotLike, parentCommentID: number): Like => {
        return {
            userID: botDislike.botName,
            time: new Date(botDislike.time)
        }
    }
    const botCommentToLoggedComment = (botComment: BotComment) => {
        const loggedComment: LoggedComment = {
            id: botComment.id,
            bot: true,
            time: botComment.time,
            userName: botComment.botName,
            content: botComment.content,
            replies: botComment?.replies?.map((autoComment: BotComment) => botCommentToLoggedComment(autoComment)),
            moderation: botComment?.moderation,
            likes: botComment?.likes?.map(botLikeToLike),
            dislikes: botComment?.dislikes?.map(botLikeToLike)
        }
        return loggedComment
    }

    function commentToLoggedCommnet(comment: Comment): LoggedComment {
        const loggedComment: LoggedComment = {
            id: comment.id,
            bot: false,
            time: comment.time,
            userName: comment.user.name,
            content: comment.content,
            likes: [],
            dislikes: []
        }
        return loggedComment
    }



   /* function loggedCommentToComment(loggedComment: LoggedComment[]): Comment[]{
        //Converting list of LoggedComment to list of comment
        return comments

    }*/
    export function returnLog(){
        // console.log("####Log in logs.ts in Logslog function is #####",logs)
        return logs
    }

    export function returnRawReplies(){
        return rawReplies
    }

    export function returnAction(){
        return rawActions
    }

    export const initLog  = (roomID: string, roomData: RoomData, specFileName: string) => {
        const autoComments: LoggedComment[] = roomData.automaticComments.map(botCommentToLoggedComment)
        const newLog: Log = {
            id: roomData.id,
            specFileName: specFileName,
            name: roomData.name,
            startTime: roomData.startTime,
            duration: roomData.duration,
            postTitle: roomData.post.title,
            users: [],
            originalComments:[],
            comments: autoComments,
            userModerationEvents: roomData.userModerationEvents,
            outboundLink: roomData.outboundLink
        }
        logs[roomID] = newLog
    }

    export const appendTopLevelComment = (roomID: string, comment: Comment) => {
        logs[roomID].comments.push(commentToLoggedCommnet(comment))
        logs[roomID].originalComments.push(comment)

    }
    export const appendUser = (roomID: string, user: UserExtended) => {
        logs[roomID].users.push(user.user)
    }
    export const appendReply = (reply: Reply) => {
        rawReplies.push(reply)
        if (replies[reply.parentID])
            [... replies[reply.parentID], commentToLoggedCommnet(reply.comment)]
        else
            replies[reply.parentID] = [commentToLoggedCommnet(reply.comment)]


    }
    export const replaceActions = (actionsUpdate: ActionsUpdate) => {
        rawActions.push(actionsUpdate)
        actions[actionsUpdate.parentCommentID] = {
            likes: actionsUpdate.likes,
            dislikes: actionsUpdate.dislikes
        }
    }

    const assembleLog = (roomID: string): Log => {
        let fullLog: Log = logs[roomID]

        fullLog.comments.sort((a: LoggedComment, b: LoggedComment) => a.time < b.time ? -1 : 1)
        fullLog.comments.map((comment: LoggedComment) => {
            const reps: LoggedComment[] = replies[comment.id]
            comment["replies"] = reps?.sort((a: LoggedComment, b: LoggedComment) => a.time < b.time ? -1 : 1)
            const act = actions[comment.id]
            comment["likes"] = act?.likes
            comment["dislikes"] = act?.dislikes

            return comment
        })
        return fullLog
    }

    export const writeLog = (roomID: string) => {

        const logData = assembleLog(roomID)
        const src_spec = logData.specFileName.split(".")[0]
        const logJSON = JSON.stringify(logData, null, 2)

        var currentdate = new Date(); 


        const formatTime = moment(currentdate).format("D.MM.YYYY-HH:mm")
        // ${(new Date()).toTimeString()}
        fs.writeFile(`${logDir}/${src_spec}_${formatTime}.log.json`, logJSON, (err) => {
            if (err) throw err;
        });
    }

}

