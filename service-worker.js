const APP_PREFIX = "budget";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
  "./public/index.html",
  "./public/css/style.css",
  "./models/transaction.js",
  "./public/js/idb.js",
  "./public/js/index.js",
  "./routes/api.js",
  "./server.js",
];

//install service worker and cache resources
self.addEventListener("install", function (e) {
  //tell the browser to wait until work is complete before terminating service worker
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log("installing cache : " + CACHE_NAME);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

//activate service worker and delete outdated caches
self.addEventListener("activate", function (e) {
  e.waitUntil(
    //key() returns array of all cached names (keyList)
    caches.keys().then(function (keyList) {
      let cacheKeeplist = keyList.filter(function (key) {
        //filter out caches that have app prefix and save them in cacheKeepList
        return key.indexOf(APP_PREFIX);
      });
      cacheKeeplist.push(CACHE_NAME);

      //return a promise that resolves once older versions have been deleted
      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeeplist.indexOf(key) === -1) {
            console.log("deleting cache : " + keyList[i]);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

//retrieve info from cache
//listen for fetch event, log the URL, then define how to respond to request
self.addEventListener("fetch", function (e) {
  console.log("fetch request : " + e.request.url);
  //intercept the fetch req; 
  e.respondWith(
    //determine if resource is already in the caches
    caches.match(e.request).then(function (request) {
      if (request) {
        // if cache is available, respond with cache
        console.log("responding with cache : " + e.request.url);
        return request;
      } else {
        // if there are no cache, try fetching request
        console.log("file is not cached, fetching : " + e.request.url);
        return fetch(e.request);
      }
      // You can omit if/else for console.log & put one line below like this too.
      // return request || fetch(e.request)
    })
  );
});

