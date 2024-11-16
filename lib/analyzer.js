import fs from 'fs';
import path from 'path';
import { parse, NodeTypes } from'@vue/compiler-dom';
import { hasVMemo, extractTranslationCalls, calculatePosition } from './utils.js';

// Recursive function to traverse template nodes
function traverseTemplateNodes(node, warnings, filePath) {
    if (!node) return;

    if (node.type === NodeTypes.ELEMENT) {
        // Check for <i18n> components
        if (node.tag === 'i18n' || node.tag === 'i18n-t') {
            const { line, column } = node.loc.start;
            warnings.push({
                file: filePath,
                line,
                column,
                text: `<${node.tag}> component used`,
            });
        }

        // Check for text content or translation calls in this element
        const textNodes = node.children.filter(
            (child) =>
                child.type === NodeTypes.TEXT || child.type === NodeTypes.INTERPOLATION
        );

        textNodes.forEach((textNode) => {
            // Set the parent reference for proper v-memo checking
            textNode.parent = node;
            let text = textNode.content;

            // Handle object content
            if (typeof text === 'object') {
                if (text.content) {
                    text = text.content;
                } else {
                    return;
                }
            }

            if (typeof text !== 'string') {
                return;
            }

            // Extract translation calls from the text
            const translationCalls = extractTranslationCalls(text);

            translationCalls.forEach((call) => {
                if (!hasVMemo(node)) {
                    const { line, column } = calculatePosition(textNode, text, call);
                    warnings.push({
                        file: filePath,
                        line,
                        column,
                        text: call.trim(),
                    });
                }
            });
        });

        if (node.children) {
            for (const child of node.children) {
                // Set parent reference for v-memo checking
                child.parent = node;
                traverseTemplateNodes(child, warnings, filePath);
            }
        }
    }
}

// Function to analyze a Vue file and check for vue-i18n relevant functions
function analyzeVueFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const parsed = parse(content);
        const warnings = [];
        const templateNode = parsed.children.find((node) => node.tag === 'template');
        if (templateNode) {
            traverseTemplateNodes(templateNode, warnings, filePath);
        }
        return warnings;
    } catch (err) {
        console.error(`Failed to analyze file ${filePath}: ${err.message}`);
        return [];
    }
}

// Main function to iterate over Vue files in a directory
export function analyzeVueFiles(directory) {
    let allWarnings = [];
    try {
        const entries = fs.readdirSync(directory, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(directory, entry.name);

            if (entry.isDirectory()) {
                const warnings = analyzeVueFiles(fullPath);
                allWarnings = allWarnings.concat(warnings);
            } else if (path.extname(entry.name) === '.vue') {
                const warnings = analyzeVueFile(fullPath);
                allWarnings = allWarnings.concat(warnings);
            }
        }
    } catch (err) {
        console.error(`Failed to read directory ${directory}: ${err.message}`);
    }

    return allWarnings;
}
