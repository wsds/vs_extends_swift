/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
'use strict';

import {
	IPCMessageReader, IPCMessageWriter,
	createConnection, IConnection, TextDocumentSyncKind,
	TextDocuments, TextDocument, Diagnostic, DiagnosticSeverity,
	InitializeParams, InitializeResult, TextDocumentPositionParams,
	TextDocumentIdentifier, TextEdit,
	DocumentFormattingParams, DocumentRangeFormattingParams,
	CompletionItem, CompletionItemKind
} from 'vscode-languageserver';

// Create a connection for the server. The connection uses Node's IPC as a transport
let connection: IConnection = createConnection(new IPCMessageReader(process), new IPCMessageWriter(process));

// Create a simple text document manager. The text document manager
// supports full document sync only
let documents: TextDocuments = new TextDocuments();
// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// After the server has started the client sends an initilize request. The server receives
// in the passed params the rootPath of the workspace plus the client capabilites. 
let workspaceRoot: string;
connection.onInitialize((params): InitializeResult => {
	workspaceRoot = params.rootPath;
	return {
		capabilities: {
			// Tell the client that the server works in FULL text document sync mode
			textDocumentSync: documents.syncKind,
			// textDocumentSync: TextDocumentSyncKind.Incremental,
			// Tell the client that the server support code complete

            completionProvider: { resolveProvider: false },
            hoverProvider: true,
            documentSymbolProvider: true,
            documentRangeFormattingProvider: true,
            documentFormattingProvider: true,

			referencesProvider: true,
			definitionProvider: true,
			documentHighlightProvider: true,
			codeActionProvider: true,
			renameProvider: true
		}
	}
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
	validateTextDocument(change.document);
});

// The settings interface describe the server relevant settings part
interface Settings {
	languageServerExample: ExampleSettings;
	swift: {
		server: String
	}
}

// These are the example settings we defined in the client's package.json
// file
interface ExampleSettings {
	maxNumberOfProblems: number;
}

// hold the maxNumberOfProblems setting
let maxNumberOfProblems: number;
// The settings have changed. Is send on server activation
// as well.
connection.onDidChangeConfiguration((change) => {
	let settings = <Settings>change.settings;
	maxNumberOfProblems = settings.languageServerExample.maxNumberOfProblems || 100;
	// Revalidate any open text documents
	documents.all().forEach(validateTextDocument);
	connection.console.log('settings: ' + settings.swift.server);
});

function validateTextDocument(textDocument: TextDocument): void {
	let diagnostics: Diagnostic[] = [];
	let lines = textDocument.getText().split(/\r?\n/g);
	let problems = 0;
	for (var i = 0; i < lines.length && problems < maxNumberOfProblems; i++) {
		let line = lines[i];
		let index = line.indexOf('typescript');
		if (index >= 0) {
			problems++;
			diagnostics.push({
				severity: DiagnosticSeverity.Warning,
				range: {
					start: { line: i, character: index },
					end: { line: i, character: index + 10 }
				},
				message: `${line.substr(index, 10)} should be spelled TypeScript`,
				source: 'ex'
			});
		}
	}
	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

connection.onDidChangeWatchedFiles((change) => {
	// Monitored files have change in VSCode
	connection.console.log('We recevied an file change event');
});


// This handler provides the initial list of the completion items.
connection.onCompletion((textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
	// The pass parameter contains the position of the text document in 
	// which code complete got requested. For the example we ignore this
	// info and always provide the same completion items.
	return [
		{
			label: 'TypeScript',
			kind: CompletionItemKind.Text,
			data: 1
		},
		{
			label: 'JavaScript',
			kind: CompletionItemKind.Class,
			data: 2
		}
	]
});

connection.onHover(textDocumentPositionParams => {
    var document = documents.get(textDocumentPositionParams.textDocument.uri);
	var result = { contents: "You hovered on me." }
    return result;
});

connection.onDocumentSymbol(documentSymbolParams => {
    const document = documents.get(documentSymbolParams.textDocument.uri);
    return null;
});
function newTextEdit() {
	var textEdit = {
		range: {
			start: {
				line: 2,
				character: 10
			},
			end: {
				line: 2,
				character: 21
			}
		},
		newText: "Hello Swift"
	}
	return textEdit;
}
connection.onDocumentFormatting(formatParams => {
    const document = documents.get(formatParams.textDocument.uri);
	// let textEdit: TextEdit = newTextEdit();
	// let textEdits: TextEdit[] = [];
	// textEdits.push(textEdit);
	var textEdit1 = newTextEdit();
	var textEdit2 = newTextEdit();
	textEdit2.newText = "\n";
	textEdit2.range.end.line = 5;
	textEdit2.range.end.character = 0;
	textEdit2.range.start = textEdit2.range.end;

	var textEdits = [textEdit1, textEdit2];
    return textEdits;
});

connection.onDocumentRangeFormatting(formatParams => {
    const document = documents.get(formatParams.textDocument.uri);
    return null;
});
function newLocation() {
	var location = {
		range: {
			start: {
				line: 29,
				character: 9
			},
			end: {
				line: 29,
				character: 21
			}
		},
		uri: "file:///d:/code2/aaaa/test1.ss"
	}
	return location;
}
connection.onDefinition(documentSymbolParams => {
	if (documentSymbolParams.position.line < 3) {
		return null;
	}
	let document = documents.get(documentSymbolParams.textDocument.uri);
	var location = newLocation();
	return location;
});

connection.onDocumentHighlight(documentSymbolParams => {
	let document = documents.get(documentSymbolParams.textDocument.uri);
	return null;
});

connection.onReferences(referenceParams => {
	let document = documents.get(referenceParams.textDocument.uri);
	var location1 = newLocation();
	var location2 = newLocation();
	location2.range.start.line = 3;
	return [location1, location2];
});

// This handler resolve additional information for the item selected in
// the completion list.
connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
	if (item.data === 1) {
		item.detail = 'TypeScript details';
		item.documentation = 'TypeScript documentation';
	} else if (item.data === 2) {
		item.detail = 'JavaScript details';
		item.documentation = 'JavaScript documentation';
		item.insertText = "hello sdsa"
	}
	return item;
});
/*
connection.onDidOpenTextDocument((params) => {
	// A text document got opened in VSCode.
	// params.uri uniquely identifies the document. For documents store on disk this is a file URI.
	// params.text the initial full content of the document.
	connection.console.log(`${params.textDocument.uri} opened.`);
});

connection.onDidChangeTextDocument((params) => {
	// The content of a text document did change in VSCode.
	// params.uri uniquely identifies the document.
	// params.contentChanges describe the content changes to the document.
	connection.console.log(`${params.textDocument.uri} has 1000002 changed: ${JSON.stringify(params.contentChanges)}`);
});

connection.onDidCloseTextDocument((params) => {
	// A text document got closed in VSCode.
	// params.uri uniquely identifies the document.
	connection.console.log(`${params.textDocument.uri} closed.`);
});
*/
// Listen on the connection
connection.listen();