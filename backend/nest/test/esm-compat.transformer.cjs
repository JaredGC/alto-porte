const ts = require('typescript');
const { pathToFileURL } = require('node:url');

// @nestjs/typeorm 12 uses createRequire(import.meta.url). Jest on Node 22
// executes these dependencies as CommonJS, so preserve the file URL and avoid
// colliding with the CommonJS wrapper's require parameter during transpilation.
const esmCompat = (context) => (sourceFile) => {
  if (!/[/\\]@nestjs[/\\]typeorm[/\\]/.test(sourceFile.fileName)) {
    return sourceFile;
  }
  const hasLocalRequire = sourceFile.statements.some(
    (statement) =>
      ts.isVariableStatement(statement) &&
      statement.declarationList.declarations.some(
        (declaration) =>
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === 'require',
      ),
  );
  const visit = (node) => {
    if (
      ts.isPropertyAccessExpression(node) &&
      node.name.text === 'url' &&
      ts.isMetaProperty(node.expression) &&
      node.expression.keywordToken === ts.SyntaxKind.ImportKeyword
    ) {
      return ts.factory.createStringLiteral(
        pathToFileURL(sourceFile.fileName).href,
      );
    }
    if (hasLocalRequire && ts.isIdentifier(node) && node.text === 'require') {
      return ts.factory.createIdentifier('esmRequire');
    }
    return ts.visitEachChild(node, visit, context);
  };
  return ts.visitNode(sourceFile, visit);
};

module.exports = {
  process(sourceText, sourcePath) {
    const result = ts.transpileModule(sourceText, {
      fileName: sourcePath,
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2023,
        esModuleInterop: true,
        sourceMap: true,
      },
      transformers: { before: [esmCompat] },
    });
    return { code: result.outputText, map: result.sourceMapText };
  },
};
