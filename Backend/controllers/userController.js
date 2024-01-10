const client = require("../database/pg");
const { storage } = require("../config/fireBaseConfig");

const env = require("dotenv");
env.config();

const userSignIn = async (req, res) => {
  const user = req.user;
  res.send(user);
};

const updateProfilePic = async (req, res) => {
  const uid = req.user.user_id;
  const picFile = req.file;
  const current_date = new Date();
  console.log(uid);

  if (!picFile) {
    res.status(400);
    res.send("please provide a pic");
  }

  const picFileName = `user_${uid}_picture.jpg`;
  const bucket = storage.bucket(process.env.BUCKET_NAME);
  const file = bucket.file(picFileName);
  try {
    await file.save(picFile.buffer);
    const [gcsPictureUrl] = await file.getSignedUrl({
      action: "read",
      expires: "2030-01-01",
    });
    await client.query(
      "update users set profile_image=$2,updated_at=$3 where user_id=$1",
      [uid, gcsPictureUrl, current_date]
    );
    res.status(200);
    res.send("profile pic updated sucessfully");
  } catch (error) {
    console.log(error);
    res.send("error in updating picture");
  }
};

const deleteUser = async (req, res) => {
  const uid = req.user.user_id;

  const userDetails = await client.query(
    "select * from users where user_id=$1",
    [uid]
  );
  if (userDetails.rowCount === 0) {
    res.send("no users found");
  } else {
    const splittedPicName = userDetails.rows[0].profile_image.split("/");
    const picName = splittedPicName.pop().split("?")[0];
    //console.log(picName);
    const bucket = storage.bucket(process.env.BUCKET_NAME);

    const file = bucket.file(picName);
    try {
      await file.delete();
      console.log("pic delted from GCP");
    } catch (error) {
      console.log(error);
    }
    await client.query("delete from users where user_id=$1", [uid]);
    res.status(200).send("user deleted from database");
  }
};

module.exports = {
  userSignIn,
  updateProfilePic,
  deleteUser,
};
