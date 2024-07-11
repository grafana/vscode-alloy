import { exec } from "child_process";
import * as vscode from "vscode";

export function activate(_: vscode.ExtensionContext) {
  // Register a formatter if Alloy is installed.
  exec("alloy --version", (error, stdout, stderr) => {
    if (error || stderr) {
      vscode.window.showWarningMessage(
        `Alloy is not installed. Please install it from https://grafana.com/docs/alloy/latest/set-up/install/`
      );
      return;
    }

    vscode.window.showInformationMessage(`Alloy is installed: ${stdout}`);

    vscode.languages.registerDocumentFormattingEditProvider("grafana-alloy", {
      provideDocumentFormattingEdits(
        document: vscode.TextDocument
      ): vscode.TextEdit[] {
        exec("alloy fmt -w " + document.fileName, (error, stdout, stderr) => {
          if (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
          } else if (stderr) {
            vscode.window.showErrorMessage(`Error: ${stderr}`);
          } else if (stdout) {
            vscode.window.showInformationMessage(`Formatted: ${stdout}`);
          }
        });

        return [];
      },
    });
  });
}

export function deactivate() {}
