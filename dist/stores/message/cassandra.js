import { Client } from "cassandra-driver";
import { BaseListChatMessageHistory, } from "../../schema/index.js";
import { mapChatMessagesToStoredMessages, mapStoredMessagesToChatMessages, } from "./utils.js";
/**
 * Class for storing chat message history within Cassandra. It extends the
 * BaseListChatMessageHistory class and provides methods to get, add, and
 * clear messages.
 * @example
 * ```typescript
 * const chatHistory = new CassandraChatMessageHistory({
 *   cloud: {
 *     secureConnectBundle: "<path to your secure bundle>",
 *   },
 *   credentials: {
 *     username: "token",
 *     password: "<your Cassandra access token>",
 *   },
 *   keyspace: "langchain",
 *   table: "message_history",
 *   sessionId: "<some unique session identifier>",
 * });
 *
 * const chain = new ConversationChain({
 *   llm: new ChatOpenAI(),
 *   memory: chatHistory,
 * });
 *
 * const response = await chain.invoke({
 *   input: "What did I just say my name was?",
 * });
 * console.log({ response });
 * ```
 */
export class CassandraChatMessageHistory extends BaseListChatMessageHistory {
    constructor(options) {
        super();
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "stores", "message", "cassandra"]
        });
        Object.defineProperty(this, "keyspace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "table", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "client", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "sessionId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "tableExists", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "options", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.client = new Client(options);
        this.keyspace = options.keyspace;
        this.table = options.table;
        this.sessionId = options.sessionId;
        this.tableExists = false;
        this.options = options;
    }
    /**
     * Method to get all the messages stored in the Cassandra database.
     * @returns Array of stored BaseMessage instances.
     */
    async getMessages() {
        await this.ensureTable();
        const resultSet = await this.client.execute(this.queries.select, [this.sessionId], { prepare: true });
        const storedMessages = resultSet.rows.map((row) => ({
            type: row.message_type,
            data: JSON.parse(row.data),
        }));
        const baseMessages = mapStoredMessagesToChatMessages(storedMessages);
        return baseMessages;
    }
    /**
     * Method to add a new message to the Cassandra database.
     * @param message The BaseMessage instance to add.
     * @returns A promise that resolves when the message has been added.
     */
    async addMessage(message) {
        await this.ensureTable();
        const messages = mapChatMessagesToStoredMessages([message]);
        const { type, data } = messages[0];
        return this.client
            .execute(this.queries.insert, [this.sessionId, type, JSON.stringify(data)], { prepare: true, ...this.options })
            .then(() => { });
    }
    /**
     * Method to clear all the messages from the Cassandra database.
     * @returns A promise that resolves when all messages have been cleared.
     */
    async clear() {
        await this.ensureTable();
        return this.client
            .execute(this.queries.delete, [this.sessionId], {
            prepare: true,
            ...this.options,
        })
            .then(() => { });
    }
    /**
     * Method to initialize the Cassandra database.
     * @returns Promise that resolves when the database has been initialized.
     */
    async ensureTable() {
        if (this.tableExists) {
            return;
        }
        await this.client.execute(`
    CREATE TABLE IF NOT EXISTS ${this.keyspace}.${this.table} (
        session_id text,
        message_ts timestamp,
        message_type text,
        data text,
        PRIMARY KEY ((session_id), message_ts)
      );
    `);
        this.queries = {
            insert: `INSERT INTO ${this.keyspace}.${this.table} (session_id, message_ts, message_type, data) VALUES (?, toTimestamp(now()), ?, ?);`,
            select: `SELECT message_type, data FROM ${this.keyspace}.${this.table} WHERE session_id = ?;`,
            delete: `DELETE FROM ${this.keyspace}.${this.table} WHERE session_id = ?;`,
        };
        this.tableExists = true;
    }
}
