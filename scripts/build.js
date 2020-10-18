const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const execa = require('execa');
const { gzipSync } = require('zlib');
const { compress } = require('brotli');
const { targets: allTargets, fuzzyMatchTarget } = require('./utils');

const args = require('minimist')(process.argv.slice(2));
const targets = args._;

run();

async function run() {
  if (!targets.length) {
    await buildAll(allTargets);
    checkAllSizes(allTargets);
  } else {
    await buildAll(fuzzyMatchTarget(targets, buildAllMatching));
    checkAllSizes(fuzzyMatchTarget(targets, buildAllMatching));
  }
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

  await execa(
    'rollup',
    ['-c', '--environment', [`TARGET:${target}`].filter(Boolean).join(',')],
    {
      stdio: 'inherit',
    }
  );

  console.log();
  console.log(
    chalk.bold(chalk.yellow(`Rolling up type definitions for ${target}...`))
  );

  // build types
  const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor');

  const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`);
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    extractorConfigPath
  );
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  });

  if (extractorResult.succeeded) {
    // concat additional d.ts to rolled-up dts
    const typesDir = path.resolve(pkgDir, 'types');
    if (await fs.exists(typesDir)) {
      const dtsPath = path.resolve(pkgDir, pkg.types);
      const existing = await fs.readFile(dtsPath, 'utf-8');
      const typeFiles = await fs.readdir(typesDir);
      const toAdd = await Promise.all(
        typeFiles.map((file) => {
          return fs.readFile(path.resolve(typesDir, file), 'utf-8');
        })
      );
      await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'));
    }
    console.log(
      chalk.bold(chalk.green(`API Extractor completed successfully.`))
    );
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    );
    process.exitCode = 1;
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
