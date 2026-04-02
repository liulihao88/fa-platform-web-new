import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import type { PluginOption } from 'vite'

const PDFJS_DIST_ASSET_DIRS = ['cmaps', 'standard_fonts', 'wasm', 'iccs'] as const

const syncPdfjsDistAssets = (root: string) => {
  const packageRoot = resolve(root, 'node_modules/pdfjs-dist')
  const publicRoot = resolve(root, 'public/static/pdfjs-dist')

  mkdirSync(publicRoot, { recursive: true })

  for (const dirName of PDFJS_DIST_ASSET_DIRS) {
    const sourceDir = resolve(packageRoot, dirName)
    const targetDir = resolve(publicRoot, dirName)

    if (!existsSync(sourceDir)) continue

    rmSync(targetDir, { recursive: true, force: true })
    cpSync(sourceDir, targetDir, { recursive: true })
  }
}

export function syncPdfjsDistAssetsPlugin(): PluginOption {
  let root = process.cwd()

  return {
    name: 'sync-pdfjs-dist-assets',
    apply: 'serve',
    configResolved(config) {
      root = config.root
      syncPdfjsDistAssets(root)
    },
  }
}

export function syncPdfjsDistAssetsBuildPlugin(): PluginOption {
  let root = process.cwd()

  return {
    name: 'sync-pdfjs-dist-assets-build',
    apply: 'build',
    configResolved(config) {
      root = config.root
    },
    buildStart() {
      syncPdfjsDistAssets(root)
    },
  }
}
