chrome.runtime.onInstalled.addListener(() => console.log("Runtime Installed"))




// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log(request)
//   if (request.action == "me-response") {
//     chrome.storage.local.set({"realmId": request.realmId})
//     log.innerText = `Realm = ${realmId}`
//     console.log(request)
//   }
// });

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//   if(changeInfo.status == "complete") {
//       if(!tab.url.match("(https:\/\/www.simcompanies.com\/headquarters\/warehouse\/)")) { return; } // Wrong scheme
//       var filename = getSpecificFilename("../scripts/content-script.js");
//       alert('peepee')
//       chrome.tabs.executeScript(tabId, {file: filename}, function() {
//           //script injected
//       });
//   }
// });