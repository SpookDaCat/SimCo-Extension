const form = document.getElementById("contract-form");
const market = document.getElementById("market-form");
const log = document.getElementById("log");

//table 
const currentItem = document.getElementById("current-item");
const currentQuality = document.getElementById("quality");
const currentRealm = document.getElementById("current-realm")
const currentDiscount = document.getElementById("discount")

form.addEventListener(
    "submit",
    (event) => {
        const data = new FormData(form);
        for (const entry of data) {
            const obj = {};
            obj[entry[0]] = entry[1];
            chrome.storage.local.set(obj)
        }
        log.innerText = output;
        event.preventDefault();
        
    },
    false,
);

market.addEventListener("submit", 
    (event) => {
        chrome.storage.local.get(["resourceId", "quality", "realmId", "discount"], (result) => {
            const {resourceId, quality, realmId, discount} = result
            //console.log(quality, realmId)
            if (quality !== undefined && realmId !== undefined) {
                //alert("sending...")
                chrome.tabs.query({
                    active: true,
                    currentWindow: true
                  }, tabs => {
                    // ...and send a request for the DOM info...
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            {action: "market-query", realmId: realmId, resourceId: resourceId, quality:parseInt(quality)}
                        );
                  }
                );
            }


        });
        event.preventDefault();
    }, 
    false
);

//init
chrome.tabs.query({active:true, lastFocusedWindow:true}, tabs => {
    let url = tabs[0].url;

    if (url && url.startsWith("https://www.simcompanies.com/headquarters/warehouse/")) {

        //#region get resource from URL
        // removes redundant crap
        let resource = url.replace("https://www.simcompanies.com/headquarters/warehouse/", "") 
        
        
        // if valid resource
        if (resource) {
            
            chrome.storage.local.set({"resource": resource})

            // get resource id from resource name
            fetch("../items.json")
                .then(response => response.json())
                .then(d => {
                    
                    let resourceId = d[`${resource}`];

                    if(resourceId) {
                        chrome.storage.local.set({"resourceId": resourceId})
                        currentItem.innerText = `(${resourceId}) ${resource}`
                    }
                });

            // set quality and realm from cache
            

            chrome.storage.local.get(["quality", "realmId", "discount"], (result) => {
                const {quality, discount} = result
                if (quality) {
                    currentQuality.value = quality;
                }
    
                if (discount) {
                    currentDiscount.value = discount
                }
            });

        } else {
            voidForm();
        }
    //#endregion

    } else {
        voidForm();
    }
})

async function fetchMarketPrices(resourceId, realm) {
    $.ajax({
        type: 'GET',
        url: `https://www.simcompanies.com/api/v3/market/${realm}/${resourceId}/`,
        dataType: "json",
        headers: {
            "Accept-Language": "en-US,en;q=0.9",
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "text/plain"
        },
        beforeSend: function(xhr) {
            xhr.setRequestHeader(
                'X-Requested-With',
                {
                    toString: function() { return ''; }
                }
            );
        },
        success: function(data, status, xhr) {
            console.log(data)
        }
    });
}

function voidForm(text="<p>Current Page does not support sending contracts.</p>") {
    document.getElementById("log").innerHTML = text
}



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request)
    if (request.action == "me-response") {
        chrome.storage.local.set({"realmId": request.realmId})
        //log.innerText = `Realm = ${request.realmId}`
        currentRealm.innerText = request.realmId == 1 ? "Entrepenures" : "Magnates"
    } else if (request.action == "market-response") {
        
    }
});

window.addEventListener('DOMContentLoaded', () => {
    // ...query for the active tab...
    chrome.tabs.query({
      active: true,
      currentWindow: true
    }, tabs => {
      // ...and send a request for the DOM info...
        chrome.tabs.sendMessage(
            tabs[0].id,
            {action: "me-query"}
        );

    });
  });