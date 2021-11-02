// idb by Jack Loveday

// Init idb
let idb;

// Request for a 'budget' db
const request = indexedDB.open("budget", 1);

// 'onupgradeneeded' request
request.onupgradeneeded = (event) => {

    // Create idb obj and set its auto inc
    const idb = event.target.result;
    idb.createObjectStore("pending", {
        autoIncrement: true
    });
};

// 'onsuccess' request
request.onsuccess = (event) => {
    idb = event.target.result;

    // Check Connection for idb
    if (navigator.onLine) {
        checkDatabase();
    }
};

// 'onerror' request
request.onerror = (event) => {

    // Console log our error
    console.log("idb Error: " + event.target.errorCode);
};

// Create and save a new record
function saveRecord(record) {

    // Open a new transaction record
    const transaction = idb.transaction([
        "pending"
    ], "readwrite");

    // Access for 'pending', then add our new record
    const idbStore = transaction.objectStore("pending");
    idbStore.add(record);
}

// 
function checkDatabase() {

    // Open a new transaction record
    const transaction = idb.transaction([
        "pending"
    ], "readwrite");

    // Access for 'pending'
    const idbStore = transaction.objectStore("pending");

    // Get all of the records in idb
    const getAll = idbStore.getAll();

    // Run the following on getAll's success
    getAll.onsuccess = () => {

        // If getAll has data
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })

            // Then return our response data as a json file
            .then(resData => resData.json())

            //
            .then(() => {

                // Open a new transaction record
                const transaction = idb.transaction([
                    "pending"
                ], "readwrite");

                // Access for 'pending'
                const idbStore = transaction.objectStore("pending");

                // Empty the idb
                idbStore.clear();
            });
        }
    };
}

// Keep listening for the app
window.addEventListener("online", checkDatabase);