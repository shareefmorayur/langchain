import { BaseLanguageModel } from "../base_language/index.js";
import { CallbackManager, Callbacks } from "../callbacks/manager.js";
import { LLMChain } from "../chains/llm_chain.js";
import { BasePromptTemplate } from "../prompts/base.js";
import { AgentAction, AgentFinish, AgentStep, BaseMessage, ChainValues } from "../schema/index.js";
import { Serializable } from "../load/serializable.js";
import { StructuredTool, Tool } from "../tools/base.js";
import { AgentActionOutputParser, AgentInput, RunnableAgentInput, SerializedAgent, StoppingMethod } from "./types.js";
import { Runnable } from "../schema/runnable/base.js";
/**
 * Record type for arguments passed to output parsers.
 */
export type OutputParserArgs = Record<string, any>;
/**
 * Abstract base class for agents in LangChain. Provides common
 * functionality for agents, such as handling inputs and outputs.
 */
export declare abstract class BaseAgent extends Serializable {
    ToolType: StructuredTool;
    abstract get inputKeys(): string[];
    get returnValues(): string[];
    get allowedTools(): string[] | undefined;
    /**
     * Return the string type key uniquely identifying this class of agent.
     */
    _agentType(): string;
    /**
     * Return the string type key uniquely identifying multi or single action agents.
     */
    abstract _agentActionType(): string;
    /**
     * Return response when agent has been stopped due to max iterations
     */
    returnStoppedResponse(earlyStoppingMethod: StoppingMethod, _steps: AgentStep[], _inputs: ChainValues, _callbackManager?: CallbackManager): Promise<AgentFinish>;
    /**
     * Prepare the agent for output, if needed
     */
    prepareForOutput(_returnValues: AgentFinish["returnValues"], _steps: AgentStep[]): Promise<AgentFinish["returnValues"]>;
}
/**
 * Abstract base class for single action agents in LangChain. Extends the
 * BaseAgent class and provides additional functionality specific to
 * single action agents.
 */
export declare abstract class BaseSingleActionAgent extends BaseAgent {
    _agentActionType(): string;
    /**
     * Decide what to do, given some input.
     *
     * @param steps - Steps the LLM has taken so far, along with observations from each.
     * @param inputs - User inputs.
     * @param callbackManager - Callback manager.
     *
     * @returns Action specifying what tool to use.
     */
    abstract plan(steps: AgentStep[], inputs: ChainValues, callbackManager?: CallbackManager): Promise<AgentAction | AgentFinish>;
}
/**
 * Abstract base class for multi-action agents in LangChain. Extends the
 * BaseAgent class and provides additional functionality specific to
 * multi-action agents.
 */
export declare abstract class BaseMultiActionAgent extends BaseAgent {
    _agentActionType(): string;
    /**
     * Decide what to do, given some input.
     *
     * @param steps - Steps the LLM has taken so far, along with observations from each.
     * @param inputs - User inputs.
     * @param callbackManager - Callback manager.
     *
     * @returns Actions specifying what tools to use.
     */
    abstract plan(steps: AgentStep[], inputs: ChainValues, callbackManager?: CallbackManager): Promise<AgentAction[] | AgentFinish>;
}
/**
 * Class representing a single action agent which accepts runnables.
 * Extends the BaseSingleActionAgent class and provides methods for
 * planning agent actions with runnables.
 */
export declare class RunnableAgent extends BaseMultiActionAgent {
    protected lc_runnable: boolean;
    lc_namespace: string[];
    runnable: Runnable<ChainValues & {
        steps: AgentStep[];
    }, AgentAction[] | AgentAction | AgentFinish>;
    stop?: string[];
    get inputKeys(): string[];
    constructor(fields: RunnableAgentInput);
    plan(steps: AgentStep[], inputs: ChainValues, callbackManager?: CallbackManager): Promise<AgentAction[] | AgentFinish>;
}
/**
 * Interface for input data for creating a LLMSingleActionAgent.
 */
