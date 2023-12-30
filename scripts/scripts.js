const form = document.getElementById("contract-form");
const market = document.getElementById("market-form");

//table 
const currentItem = document.getElementById("current-item");
const currentQuality = document.getElementById("quality");
const currentRealm = document.getElementById("current-realm")
const currentDiscount = document.getElementById("discount")
const currentPrice = document.getElementById("current-price")
const contractPrice = document.getElementById("contract-price")

form.addEventListener(
    "submit",
    (event) => {
        const data = new FormData(form);
        for (const entry of data) {
            const obj = {};
            obj[entry[0]] = entry[1];
            chrome.storage.local.set(obj)
        }
        event.preventDefault();
        
    },
    false,
);

market.addEventListener("submit", 
    (event) => {
        getMarketPrices();
        event.preventDefault();
    }, 
    false
);

function getMarketPrices() {
    chrome.storage.local.get(["resourceId", "quality", "realmId", "resourceType"], (result) => {
        const {resourceId, quality, realmId, resourceType} = result
        if (quality !== undefined && realmId !== undefined && resourceType !== undefined) {
            chrome.tabs.query({
                active: true,
                currentWindow: true
              }, tabs => {
                // ...and send a request for the DOM info...

                    var qual = 0
                    if (resourceType == "research") {
                        qual = 0;
                    } else {
                        parseInt(quality)
                    }
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        {action: "market-query", realmId: realmId, resourceId: resourceId, quality:qual}
                    );
              }
            );
        }
    });
}

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
                    
                    let resourceId = d[`${resource}`]["id"];
                    let resourceType = [`${resource}`]["type"];

                    if(resourceId) {
                        chrome.storage.local.set({"resourceId": resourceId})
                        currentItem.innerText = resource
                    }
                    if (resourceType) {
                        chrome.storage.local.set({"resourceType": resourceType})
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

function voidForm(text="<div class=\"flex\"><p>Current Page does not support sending contracts. Contract Calculation is only supported while on the contract screen<br/><br/></p></div>") {
    document.getElementById("container").innerHTML = text
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request)
    if (request.action == "me-response") {
        chrome.storage.local.set({"realmId": request.realmId})
        currentRealm.innerText = request.realmId == 1 ? "Entrepenures (R2)" : "Magnates (R1)"
        getMarketPrices();
    } else if (request.action == "market-response") {
        currentPrice.innerText = `$${request.price}`

        var discount = currentDiscount.value;
        if (discount) {
            let contractMultiplier = (100.0 - parseInt(discount))/100
            let discountPrice = (request.price * contractMultiplier).toFixed(3)
            
            contractPrice.innerText = `$${discountPrice}`
            navigator.clipboard.writeText(discountPrice);

            chrome.tabs.query({
                active: true,
                currentWindow: true
                }, tabs => {
                    if (tabs[0].url.startsWith("https://www.simcompanies.com/")) {
                        chrome.tabs.sendMessage(
                            tabs[0].id,
                            { action: "set-price", price: discountPrice }
                        );
                    }
                }
            );
        }
    }
});

window.addEventListener('DOMContentLoaded', () => {
    // ...query for the active tab...
    chrome.tabs.query({
        active: true,
        currentWindow: true
        }, tabs => {
            if (tabs[0].url.startsWith("https://www.simcompanies.com/")) {
                chrome.tabs.sendMessage(
                    tabs[0].id,
                    {action: "me-query"}
                );
            }
        }
    );
    }
  );