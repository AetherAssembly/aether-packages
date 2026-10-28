import { execFileSync } from 'node:child_process'
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const root = process.cwd()
const fixture = mkdtempSync(join(tmpdir(), 'aether-consumer-'))
try {
  mkdirSync(join(fixture, 'node_modules', '@aetherAssembly'), {
    recursive: true,
  })
  for (const name of ['core', 'ui']) {
    const packed = JSON.parse(
      execFileSync(
        'npm',
        ['pack', '--json', '--ignore-scripts', '--pack-destination', fixture],
        { cwd: join(root, 'packages', name), encoding: 'utf8' },
      ),
    )
    const result = Array.isArray(packed) ? packed[0] : Object.values(packed)[0]
    const files = result.files.map((file) => file.path)
    for (const required of [
      'LICENSE',
      'README.md',
      'dist/index.js',
      'dist/index.d.ts',
    ]) {
      if (!files.includes(required))
        throw new Error(`${name}: missing ${required}`)
    }
    if (files.some((file) => /(?:\.test\.|test-setup|test-helpers)/.test(file)))
      throw new Error('Test code leaked into package')
    const destination = join(fixture, 'node_modules', '@aetherAssembly', name)
    mkdirSync(destination)
    execFileSync('tar', [
      '-xzf',
      join(fixture, result.filename),
      '-C',
      destination,
      '--strip-components=1',
    ])
  }
  // Runtime peers and dependencies are supplied by the consumer, not the package tarballs.
  for (const dependency of [
    'react',
    'react-dom',
    'scheduler',
    'idb',
    '@types',
    'csstype',
  ]) {
    symlinkSync(
      resolve(root, 'node_modules', dependency),
      join(fixture, 'node_modules', dependency),
    )
  }
  writeFileSync(
    join(fixture, 'package.json'),
    JSON.stringify({ type: 'module' }),
  )
  writeFileSync(
    join(fixture, 'consumer.tsx'),
    `import { MemoryAdapter, LocalStorageAdapter, IDBAdapter, type IDBAdapterOptions, type LocalStorageAdapterOptions } from '@aetherAssembly/core'
import { Button, Input, Textarea, Select, Checkbox, Field, Modal, Card, Badge, type ButtonProps, type InputProps } from '@aetherAssembly/ui'
const options: IDBAdapterOptions = { version: 2, stores: ['a', 'b'] }
const local: LocalStorageAdapterOptions = { errorMode: 'ignore' }
const button: ButtonProps = { children: 'Save', loading: true }
const input: InputProps = { label: 'Name' }
void [MemoryAdapter, LocalStorageAdapter, IDBAdapter, options, local]
export const view = <Card><Button {...button} /><Input {...input} /><Textarea label="Notes" /><Select label="Kind"><option>A</option></Select><Checkbox label="Agree" /><Field label="Custom">{attributes => <input {...attributes} />}</Field><Modal open={false} onClose={() => {}} title="Test"><Badge>Ready</Badge></Modal></Card>
`,
  )
  execFileSync(
    join(root, 'node_modules', '.bin', 'tsc'),
    [
      '--noEmit',
      '--strict',
      '--exactOptionalPropertyTypes',
      '--skipLibCheck',
      '--target',
      'ES2022',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--jsx',
      'react-jsx',
      join(fixture, 'consumer.tsx'),
    ],
    { stdio: 'inherit' },
  )
  writeFileSync(
    join(fixture, 'smoke.mjs'),
    `import { MemoryAdapter } from '@aetherAssembly/core';
import { Button, Input, Modal } from '@aetherAssembly/ui';
import { createElement } from 'react'; import { renderToString } from 'react-dom/server';
import { readFileSync } from 'node:fs';
const storage = new MemoryAdapter(); await storage.set('key', 42); if (await storage.get('key') !== 42) throw Error('Storage failed');
const html = renderToString(createElement(Button, { loading: true, disabled: false }, 'Save')); if (!html.includes('disabled')) throw Error('UI failed');
renderToString(createElement(Input, { label: 'Name' })); renderToString(createElement(Modal, { open: false, onClose() {}, title: 'Test' }, 'Body'));
if (!readFileSync(new URL(import.meta.resolve('@aetherAssembly/ui/styles.css')), 'utf8').includes('--ae-color-primary')) throw Error('Styles missing');
`,
  )
  execFileSync(process.execPath, [join(fixture, 'smoke.mjs')], {
    stdio: 'inherit',
  })
  console.log(
    'Both packed packages passed consumer type, ESM, SSR, stylesheet, license, and file-content checks.',
  )
} finally {
  rmSync(fixture, { recursive: true, force: true })
}
