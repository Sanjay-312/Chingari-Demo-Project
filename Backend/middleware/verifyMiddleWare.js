const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const jwt = require("jsonwebtoken");

const { admin, storage } = require("../config/fireBaseConfig");
const client = require("../database/pg");

const env = require("dotenv");
env.config();

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const userDetails = await admin.auth().verifyIdToken(token);

    if (userDetails) {
      const user_id = userDetails.uid;
      const name = userDetails.name;
      const picture = userDetails.picture || null;
      const email = userDetails.email;
      const currentDate = new Date();
      const payLoad = { user_id: user_id, user_email: email };
      const jwtToken = jwt.sign(payLoad, "my-secret-key", {
        expiresIn: "1 day",
      });
      //console.log(jwtToken);
      const existingUser = await client.query(
        "select * from users where user_id=$1",
        [user_id]
      );

      if (existingUser.rows.length === 0) {
        const proflePicName = `user_${user_id}_picture.jpg`;
        const picUrl = await uploadPictute(proflePicName, picture);

        await client.query(
          "insert into users (user_id,user_name,profile_image,user_email,created_at,updated_at) values($1,$2,$3,$4,$5,$6) returning * ",
          [user_id, name, picUrl || null, email, currentDate, currentDate]
        );
      }
      req.user = userDetails;
      console.log(jwtToken);
      next();
    } else {
      res.status(401).send("unauthorized");
    }
  } catch (error) {
    console.error(error);
    res.status(401).send("unauthoized");
  }
};

const uploadPictute = async (proflePic, picUrl) => {
  const bucket = storage.bucket(process.env.BUCKET_NAME);

  const file = bucket.file(proflePic);
  const response = await fetch(picUrl);

  const imageBuffer = await response.buffer();
  await file.save(imageBuffer);

  const [gcsPictureUrl] = await file.getSignedUrl({
    action: "read",
    expires: "2030-01-01",
  });
  return gcsPictureUrl;
};

const verifyJwtToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    if (!token) {
      res.status(401);
      res.send("invalid access token");
    } else {
      const data = jwt.verify(token, "my-secret-key");
      //console.log(data);
      req.user = data;
    }
    return next();
  } catch (error) {
    console.log(error);
    res.status(403);
    res.send("invalid access token");
  }
};

module.exports = { verifyToken, verifyJwtToken };
