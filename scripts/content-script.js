chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(request)

    if(request.action === "me-query") {

        const response = fetch("https://www.simcompanies.com/api/v2/companies/me/")
            .then(response => {
                return response.json();
            })
            .then(json => {
                let realmId = json["authCompany"]["realmId"];
                console.log(`Realm ID: ${realmId}`)
                
                chrome.runtime.sendMessage(
                    {action: "me-response",realmId: realmId}
                )

            })
            .catch(err => {
                console.log(err);
            });
    }

    else if (request.action === "market-query") {
        console.log("Fetching market data...")
        const response = fetch(`https://www.simcompanies.com/api/v3/market/${request.realmId}/${request.resourceId}/`)
            .then(response => {
                console.log("unpacking response...")
                return response.json();
            })
            .then(json => {
                let d = json.filter((post) => post["quality"] >= request.quality)[0]["price"]
                console.log("Sending response", d)

                chrome.runtime.sendMessage({action: "market-response", price: d})
            })
            .catch(err => {
                console.log(err);
            });
    }
    else if (request.action == "set-price") {
        /*
        {
            action: "set-price",
            price: "1234"
        }
        */

        let priceInputsList = document.querySelectorAll('[name="price"]') // gets all elements with name=price
        if (priceInputsList.length > 0 && request.price) {
            let priceInput = priceInputsList[0]
            console.log(priceInput)
            priceInput.value = request.price
        }
    }
  });