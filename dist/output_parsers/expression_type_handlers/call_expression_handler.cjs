"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallExpressionHandler = void 0;
const base_js_1 = require("./base.cjs");
/**
 * Handles call expressions in the AST parsed by the `ASTParser`. This
 * class is part of the LangChain Expression Language (LCEL), a
 * declarative way to compose chains together in LangChain.
 */
class CallExpressionHandler extends base_js_1.NodeHandler {
    /**
     * Checks if a given node is a call expression. If it is, it returns the
     * node; otherwise, it returns false.
     * @param node The node to check.
     * @returns The node if it is a call expression, or false otherwise.
     */
    async accepts(node) {
        if (base_js_1.ASTParser.isCallExpression(node)) {
            return node;
        }
        else {
            return false;
        }
    }
    /**
     * Processes a call expression node. It checks the type of the callee (the
     * function being called) and the arguments passed to it. If the callee is
     * an identifier, it extracts the function name. If the callee is a member
     * expression, it delegates handling to the parent handler. It also checks
     * the types of the arguments and delegates their handling to the parent
     * handler. The method returns an object representing the call expression,
     * including the function call and its arguments.
     * @param node The call expression node to process.
     * @returns An object representing the call expression, including the function call and its arguments.
     */
    async handle(node) {
        function checkCallExpressionArgumentType(arg) {
            return [
                base_js_1.ASTParser.isStringLiteral,
                base_js_1.ASTParser.isNumericLiteral,
                base_js_1.ASTParser.isBooleanLiteral,
                base_js_1.ASTParser.isArrayExpression,
                base_js_1.ASTParser.isObjectExpression,
                base_js_1.ASTParser.isCallExpression,
                base_js_1.ASTParser.isIdentifier,
            ].reduce((acc, func) => acc || func(arg), false);
        }
        if (this.parentHandler === undefined) {
            throw new Error("ArrayLiteralExpressionHandler must have a parent handler");
        }
        const { callee } = node;
        let funcCall;
        if (base_js_1.ASTParser.isIdentifier(callee)) {
            funcCall = callee.name.replace(/^["'](.+(?=["']$))["']$/, "$1");
        }
        else if (base_js_1.ASTParser.isMemberExpression(callee)) {
            funcCall = (await this.parentHandler.handle(callee));
        }
        else {
            throw new Error("Unknown expression type");
        }
        const args = await Promise.all(node.arguments.map((arg) => {
            if (!checkCallExpressionArgumentType(arg)) {
                throw new Error("Unknown argument type");
            }
            if (!this.parentHandler) {
                throw new Error("CallExpressionHandler must have a parent handler");
            }
            return this.parentHandler.handle(arg);
        }));
        return { type: "call_expression", funcCall, args };
    }
}
exports.CallExpressionHandler = CallExpressionHandler;
