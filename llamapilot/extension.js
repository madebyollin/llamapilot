const vscode = require('vscode');
const child = require('child_process');

function activate(context) {
	const config = vscode.workspace.getConfiguration('llamapilot');

	const llamaComplete = {
		provideInlineCompletionItems: async (doc, pos, ctx, tok) => {
			const prompt = doc.getText(new vscode.Range(
				new vscode.Position(0, 0), pos));
			vscode.window.showInformationMessage(`🦙("${prompt}")...`);

			let res = child.execFileSync('./main', [
				'-m', config.llamaModel,
				'--prompt', prompt,
				'-n', config.tokenCount
			], {cwd: config.llamaFolder}).toString();
			const start = res.indexOf("\n" + prompt) + prompt.length + 1;
			const end = res.indexOf("[end of text]", start);
			let output = res.slice(start, end);
			let items = [{text: output, insertText: output, range: new vscode.Range(pos.translate(0, output.length), pos)}];
			return {items};
		},
	};

	vscode.languages.registerInlineCompletionItemProvider({pattern: "**"}, llamaComplete);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}