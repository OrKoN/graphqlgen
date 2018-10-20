import * as path from 'path'
import * as fs from 'fs'
import * as ts from 'typescript'

interface InterfaceNameToPath {
  [interfaceName: string]: string
}

export function getChildrenNodes(source: ts.Node | ts.SourceFile): ts.Node[] {
  const nodes: ts.Node[] = []

  source.forEachChild(node => {
    nodes.push(node)
  })

  return nodes
}

function getSourceFile(fileName: string, filePath: string): ts.SourceFile {
  return ts.createSourceFile(
    fileName,
    fs.readFileSync(filePath).toString(),
    ts.ScriptTarget.ES2015,
  )
}

export function findInterfaceByName(
  filePath: string,
  interfaceName: string,
): ts.Node | undefined {
  const fileName = path.basename(filePath)

  const sourceFile = getSourceFile(fileName, filePath)

  // NOTE unfortunately using `.getChildren()` didn't work, so we had to use the `forEachChild` method
  return getChildrenNodes(sourceFile).find(
    node =>
      node.kind === ts.SyntaxKind.InterfaceDeclaration &&
      (node as ts.InterfaceDeclaration).name.escapedText === interfaceName,
  )
}

export function interfaceNamesFromTypescriptFile(filePath: string): string[] {
  const fileName = path.basename(filePath)

  const sourceFile = getSourceFile(fileName, filePath)

  // NOTE unfortunately using `.getChildren()` didn't work, so we had to use the `forEachChild` method
  return getChildrenNodes(sourceFile)
    .filter(node => node.kind === ts.SyntaxKind.InterfaceDeclaration)
    .map(node => (node as ts.InterfaceDeclaration).name.escapedText as string)
}

/**
 * Create a map of interface names to the path of the file in which they're defined
 * The first evaluated interfaces are always the chosen ones
 */
export function getInterfaceNamesToPath(files: string[]): InterfaceNameToPath {
  return files.reduce((acc: InterfaceNameToPath, filePath) => {
    const interfaceNames = interfaceNamesFromTypescriptFile(filePath).filter(
      interfaceName => !acc[interfaceName],
    )

    interfaceNames.forEach(interfaceName => {
      acc[interfaceName] = filePath
    })

    return acc
  }, {})
}
