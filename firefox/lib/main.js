// Import the page-mod API
var pageMod = require("sdk/page-mod");
 
// Create a page mod
pageMod.PageMod({
  include: /https:\/\/bitbucket.org\/.*\/pull-request\/.*/i,
  contentScriptFile: ["./jquery-2.1.3.min.js", "./utils.js", "./app.js"]
});