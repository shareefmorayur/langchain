import { SimpleChatModel, BaseChatModelParams } from "./base.js";
import { BaseLanguageModelCallOptions } from "../base_language/index.js";
import { BaseMessage, ChatGenerationChunk } from "../schema/index.js";
import { CloudflareWorkersAIInput } from "../llms/cloudflare_workersai.js";
import { CallbackManagerForLLMRun } from "../callbacks/manager.js";
/**
 * An interface defining the options for a Cloudflare Workers AI call. It extends
 * the BaseLanguageModelCallOptions interface.
 */
export interface ChatCloudflareWorkersAICallOptions extends BaseLanguageModelCallOptions {
}
/**
 * A class that enables calls to the Cloudflare Workers AI API to access large language
 * models in a chat-like fashion. It extends the SimpleChatModel class and
 * implements the CloudflareWorkersAIInput interface.
 * @example
 * ```typescript
 * const model = new ChatCloudflareWorkersAI({
 *   model: "@cf/meta/llama-2-7b-chat-int8",
 *   cloudflareAccountId: process.env.CLOUDFLARE_ACCOUNT_ID,
 *   cloudflareApiToken: process.env.CLOUDFLARE_API_TOKEN
 * });
 *
 * const response = await model.invoke([
 *   ["system", "You are a helpful assistant that translates English to German."],
 *   ["human", `Translate "I love programming".`]
 * ]);
 *
 * console.log(response);
 * ```
 */
export declare class ChatCloudflareWorkersAI extends SimpleChatModel implements CloudflareWorkersAIInput {
    static lc_name(): string;
    lc_serializable: boolean;
    model: string;
    cloudflareAccountId?: string;
    cloudflareApiToken?: string;
    baseUrl: string;
    streaming: boolean;
    constructor(fields?: CloudflareWorkersAIInput & BaseChatModelParams);
    get lc_secrets(): {
        [key: string]: string;
    } | undefined;
    _llmType(): string;
    /** Get the identifying parameters for this LLM. */
    get identifyingParams(): {
        model: string;
    };
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(_options?: this["ParsedCallOptions"]): {
        model: string;
    };
    _combineLLMOutput(): {};
    /**
     * Method to validate the environment.
     */
    validateEnvironment(): void;
    _request(messages: BaseMessage[], options: this["ParsedCallOptions"], stream?: boolean): Promise<Response>;
    _streamResponseChunks(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
    protected _formatMessages(messages: BaseMessage[]): {
        role: string;
        content: string;
    }[];
    /** @ignore */
    _call(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<string>;
}
