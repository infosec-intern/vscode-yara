"use strict";

import * as vscode from 'vscode';
import { log } from './helpers';

export const configSection = 'yara';
export let debug = false;

export function setDebugLogState(): void {
    if (vscode.workspace.getConfiguration(configSection).get('debug')) {
        debug = true;
        log('Debug logging enabled');
    }
    else {
        debug = false;
        log('Debug logging disabled');
    }
}
