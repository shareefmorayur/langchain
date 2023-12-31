import { isBaseMessage, } from "../../schema/index.js";
import { AgentActionOutputParser, AgentMultiActionOutputParser, } from "../types.js";
import { OutputParserException } from "../../schema/output_parser.js";
/**
 * @example
 * ```typescript
 *
 * const prompt = ChatPromptTemplate.fromMessages([
 *   ["ai", "You are a helpful assistant"],
 *   ["human", "{input}"],
 *   new MessagesPlaceholder("agent_scratchpad"),
 * ]);
 *
 * const modelWithFunctions = new ChatOpenAI({
 *   modelName: "gpt-4",
 *   temperature: 0,
 * }).bind({
 *   functions: tools.map((tool) => formatToOpenAIFunction(tool)),
 * });
 *
 * const runnableAgent = RunnableSequence.from([
 *   {
 *     input: (i) => i.input,
 *     agent_scratchpad: (i) => formatAgentSteps(i.steps),
 *   },
 *   prompt,
 *   modelWithFunctions,
 *   new OpenAIFunctionsAgentOutputParser(),
 * ]);
 *
 * const result = await runnableAgent.invoke({
 *   input: "What is the weather in New York?",
 *   steps: agentSteps,
 * });
 *
 * ```
 */
export class OpenAIFunctionsAgentOutputParser extends AgentActionOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "openai"]
        });
    }
    static lc_name() {
        return "OpenAIFunctionsAgentOutputParser";
    }
    async parse(text) {
        throw new Error(`OpenAIFunctionsAgentOutputParser can only parse messages.\nPassed input: ${text}`);
    }
    async parseResult(generations) {
        if ("message" in generations[0] && isBaseMessage(generations[0].message)) {
            return this.parseAIMessage(generations[0].message);
        }
        throw new Error("parseResult on OpenAIFunctionsAgentOutputParser only works on ChatGeneration output");
    }
    /**
     * Parses the output message into a FunctionsAgentAction or AgentFinish
     * object.
     * @param message The BaseMessage to parse.
     * @returns A FunctionsAgentAction or AgentFinish object.
     */
    parseAIMessage(message) {
        if (message.content && typeof message.content !== "string") {
            throw new Error("This agent cannot parse non-string model responses.");
        }
        if (message.additional_kwargs.function_call) {
            // eslint-disable-next-line prefer-destructuring
            const function_call = message.additional_kwargs.function_call;
            try {
                const toolInput = function_call.arguments
                    ? JSON.parse(function_call.arguments)
                    : {};
                return {
                    tool: function_call.name,
                    toolInput,
                    log: `Invoking "${function_call.name}" with ${function_call.arguments ?? "{}"}\n${message.content}`,
                    messageLog: [message],
                };
            }
            catch (error) {
                throw new OutputParserException(`Failed to parse function arguments from chat model response. Text: "${function_call.arguments}". ${error}`);
            }
        }
        else {
            return {
                returnValues: { output: message.content },
                log: message.content,
            };
        }
    }
    getFormatInstructions() {
        throw new Error("getFormatInstructions not implemented inside OpenAIFunctionsAgentOutputParser.");
    }
}
/**
 * @example
 * ```typescript
 *
 * const prompt = ChatPromptTemplate.fromMessages([
 *   ["ai", "You are a helpful assistant"],
 *   ["human", "{input}"],
 *   new MessagesPlaceholder("agent_scratchpad"),
 * ]);
 *
 * const runnableAgent = RunnableSequence.from([
 *   {
 *     input: (i: { input: string; steps: ToolsAgentStep[] }) => i.input,
 *     agent_scratchpad: (i: { input: string; steps: ToolsAgentStep[] }) =>
 *       formatToOpenAIToolMessages(i.steps),
 *   },
 *   prompt,
 *   new ChatOpenAI({
 *     modelName: "gpt-3.5-turbo-1106",
 *     temperature: 0,
 *   }).bind({ tools: tools.map(formatToOpenAITool) }),
 *   new OpenAIToolsAgentOutputParser(),
 * ]).withConfig({ runName: "OpenAIToolsAgent" });
 *
 * const result = await runnableAgent.invoke({
 *   input:
 *     "What is the sum of the current temperature in San Francisco, New York, and Tokyo?",
 * });
 *
 * ```
 */
export class OpenAIToolsAgentOutputParser extends AgentMultiActionOutputParser {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "lc_namespace", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: ["langchain", "agents", "openai"]
        });
    }
    static lc_name() {
        return "OpenAIToolsAgentOutputParser";
    }
    async parse(text) {
        throw new Error(`OpenAIFunctionsAgentOutputParser can only parse messages.\nPassed input: ${text}`);
    }
    async parseResult(generations) {
        if ("message" in generations[0] && isBaseMessage(generations[0].message)) {
            return this.parseAIMessage(generations[0].message);
        }
        throw new Error("parseResult on OpenAIFunctionsAgentOutputParser only works on ChatGeneration output");
    }
    /**
     * Parses the output message into a ToolsAgentAction[] or AgentFinish
     * object.
     * @param message The BaseMessage to parse.
     * @returns A ToolsAgentAction[] or AgentFinish object.
     */
    parseAIMessage(message) {
        if (message.content && typeof message.content !== "string") {
            throw new Error("This agent cannot parse non-string model responses.");
        }
        if (message.additional_kwargs.tool_calls) {
            const toolCalls = message.additional_kwargs.tool_calls;
            try {
                return toolCalls.map((toolCall, i) => {
                    const toolInput = toolCall.function.arguments
                        ? JSON.parse(toolCall.function.arguments)
                        : {};
                    const messageLog = i === 0 ? [message] : [];
                    return {
                        tool: toolCall.function.name,
                        toolInput,
                        toolCallId: toolCall.id,
                        log: `Invoking "${toolCall.function.name}" with ${toolCall.function.arguments ?? "{}"}\n${message.content}`,
                        messageLog,
                    };
                });
            }
            catch (error) {
                throw new OutputParserException(`Failed to parse tool arguments from chat model response. Text: "${JSON.stringify(toolCalls)}". ${error}`);
            }
        }
        else {
            return {
                returnValues: { output: message.content },
                log: message.content,
            };
        }
    }
    getFormatInstructions() {
        throw new Error("getFormatInstructions not implemented inside OpenAIToolsAgentOutputParser.");
    }
}
