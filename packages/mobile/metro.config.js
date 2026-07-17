const { getDefaultConfig } = require('expo/metro-config')
const path = require('node:path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Metro doesn't follow symlinks out of the project by default, so the
// @pulse/shared workspace link would resolve to nothing without these.
config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
// Force resolution through the two paths above so a stray nested copy of
// react can't get picked up and trigger duplicate-React hook errors.
config.resolver.disableHierarchicalLookup = true

module.exports = config
