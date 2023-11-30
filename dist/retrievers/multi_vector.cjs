"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiVectorRetriever = void 0;
const retriever_js_1 = require("../schema/retriever.cjs");
/**
 * A retriever that retrieves documents from a vector store and a document
 * store. It uses the vector store to find relevant documents based on a
 * query, and then retrieves the full documents from the document store.
 * @example
 * ```typescript
 * const retriever = new MultiVectorRetriever({
 *   vectorstore: new FaissStore(),
 *   docstore: new InMemoryStore(),
 *   idKey: "doc_id",
 *   childK: 20,
 *   parentK: 5,
 * });
 *
 * const retrieverResult = await retriever.getRelevantDocuments("justice breyer");
 * console.log(retrieverResult[0].pageContent.length);
 * ```
 */
class MultiVectorRetriever extends retriever_js_1.BaseRetriever {
    static lc_name() {
        return "MultiVectorRetriever";
    }
    constructor(args) {
        super(args);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "retrievers", "multi_vector"]
        });
        Object.defineProperty(this, "vectorstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "docstore", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "idKey", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "childK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "parentK", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.vectorstore = args.vectorstore;
        this.docstore = args.docstore;
        this.idKey = args.idKey ?? "doc_id";
        this.childK = args.childK;
        this.parentK = args.parentK;
    }
    async _getRelevantDocuments(query) {
        const subDocs = await this.vectorstore.similaritySearch(query, this.childK);
        const ids = [];
        for (const doc of subDocs) {
            if (doc.metadata[this.idKey] && !ids.includes(doc.metadata[this.idKey])) {
                ids.push(doc.metadata[this.idKey]);
            }
        }
        const docs = await this.docstore.mget(ids);
        return docs
            .filter((doc) => doc !== undefined)
            .slice(0, this.parentK);
    }
}
exports.MultiVectorRetriever = MultiVectorRetriever;
