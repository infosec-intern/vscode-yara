'use strict';

import vscode = require('vscode');

export function getWorkspacePath(extensionUri: vscode.Uri, ...pathSegments: string[]): vscode.Uri {
    return vscode.Uri.joinPath(extensionUri, 'test', 'rules', ...pathSegments);
}
