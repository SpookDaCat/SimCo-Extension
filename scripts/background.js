chrome.webNavigation.onCompleted.addListener(
    async () => {
      //await chrome.action.openPopup();
    },
    { url: [
    //   { urlMatches: 'https://www.simcompanies.com/headquarters/warehouse/*' },
    { urlMatches: 'https://example.org/' }
    ] },
  );
