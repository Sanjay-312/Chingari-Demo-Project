const admin = require("firebase-admin");
const credentials = require("../key.json");

admin.initializeApp({
  credential: admin.credential.cert(credentials),
});
const storage = admin.storage();
module.exports = { admin, storage };
