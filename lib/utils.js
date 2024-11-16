import { NodeTypes } from '@vue/compiler-dom';

// Recursively check for `v-memo` on the current or parent node
export function hasVMemo(node) {
    if (!node) return false;
    if (node.props) {
        for (const prop of node.props) {
            if (prop.type === NodeTypes.DIRECTIVE && prop.name === 'memo') {
                return true;
            }
        }
    }
    return node.parent ? hasVMemo(node.parent) : false;
}

export function extractTranslationCalls(text) {
    const regex = /\b[tdn]\([^)]+\)|\$\b[tdn]\([^)]+\)|\bv-t=/g;
    return text.match(regex) || [];
}

// Calculate the accurate position of a specific text snippet
export function calculatePosition(node, text, call) {
    const index = text.indexOf(call);
    const source = text.slice(0, index);
    const lines = source.split('\n');
    const line = node.loc.start.line + lines.length - 1;
    const column =
        lines.length > 1 ? lines[lines.length - 1].length : node.loc.start.column + source.length;
    return { line, column };
}