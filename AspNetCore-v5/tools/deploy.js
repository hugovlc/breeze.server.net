 /** 
 * Deploys nupkg to local cache dir for testing
 */
var fs = require("fs-extra");
var del = require('del');
const bu = require('.\\build-utils');

const localNugetCacheDir = process.env.LOCALAPPDATA + '\\NuGet\\Test';
const version = '5.0.2.1';
const debugOrRelease = 'Debug'

var baseNames = [
  'Breeze.AspNetCore.NetCore',
  'Breeze.Core',
  'Breeze.Persistence',
  'Breeze.Persistence.EFCore'
];

const arg = bu.getArg();
argl = arg.toLowerCase();
if (argl == 'local') {
  deployLocal();  
} else if (argl == 'remote') {
  deployRemote();
} else {
  console.log(`You must pass in either 'local' or 'remote'. You passed: ${argl}`);
}

// should ONLY be called manually after testing locally installed nugets from nugetPack step.
// deliberately does NOT have a dependency on nugetPack

function deployLocal() {
  deleteLocalAppCache(baseNames);
  const nupkgs = getNupkgs(baseNames);
  nupkgs.forEach(nupkg => {
    // call will look something like the line below
    // --> nuget add  .\Breeze.Core\bin\Debug\Breeze.Core.5.0.2.nupkg  -Source C:/Users/Jay/AppData/Local/NuGet/Test
    cmd = `nuget add ${nupkg} -Source ${localNugetCacheDir}`;
    console.log(cmd);
    bu.execCmd(cmd);
  });
}

function deployRemote() {
  const nupkgs = getNupkgs(baseNames);
  nupkgs.forEach(nupkg => {
    var cmd = `nuget push ${nupkg} {{ nuget key goes here }} -Source https://www.nuget.org`
    console.log(cmd);
    bu.execCmd(cmd);
  });
}

function getNupkgs(baseNames) {
  const nupkgs = baseNames.map(baseName => {
    // check if nupkg exists.
    var fn = `.\\${baseName}\\bin\\${debugOrRelease}\\${baseName}.${version}.nupkg`;
    if (!fs.existsSync(fn)) {
      console.log('Unable to locate: ' + fn);
      process.exit(1);
    }
    return fn;
  });
  return nupkgs;
}

function deleteLocalAppCache(baseNames) {
  baseNames.forEach(baseName => {
    const cacheDir = localNugetCacheDir + '\\' + baseName;
    console.log(cacheDir);
    if (fs.existsSync(cacheDir)) {
      console.log('Deleting: ' + cacheDir)
      del(cacheDir, { force: true} );
    }
  })
};

