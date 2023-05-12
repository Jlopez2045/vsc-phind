import * as vscode from 'vscode';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export async function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('phindView', new PhindViewProvider()),
  );

  // context.subscriptions.push(
  //   vscode.window.onDidChangeTextEditorSelection(async (event) => {
  //     const selectedText = event.textEditor.document.getText(event.textEditor.selection);
  //     vscode.commands.executeCommand('phindView.updateSearch', selectedText);
  //   })
  // );
}

class PhindViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getHtmlForWebview();

    // webviewView.webview.onDidReceiveMessage((message:any) => {
    //   const searchInput = encodeURIComponent(message.text);
    //   console.log("searchInput", message.text)

    //   switch (message.command) {
    //     case 'updateSearch':
    //       webviewView.webview.postMessage({ command: 'updateSearch', text: message.text });
    //       break;
    //   }
    // });

    // vscode.commands.registerCommand('phindView.updateSearch', (text: string) => {
    //   webviewView.webview.postMessage({ command: 'updateSearch', text });
    // });
    vscode.commands.registerCommand('phind.refresh', (text: string) => {
      webviewView.webview.postMessage({ command: 'refresh' });
    });
  }

  private getHtmlForWebview(): string {
    const filePath = vscode.Uri.file(path.join(__dirname, 'sidebar.html'));
    console.log(filePath)
    return fs.readFileSync(filePath.fsPath, 'utf8');;
  }
}

function _findLinesContaining(editor: vscode.TextEditor, findValue: string): string[] {
  let foundLines: string[] = [];

  // get all the lines in the document
  let fullText = editor.document.getText();
  let lines = fullText.split(/\r?\n/);

  // filter out the lines that don't contain the search value
  foundLines = lines.filter(line => line.includes(findValue));

  return foundLines;
}


// async function findAllReferences(document: vscode.TextDocument, position: vscode.Position) {
//   const referenceProviders = vscode.languages.getReferenceProviders(document.uri);
//   const references = [];

//   for (const provider of referenceProviders) {
//     const providerReferences = await provider.provideReferences(document, position, { includeDeclaration: false });
//     references.push(...providerReferences);
//   }

//   return references;
// }

// vscode.commands.registerCommand('extension.findAllReferences', async () => {
//   const editor = vscode.window.activeTextEditor;
//   const document = editor.document;
//   const position = editor.selection.active;

//   const references = await findAllReferences(document, position);

//   references.forEach((reference) => {
//     console.log('Reference:', reference.uri.fsPath, reference.range.start.line, reference.range.start.character);
//   });
// });

// class CustomDefinitionProvider implements vscode.DefinitionProvider {
//     public provideDefinition(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Thenable<vscode.Location> {
//         // Implementation to find the definition of the selected text

//     }
// }

async function getSelectedCodeDefinitions() {
  // Get the active text editor
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  // Get the current selection
  const selection = editor.selection;
  if (selection.isEmpty) {
    return;
  }

  // Get the document and the position of the selection
  const document = editor.document;
  const position = selection.active;

  // Execute the definition provider command
  const locations: vscode.Location[] = await vscode.commands.executeCommand(
    'vscode.executeDefinitionProvider',
    document.uri,
    position
  );

  // Process the locations
  locations.forEach((location) => {
    console.log(`Definition found at: \${location.range.start.line}:\${location.range.start.character}`);
  });
}

// export async function getTypeDefinitions() {
//   const activeEditor = vscode.window.activeTextEditor;
//   if (!activeEditor) {
//     return;
//   }

//   const document = activeEditor.document;
//   const selection = activeEditor.selection;
//   const selectedText = document.getText(selection);

//   const typeInfo = await getTypeInfoFromLanguageService(document, selectedText);
//   if (typeInfo) {
//     vscode.window.showInformationMessage(`Type: \${typeInfo}`);
//   } else {
//     vscode.window.showErrorMessage('Type information not found.');
//   }
// }

// async function getTypeInfoFromLanguageService(document: vscode.TextDocument, selectedText: string): Promise<string | undefined> {
//   // Get the TypeScript language service
//   const tsLanguageService = ts.createLanguageService(/* ... */);

//   // Get the file and position information
//   const fileName = document.uri.fsPath;
//   const position = ts.getPositionOfLineAndCharacter(/* ... */);

//   // Get the type information
//   const typeInfo = tsLanguageService.getQuickInfoAtPosition(fileName, position);
//   if (typeInfo) {
//     const typeDisplayParts = typeInfo.displayParts.filter(part => part.kind === 'typeName');
//     return typeDisplayParts.map(part => part.text).join('');
//   }

//   return undefined;
// }
