browser.contextMenus.create({
  id: "shortenUrl",
  title: "Copy shortened URL",
  // contexts: ["link"],
});
browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "shortenUrl") {
    shortenCurrentUrl();
  }
});

function shortenCurrentUrl() {
  // query tabs to get current tab
  browser.tabs.query({
    currentWindow: true,
    active: true
  }).then(queryInfo => {
    browser.tabs.get(queryInfo[0].id).then(tab => {
      var tabUrl = tab.url;
      fetch("https://1t1.nl/api/v2/action/shorten?key=3835e9fbac074cb68373a2da363d68&response_type=json&url=" + tab.url, {
          method: "GET"
        })
        // .then(response => console.log("Response received! " + JSON.stringify(response)))
        .then(response => response.json())

        .then(response => {
          console.log('Success:' + response['result']);
          var shortened = response['result'];
          if (shortened != null && shortened.includes("http")) {
            console.log("contains http");
            toClipBoard(tab, shortened);
          }
        })
        .catch(error => console.error('Error:', error));
    });
  });
}

function toClipBoard(tab, str){
  // The example will show how data can be copied, but since background
  // pages cannot directly write to the clipboard, we will run a content
  // script that copies the actual content.
  // clipboard-helper.js defines function copyToClipboard.
  const code = "copyToClipboard('"+str+"');";

  browser.tabs.executeScript({
    code: "typeof copyToClipboard === 'function';",
  }).then((results) => {
    // The content script's last expression will be true if the function
    // has been defined. If this is not the case, then we need to run
    // clipboard-helper.js to define function copyToClipboard.
    if (!results || results[0] !== true) {
      return browser.tabs.executeScript(tab.id, {
        file: "clipboard-helper.js",
      });
    }
  }).then(() => {
    return browser.tabs.executeScript(tab.id, {
      code,
    });
  }).catch((error) => {
    // This could happen if the extension is not allowed to run code in
    // the page, for example if the tab is a privileged page.
    console.error("Failed to copy text: " + error);
  });
}
