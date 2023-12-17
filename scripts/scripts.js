const discountLabel = document.getElementById('discount');
const qualityLabel = document.getElementById('current-quality');
const qualityInput = document.getElementById("quality");
const currentItem = document.getElementById("current-item");
const realmInput = document.getElementById("realm")
const currentRealm = document.getElementById("current-realm")

function validate(){
    let discount = {"discount": discountLabel.value};
    let quality = {"quality": qualityInput.value};

    qualityLabel.innerText = qualityInput.value;

    chrome.storage.local.set(discount)
    chrome.storage.local.set(quality)
}
function init(){
    document.getElementById('contract-form').onsubmit = validate;

    // sets from storage
    chrome.storage.local.get(["discount", "quality", "realm"], (result) => {
        const {discount, quality, realm} = result
        if (discount) {
            discountLabel.value = discount
        }
        if(quality) {
            qualityLabel.innerText = quality
        }
        if (realm) {
            currentRealm.innerText = realm
        }
    })

    //checks if simco is open
    chrome.tabs.query({active:true, lastFocusedWindow:true}, tabs => {
        let url = tabs[0].url;

        if (url && url.startsWith("https://www.simcompanies.com/headquarters/warehouse/")) {
            let resource = url.replace("https://www.simcompanies.com/headquarters/warehouse/", "") // removes redundant crap
            resource = resource.charAt(0).toUpperCase() + resource.slice(1).toLowerCase()
            
            // valid resource
            if (resource) {
                currentItem.innerText = resource
                chrome.storage.local.set(resource)

                fetch('../items.json')
                    .then((response) => response.json())
                    .then((json) => chrome.storage.local.set({"items": json}));

            } else {
                voidForm();
            }
        } else {
            voidForm();
        }
    })
}

function voidForm(text="<p>Current Page does not support sending contracts.</p>") {
    document.getElementById("log").innerHTML = text
}

async function fetchMarketPrices(resourceId, realm, quality) {
    const response = await fetch(`https://www.simcompanies.com/api/v3/market/${realm}/${resourceId}/`)
        .then(reposResponse => {
            return reposResponse.json();
        })
        .then(userRepos => {
            console.log(userRepos);
        })
        .catch(err => {
            console.log(err);
        });
    const items = await response.json();
    console.log(items);
}

function sendRequest(url) {
    return fetch(url, {
        mode: 'no-cors',
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

window.onload = init;