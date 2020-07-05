const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const { gzipSync } = require('zlib');
const { compress } = require('brotli');
const { targets: allTargets } = require('./utils');

run();

async function run() {
  await buildAll(allTargets);
  checkAllSizes(allTargets);
}

async function buildAll(targets) {
  for (const target of targets) {
    await build(target);
  }
}

async function build(target) {
  const pkgDir = path.resolve(`packages/${target}`);
  const pkg = require(`${pkgDir}/package.json`);

  await fs.remove(`${pkgDir}/dist`);

  await execa('rollup', ['-c', '--environment', [`TARGET:${target}`].filter(Boolean).join(',')], {
    stdio: 'inherit',
  });

  const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');
  const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`);
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(extractorConfigPath);
  const result = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  });

  if (result.succeeded) {
    // concat additional d.ts to rolled-up dts (mostly for JSX)
    if (pkg.buildOptions && pkg.buildOptions.dts) {
      const dtsPath = path.resolve(pkgDir, pkg.types);
      const existing = await fs.readFile(dtsPath, 'utf-8');
      const toAdd = await Promise.all(
        pkg.buildOptions.dts.map((file) => {
          return fs.readFile(path.resolve(pkgDir, file), 'utf-8');
        })
      );
      await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'));
    }
    console.log(chalk.bold(chalk.green(`API Extractor completed successfully.`)));
  }

  await fs.remove(`${pkgDir}/dist/packages`);
}

function checkAllSizes(targets) {
  console.log();
  for (const target of targets) {
    checkSize(target);
  }
  console.log();
}

function checkSize(target) {
  const pkgDir = path.resolve(`packages/${target}`);
  const esmProdBuild = `${pkgDir}/dist/${target}.js`;
  if (fs.existsSync(esmProdBuild)) {
    const file = fs.readFileSync(esmProdBuild);
    const minSize = (file.length / 1024).toFixed(2) + 'kb';
    const gzipped = gzipSync(file);
    const gzippedSize = (gzipped.length / 1024).toFixed(2) + 'kb';
    const compressed = compress(file);
    const compressedSize = (compressed.length / 1024).toFixed(2) + 'kb';
    console.log(
      `${chalk.gray(
        chalk.bold(target)
      )} min:${minSize} / gzip:${gzippedSize} / brotli:${compressedSize}`
    );
  }
}
