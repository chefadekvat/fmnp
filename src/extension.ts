import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as childProcess from 'child_process';

// 1. m - move file (source - dest) +
// 2. c - copy file (source - dest) +
// 3. d - delete file (source) +
// 5. nd - new directory (source) +
// 6. nf - new file (source) +
// 7. o - open file in editor (source) +
// 8. np - new project (name) 

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('fmnp.shell', async () => {
		const input = await vscode.window.showInputBox({
            placeHolder: 'Enter your input here',
            prompt: 'Please provide command'
        });

		const args = input?.trim().split(/\s+/);
		if (input) {
			const command = args![0];
			const arg1 = args![1];
			const arg2 = args![2];

			if (args?.length === 3) {
				if (command === "m") {
					moveFile(arg1, arg2);
				} else if (command === "c") {
					copyFile(arg1, arg2);
				} else {
					vscode.window.showErrorMessage("Uknown command!");
				}
			} else if (args?.length === 2) {
				if (command === "d") {
					deleteEntry(arg1);
				} else if (command === "nd") {
					makeDirectory(arg1);
				} else if (command === "nf") {
					makeFile(arg1);
				} else if (command === "o") {
					openFile(arg1);
				} else if (command === "np") {
					makeProject(arg1);
				} else {
					vscode.window.showErrorMessage("Uknown command!");
				}
			} else {
				vscode.window.showErrorMessage("Unknown command pallete!");
			}
		}
	});

	context.subscriptions.push(disposable);
}

async function moveFile(source: string, destination: string) {
	let sourceUri = vscode.Uri.file(processPath(source));
    let destinationUri = vscode.Uri.file(checkForFile(sourceUri.fsPath, processPath(destination)));
    
    try {
        await vscode.workspace.fs.rename(sourceUri, destinationUri);
        vscode.window.showInformationMessage(`Moved file to ${destinationUri.fsPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to move file: ${(error as any).message}`);
    }
}

async function copyFile(source: string, destination: string) {
	const sourceUri = vscode.Uri.file(processPath(source));
	const destinationUri = vscode.Uri.file(checkForFile(sourceUri.fsPath, processPath(destination)));

	try {
		const data = await vscode.workspace.fs.readFile(sourceUri);
		await vscode.workspace.fs.writeFile(destinationUri, data);
		vscode.window.showInformationMessage(`Copied file to ${destination}`);
	} catch (error) {
		vscode.window.showErrorMessage(`Failed to copy file: ${(error as any).message}`);
	}
}

async function deleteEntry(source: string) {
	const fileUri = vscode.Uri.parse(processPath(source));

    try {
        await vscode.workspace.fs.delete(fileUri);
        vscode.window.showInformationMessage(`Deleted: ${fileUri.fsPath}`);
    } catch (error) {
        vscode.window.showErrorMessage(`Error deleting entry: ${(error as any).message}`);
    }
}

async function makeDirectory(source: string) {
	const dirPath = processPath(source);

	try {
		await fs.promises.mkdir(dirPath, { recursive: true });
		vscode.window.showInformationMessage(`Directory created at: ${dirPath}`);
	} catch (error) {
		vscode.window.showErrorMessage(`Error creating directory: ${(error as any).message}`);
	}
}

async function makeFile(source: string) {
    const filePath = processPath(source);
    
    try {
        await fs.promises.access(filePath);
        vscode.window.showErrorMessage(`File already exists at: ${filePath}`);
    } catch {
        await fs.promises.writeFile(filePath, "");
        vscode.window.showInformationMessage(`File created at: ${filePath}`);
    }
}

async function openFile(source: string) {
	const filePath = processPath(source);
	
	try {
		const document = await vscode.workspace.openTextDocument(filePath);
		await vscode.window.showTextDocument(document);
	} catch(error) {
		await vscode.window.showErrorMessage(`Failed to open file: ${(error as any).message}`);
	}
}

async function makeProject(source: string) {
	const projectPath = path.join(process.cwd(), source);

    try {
        await fs.promises.mkdir(projectPath);
        vscode.window.showInformationMessage(`Project directory created at: ${projectPath}`);

        childProcess.exec(`code ${projectPath}`, (error) => {
            if (error) {
                vscode.window.showErrorMessage(`Error opening editor: ${error.message}`);
                return;
            }
            vscode.window.showInformationMessage(`Opened ${source} in vscode`);
        });

    } catch (error) {
        vscode.window.showErrorMessage(`Error creating project: ${(error as any).message}`);
    }
}

function processPath(inpPath: string) {
	if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document && inpPath.at(0) !== '/') {
		inpPath = path.resolve(path.dirname(vscode.window.activeTextEditor.document.uri.fsPath), inpPath);
	} else if (inpPath.at(0) === '/' && vscode.workspace.workspaceFolders) {
		inpPath = path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, inpPath.slice(1, inpPath.length));
	} else if (vscode.workspace.workspaceFolders) {
		inpPath = path.resolve(vscode.workspace.workspaceFolders[0].uri.fsPath, inpPath);
	} else {
		inpPath = path.resolve("~/", inpPath);
	}
	return inpPath;
}

function checkForFile(inpPath: string, outPath: string) {
	if (path.basename(inpPath) !== path.basename(outPath)) {
		return path.join(outPath, path.basename(inpPath));
	}
	return outPath;
}

export function deactivate() {}
