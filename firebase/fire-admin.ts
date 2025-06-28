
import admin from "firebase-admin";
// Initialize Firebase Admin SDK
const serviceAccount = require('./dayton-sheets-1377c-firebase-adminsdk-fbsvc-0ce072a780.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

export {admin};