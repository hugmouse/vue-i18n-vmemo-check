#!/usr/bin/env node

import { analyzeVueFiles } from "../lib/analyzer.js";
import chalk from 'chalk';

const args = process.argv.slice(2);
const directoryToScan = args[0] || './src';
const warnings = analyzeVueFiles(directoryToScan);
const warningsByFile = warnings.reduce((acc, warning) => {
    if (!acc[warning.file]) {
        acc[warning.file] = [];
    }
    acc[warning.file].push(warning);
    return acc;
}, {});

// Log the warnings in a stylish format
if (warnings.length > 0) {
    Object.entries(warningsByFile).forEach(([file, fileWarnings]) => {
        console.log('\n' + chalk.underline(file));
        
        fileWarnings.forEach(warning => {
            const position = `${warning.line}:${warning.column}`;
            console.log(
                `  ${chalk.gray(position.padEnd(8))}` +
                `${chalk.yellow('warning'.padEnd(10))}` +
                `${warning.text} used without v-memo directive`
            );
        });
    });

    console.log('\n' + chalk.red(`✖ ${warnings.length} ${warnings.length === 1 ? 'problem' : 'problems'}`));
} else {
    console.log(chalk.green('✔ No issues found'));
}
