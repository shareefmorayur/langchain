import { EventStreamCodec } from "@smithy/eventstream-codec";
import { BaseBedrockInput, type CredentialType } from "../../util/bedrock.js";
import { SimpleChatModel, BaseChatModelParams } from "../base.js";
import { CallbackManagerForLLMRun } from "../../callbacks/manager.js";
import { BaseMessage, ChatGenerationChunk } from "../../schema/index.js";
import type { SerializedFields } from "../../load/map_keys.js";
export declare function convertMessagesToPromptAnthropic(messages: BaseMessage[], humanPrompt?: string, aiPrompt?: string): string;
/**
 * Function that converts an array of messages into a single string prompt
 * that can be used as input for a chat model. It delegates the conversion
 * logic to the appropriate provider-specific function.
 * @param messages Array of messages to be converted.
 * @param options Options to be used during the conversion.
 * @returns A string prompt that can be used as input for a chat model.
 */
export declare function convertMessagesToPrompt(messages: BaseMessage[], provider: string): string;
/**
 * A type of Large Language Model (LLM) that interacts with the Bedrock
 * service. It extends the base `LLM` class and implements the
 * `BaseBedrockInput` interface. The class is designed to authenticate and
 * interact with the Bedrock service, which is a part of Amazon Web
 * Services (AWS). It uses AWS credentials for authentication and can be
 * configured with various parameters such as the model to use, the AWS
 * region, and the maximum number of tokens to generate.
 * @example
 * ```typescript
 * const model = new BedrockChat({
 *   model: "anthropic.claude-v2",
 *   region: "us-east-1",
 * });
 * const res = await model.invoke([{ content: "Tell me a joke" }]);
 * console.log(res);
 * ```
 */
export declare class BedrockChat extends SimpleChatModel implements BaseBedrockInput {
    model: string;
    region: string;
    credentials: CredentialType;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    fetchFn: typeof fetch;
    endpointHost?: string;
    /** @deprecated */
    stopSequences?: string[];
    modelKwargs?: Record<string, unknown>;
    codec: EventStreamCodec;
    streaming: boolean;
    lc_serializable: boolean;
    get lc_aliases(): Record<string, string>;
    get lc_secrets(): {
        [key: string]: string;
    } | undefined;
    get lc_attributes(): SerializedFields | undefined;
    _llmType(): string;
    static lc_name(): string;
    constructor(fields?: Partial<BaseBedrockInput> & BaseChatModelParams);
    /** Call out to Bedrock service model.
      Arguments:
        prompt: The prompt to pass into the model.
  
      Returns:
        The string generated by the model.
  
      Example:
        response = model.call("Tell me a joke.")
    */
    _call(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): Promise<string>;
    _signedFetch(messages: BaseMessage[], options: this["ParsedCallOptions"], fields: {
        bedrockMethod: "invoke" | "invoke-with-response-stream";
        endpointHost: string;
        provider: string;
    }): Promise<Response>;
    _streamResponseChunks(messages: BaseMessage[], options: this["ParsedCallOptions"], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
    _readChunks(reader: any): {
        [Symbol.asyncIterator](): AsyncGenerator<Uint8Array, void, unknown>;
    };
    _combineLLMOutput(): {};
}
/**
 * @deprecated Use `BedrockChat` instead.
 */
export declare const ChatBedrock: typeof BedrockChat;
