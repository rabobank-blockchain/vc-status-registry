module.exports = function (config) {
  // noinspection JSFileReferences
  config.set({
    mutator: 'typescript',
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress'],
    testRunner: 'mocha',
    tsconfigFile: 'tsconfig.json',
    mutate: ['src/**/*.ts'],
    mochaOptions: {
      spec: ['test/**/*.ts'],
      config: '.mocharc.json',
      package: 'package.json'
    },
    thresholds: {
      high: 100,
      low: 90,
      break: 80
    }
  })
}
