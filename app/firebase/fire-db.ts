var admin = require("firebase-admin");

var serviceAccount = require("./dayton-sheets-1377c-firebase-adminsdk-fbsvc-0ce072a780.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://dayton-sheets-1377c-default-rtdb.firebaseio.com"
});
