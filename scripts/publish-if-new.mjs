import { execFileSync } from 'node:child_process'
import { globSync, readFileSync, statSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registry = 'https://npm.pkg.github.com'
const rootManifest = JSON.parse(
  readFileSync(resolve(root, 'package.json'), 'utf8')
)
const workspaces = Array.isArray(rootManifest.workspaces)
  ? rootManifest.workspaces
  : rootManifest.workspaces?.packages

if (!Array.isArray(workspaces)) {
  throw new Error('Root package.json must define workspaces as an array')
}

const packageDirectories = workspaces.flatMap((pattern) =>
  globSync(pattern, { cwd: root }).filter((path) =>
    statSync(resolve(root, path)).isDirectory()
  )
)

function isVersionNotFound(error) {
  const output = [error.stdout, error.stderr]
    .map((value) => (Buffer.isBuffer(value) ? value.toString() : (value ?? '')))
    .join('\n')

  return (
    error.status === 1 &&
    (/\bE404\b/i.test(output) ||
      /\b404\b.{0,80}\bnot[ -]found\b|\bnot[ -]found\b.{0,80}\b404\b/i.test(
        output
      ))
  )
}

for (const directory of packageDirectories) {
  const packageDirectory = resolve(root, directory)
  const { name, version } = JSON.parse(
    readFileSync(resolve(packageDirectory, 'package.json'), 'utf8')
  )

  if (!name || !version) {
    throw new Error(`${directory}/package.json must define name and version`)
  }

  try {
    execFileSync(
      'npm',
      ['view', `${name}@${version}`, '--registry', registry, '--json'],
      { cwd: root, stdio: ['ignore', 'pipe', 'pipe'] }
    )
    console.log(`Skipping ${name}@${version} (already published)`)
  } catch (error) {
    if (!isVersionNotFound(error)) {
      throw new Error(
        `Failed to check ${name}@${version} in ${registry}: ${error.stderr?.toString() || error.message}`,
        { cause: error }
      )
    }

    console.log(`Publishing ${name}@${version}`)
    execFileSync(
      'npm',
      ['publish', '--access', 'public', '--registry', registry],
      { cwd: packageDirectory, stdio: 'inherit' }
    )
  }
}
