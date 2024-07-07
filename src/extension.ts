import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
	var installed: Boolean = false;
	//check if alloy is installed
	exec("alloy --version", (error, stdout, stderr) => {
		if (error || stderr) {
			vscode.window.showWarningMessage(`Alloy is not installed. Please install it from https://grafana.com/docs/alloy/latest/set-up/install/`);
		}
		if (stdout) {
			vscode.window.showInformationMessage(`Alloy is installed: ${stdout}`);
			installed = true;
		}
	});
	//if alloy is installed, register the formatter
	if (installed) {
		vscode.languages.registerDocumentFormattingEditProvider('grafana-alloy', {
			provideDocumentFormattingEdits(document: vscode.TextDocument): vscode.TextEdit[] {
				// nothing fancy, just run the command
				exec("alloy fmt -w " + document.fileName, (error, stdout, stderr) => {
					if (error) {
						vscode.window.showErrorMessage(`Error: ${error.message}`);
						return [];
					}
					if (stderr) {
						vscode.window.showErrorMessage(`Error: ${stderr}`);
						return [];
					}
					if (stdout) {
						vscode.window.showInformationMessage(`Formatted: ${stdout}`);
						return [];
					}
				});
				return [];
			}
		});
	}
}

export function deactivate() { }
