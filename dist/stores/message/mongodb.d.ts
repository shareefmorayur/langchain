import { Collection, Document as MongoDBDocument } from "mongodb";
import { BaseMessage, BaseListChatMessageHistory } from "../../schema/index.js";
export interface MongoDBChatMessageHistoryInput {
    collection: Collection<MongoDBDocument>;
    sessionId: string;
}
/**
 * @example
 * ```typescript
 * const chatHistory = new MongoDBChatMessageHistory({
 *   collection: myCollection,
 *   sessionId: 'unique-session-id',
 * });
 * const messages = await chatHistory.getMessages();
 * await chatHistory.clear();
 * ```
 */
export declare class MongoDBChatMessageHistory extends BaseListChatMessageHistory {
    lc_namespace: string[];
    private collection;
    private sessionId;
    constructor({ collection, sessionId }: MongoDBChatMessageHistoryInput);
    getMessages(): Promise<BaseMessage[]>;
    addMessage(message: BaseMessage): Promise<void>;
    clear(): Promise<void>;
}
