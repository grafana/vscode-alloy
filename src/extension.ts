import { exec } from "child_process";
import { promisify } from "util";
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
      ): vscode.ProviderResult<vscode.TextEdit[]> {
        // If dirty, use stdin and stdout from alloy fmt.
        if (document.isDirty) {
          const execWithStdin = (cmd: string, stdin: string, callback: (error: Error | null, stdout: string, stderr: string) => void) => {
            const process = exec(cmd, (error, stdout, stderr) => {
              if (error) {
                callback(error, "", stderr);
              } else {
                callback(null, stdout, stderr);
              }
            });
            if (process.stdin) {
              process.stdin.write(stdin);
              process.stdin.end();
            }
          };
          const promisifiedExec = promisify(execWithStdin);

          return promisifiedExec("alloy fmt", document.getText())
            .then((result) => {
              return [
                vscode.TextEdit.replace(
                  new vscode.Range(0, 0, document.lineCount, 0),
                  result
                ),
              ];
            })
            .catch((error) => {
              vscode.window.showErrorMessage(`Error: ${error.message}`);
              return [];
            });
        } else {
          // Otherwise overwrite the file with alloy fmt.
          exec("alloy fmt -w " + document.fileName, (error, stdout, stderr) => {
            if (error) {
              vscode.window.showErrorMessage(`Error: ${error.message}`);
            } else if (stderr) {
              vscode.window.showErrorMessage(`Error: ${stderr}`);
            } else if (stdout) {
              vscode.window.showInformationMessage(`Formatted: ${stdout}`);
            }
          });
        }

        return [];
      },
    });
  });
}

export function deactivate() { }
