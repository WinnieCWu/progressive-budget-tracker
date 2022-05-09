let db;
const request = indexedDB.open("pwa-budget-tracker", 1);

// this event will occur if the database version changes 
request.onupgradeneeded = function (event) {
    const db = event.target.result; 
    db.createObjectStore("new_transaction", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransactions();
    }
};

//inform us if anything goes wrong with db interaction
request.onerror = function(event) {
    // log error here
    console.log(event.target.errorCode);
};

// This function will be executed if we attempt to submit an updated transaction and there's no internet connection
function saveRecord(record) {
    const transaction = db.transaction(["new_transaction"], "readwrite");
      // access the object store for `new transaction'
    const transactionObjectStore = transaction.objectStore("new_transaction");
    // add record to your store with add method
    transactionObjectStore.add(record);
};

function uploadTransactions() {
    // open a transaction on your db
    const transaction = db.transaction(["new_transaction"], "readwrite");
    // access your object store
    const transactionObjectStore = transaction.objectStore("new_transaction");
    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
      // if there was data in indexedDb's store, let's send it to the api server
      if (getAll.result.length > 0) {
        fetch("/api/transaction", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          }
        })
          .then((response) => response.json())
          .then((serverResponse) => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(["new_transaction"], "readwrite");
            // access the transaction object store
            const transactionObjectStore = transaction.objectStore("new_transaction");
            // clear all items in your store
            transactionObjectStore.clear();
  
            alert("All saved new transactions has been submitted!");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    };
  }
  
  // listen for app coming back online
  window.addEventListener('online', uploadTransactions);