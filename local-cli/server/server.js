/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
'use strict';

const chalk = require('chalk');
const formatBanner = require('./formatBanner');
const path = require('path');
const runServer = require('./runServer');
const findSymlinksPaths = require('./findSymlinksPaths');
const NODE_MODULES = path.resolve(__dirname, '..', '..', '..');

/**
 * Starts the React Native Packager Server.
 */
function server(argv, config, args) {
  args.projectRoots = args.projectRoots.concat(
    args.root,
    findSymlinksPaths(NODE_MODULES)
  );

  console.log(formatBanner(
    'Running packager on port ' + args.port + '.\n\n' +
    'Keep this packager running while developing on any JS projects. ' +
    'Feel free to close this tab and run your own packager instance if you ' +
    'prefer.\n\n' +
    'https://github.com/facebook/react-native', {
      marginLeft: 1,
      marginRight: 1,
      paddingBottom: 1,
    })
  );

  console.log(
    'Looking for JS files in\n  ',
    chalk.dim(args.projectRoots.join('\n   ')),
    '\n'
  );

  process.on('uncaughtException', error => {
    if (error.code === 'EADDRINUSE') {
      console.log(
        chalk.bgRed.bold(' ERROR '),
        chalk.red('Packager can\'t listen on port', chalk.bold(args.port))
      );
      console.log('Most likely another process is already using this port');
      console.log('Run the following command to find out which process:');
      console.log('\n  ', chalk.bold('lsof -n -i4TCP:' + args.port), '\n');
      console.log('You can either shut down the other process:');
      console.log('\n  ', chalk.bold('kill -9 <PID>'), '\n');
      console.log('or run packager on different port.');
    } else {
      console.log(chalk.bgRed.bold(' ERROR '), chalk.red(error.message));
      const errorAttributes = JSON.stringify(error);
      if (errorAttributes !== '{}') {
        console.error(chalk.red(errorAttributes));
      }
      console.error(chalk.red(error.stack));
    }
    console.log('\nSee', chalk.underline('http://facebook.github.io/react-native/docs/troubleshooting.html'));
    console.log('for common problems and solutions.');
    process.exit(1);
  });

  runServer(args, config, () => console.log('\nReact packager ready.\n'));
}

module.exports = {
  name: 'start',
  func: server,
  description: 'starts the webserver',
  options: [{
    command: '--port [number]',
    default: 8081,
    parse: (val) => Number(val),
  }, {
    command: '--host [string]',
    default: '',
  }, {
    command: '--root [list]',
    description: 'add another root(s) to be used by the packager in this project',
    parse: (val) => val.split(',').map(root => path.resolve(root)),
    default: [],
  }, {
    command: '--projectRoots [list]',
    description: 'override the root(s) to be used by the packager',
    parse: (val) => val.split(','),
    default: (config) => config.getProjectRoots(),
  }, {
    command: '--assetRoots [list]',
    description: 'specify the root directories of app assets',
    parse: (val) => val.split(',').map(dir => path.resolve(process.cwd(), dir)),
    default: (config) => config.getAssetRoots(),
  }, {
    command: '--assetExts [list]',
    description: 'Specify any additional asset extentions to be used by the packager',
    parse: (val) => val.split(','),
    default: (config) => config.getAssetExts(),
  }, {
    command: '--skipflow',
    description: 'Disable flow checks'
  }, {
    command: '--nonPersistent',
    description: 'Disable file watcher'
  }, {
    command: '--transformer [string]',
    default: require.resolve('../../packager/transformer'),
    description: 'Specify a custom transformer to be used (absolute path)'
  }, {
    command: '--reset-cache, --resetCache',
    description: 'Removes cached files',
  }, {
    command: '--verbose',
    description: 'Enables logging',
  }],
};