export interface LLMSingleActionAgentInput {
    llmChain: LLMChain;
    outputParser: AgentActionOutputParser;
    stop?: string[];
}
/**
 * Class representing a single action agent using a LLMChain in LangChain.
 * Extends the BaseSingleActionAgent class and provides methods for
 * planning agent actions based on LLMChain outputs.
 * @example
 * ```typescript
 * const customPromptTemplate = new CustomPromptTemplate({
 *   tools: [new Calculator()],
 *   inputVariables: ["input", "agent_scratchpad"],
 * });
 * const customOutputParser = new CustomOutputParser();
 * const agent = new LLMSingleActionAgent({
 *   llmChain: new LLMChain({
 *     prompt: customPromptTemplate,
 *     llm: new ChatOpenAI({ temperature: 0 }),
 *   }),
 *   outputParser: customOutputParser,
 *   stop: ["\nObservation"],
 * });
 * const executor = new AgentExecutor({
 *   agent,
 *   tools: [new Calculator()],
 * });
 * const result = await executor.invoke({
 *   input:
 *     "Who is Olivia Wilde's boyfriend? What is his current age raised to the 0.23 power?",
 * });
 * ```
 */
export declare class LLMSingleActionAgent extends BaseSingleActionAgent {
    lc_namespace: string[];
    llmChain: LLMChain;
    outputParser: AgentActionOutputParser;
    stop?: string[];
    constructor(input: LLMSingleActionAgentInput);
    get inputKeys(): string[];
    /**
     * Decide what to do given some input.
     *
     * @param steps - Steps the LLM has taken so far, along with observations from each.
     * @param inputs - User inputs.
     * @param callbackManager - Callback manager.
     *
     * @returns Action specifying what tool to use.
     */
    plan(steps: AgentStep[], inputs: ChainValues, callbackManager?: CallbackManager): Promise<AgentAction | AgentFinish>;
}
/**
 * Interface for arguments used to create an agent in LangChain.
 */
export interface AgentArgs {
    outputParser?: AgentActionOutputParser;
    callbacks?: Callbacks;
    /**
     * @deprecated Use `callbacks` instead.
     */
    callbackManager?: CallbackManager;
}
/**
 * Class responsible for calling a language model and deciding an action.
 *
 * @remarks This is driven by an LLMChain. The prompt in the LLMChain *must*
 * include a variable called "agent_scratchpad" where the agent can put its
 * intermediary work.
 */
export declare abstract class Agent extends BaseSingleActionAgent {
    llmChain: LLMChain;
    outputParser: AgentActionOutputParser | undefined;
    private _allowedTools?;
    get allowedTools(): string[] | undefined;
    get inputKeys(): string[];
    constructor(input: AgentInput);
    /**
     * Prefix to append the observation with.
     */
    abstract observationPrefix(): string;
    /**
     * Prefix to append the LLM call with.
     */
    abstract llmPrefix(): string;
    /**
     * Return the string type key uniquely identifying this class of agent.
     */
    abstract _agentType(): string;
    /**
     * Get the default output parser for this agent.
     */
    static getDefaultOutputParser(_fields?: OutputParserArgs): AgentActionOutputParser;
    /**
     * Create a prompt for this class
     *
     * @param _tools - List of tools the agent will have access to, used to format the prompt.
     * @param _fields - Additional fields used to format the prompt.
     *
     * @returns A PromptTemplate assembled from the given tools and fields.
     * */
    static createPrompt(_tools: StructuredTool[], _fields?: Record<string, any>): BasePromptTemplate;
    /** Construct an agent from an LLM and a list of tools */
    static fromLLMAndTools(_llm: BaseLanguageModel, _tools: StructuredTool[], _args?: AgentArgs): Agent;
    /**
     * Validate that appropriate tools are passed in
     */
    static validateTools(_tools: StructuredTool[]): void;
    _stop(): string[];
    /**
     * Name of tool to use to terminate the chain.
     */
    finishToolName(): string;
    /**
     * Construct a scratchpad to let the agent continue its thought process
     */
    constructScratchPad(steps: AgentStep[]): Promise<string | BaseMessage[]>;
    private _plan;
    /**
     * Decide what to do given some input.
     *
     * @param steps - Steps the LLM has taken so far, along with observations from each.
     * @param inputs - User inputs.
     * @param callbackManager - Callback manager to use for this call.
     *
     * @returns Action specifying what tool to use.
     */
    plan(steps: AgentStep[], inputs: ChainValues, callbackManager?: CallbackManager): Promise<AgentAction | AgentFinish>;
    /**
     * Return response when agent has been stopped due to max iterations
     */
    returnStoppedResponse(earlyStoppingMethod: StoppingMethod, steps: AgentStep[], inputs: ChainValues, callbackManager?: CallbackManager): Promise<AgentFinish>;
    /**
     * Load an agent from a json-like object describing it.
     */
    static deserialize(data: SerializedAgent & {
        llm?: BaseLanguageModel;
        tools?: Tool[];
    }): Promise<Agent>;
}
