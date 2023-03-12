const vscode = require('vscode');
const child = require('child_process');

function activate(context) {
	let disposable = vscode.commands.registerCommand('llamapilot.engage', function () {
		const editor = vscode.window.activeTextEditor;
		const config = vscode.workspace.getConfiguration('llamapilot');

		if (editor) {
			const doc = editor.document;
			const sel = editor.selection;

			const prompt = doc.getText(sel);
			// vscode.window.showInformationMessage(`🦙("${prompt}")...`);
			vscode.window.withProgress(
				{
				  location: vscode.ProgressLocation.Notification,
				  title: `Running LLaMA on "${prompt}"...`,
				  cancellable: false,
				},
				async (progress, token) => {
					progress.report({increment: 0});
					let res = child.execFileSync('./main', [
						'-m', config.llamaModel,
						'--prompt', prompt,
						'-n', config.tokenCount
					], {cwd: config.llamaFolder}).toString();
					const start = res.indexOf("\n" + prompt) + prompt.length + 1;
					const end = res.indexOf("[end of text]", start);
					let resSliced = res.slice(start, end);
					editor.edit(editBuilder => {
						editBuilder.insert(sel.end, resSliced);
						progress.report({increment: 100});
					});
				}
			);
		}
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}