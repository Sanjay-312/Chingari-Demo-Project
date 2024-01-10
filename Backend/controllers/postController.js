const client = require("../database/pg");
const { storage } = require("../config/fireBaseConfig");
const redis = require("redis");

const env = require("dotenv");
env.config();

(async () => {
  redisClient = redis.createClient();

  redisClient.on("error", (error) => console.error(`Error : ${error}`));

  await redisClient.connect();
})();

const createPost = async (req, res) => {
  const { post_content } = req.body;
  //console.log(req.user);
  const user_id = req.user.user_id;
  const currentDate = new Date();
  const picFile = req.file;
  if (!picFile) {
    res.status(400);
    res.send("please provide a pic");
  }
  const picName = `user_${user_id}_picture_${currentDate.toISOString()}.jpg`;
  const bucket = storage.bucket(process.env.POST_BUCKET);
  const file = bucket.file(picName);

  try {
    await file.save(picFile.buffer);

    const [gcsPictureUrl] = await file.getSignedUrl({
      action: "read",
      expires: "2030-01-01",
    });

    await client.query(
      "insert into posts(post_content,post_image,created_date,user_id) values($1,$2,$3,$4) returning *",
      [post_content, gcsPictureUrl, currentDate, user_id]
    );
    res.send("created post");
  } catch (error) {
    console.log(error);
  }
};

const getAllUsersFeed = async (req, res) => {
  let results;
  let isCached = false;
  let cachedResults;
  //redisClient.del("feed");
  try {
    cachedResults = await redisClient.get("feed");
    if (cachedResults) {
      isCached = true;

      results = JSON.parse(cachedResults);
    } else {
      const feedQuery = `select
      posts.post_id,
      posts.post_content,
      posts.post_image,
      posts.created_date as posted_date,
      users.user_id,
      posts.likes,
      users.user_name,
      users.profile_image
      from posts inner join users
      on posts.user_id=users.user_id order by random()`;
      posts = await client.query(feedQuery);
      console.log("Request sent to the API");
      results = posts.rows;

      if (posts.rowCount === 0) {
        throw "API returned an empty array";
      }
      await redisClient.set("feed", JSON.stringify(results));
    }
    shuffleArray(results);
    res.send({
      fromCache: isCached,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
};

const getSingleUserFeed = async (req, res) => {
  const { user_id } = req.params;
  let results;
  let isCached = false;
  let cachedResults;
  //redisClient.del("singleUserFeed");

  try {
    cachedResults = await redisClient.get("singleUserFeed");
    if (cachedResults) {
      isCached = true;

      results = JSON.parse(cachedResults);
    } else {
      posts = await client.query("select * from posts where user_id=$1", [
        user_id,
      ]);
      console.log("Request sent to the API");
      results = posts.rows;
      //console.log(results);

      if (posts.rowCount === 0) {
        throw "API returned an empty array";
      }
      await redisClient.set("singleUserFeed", JSON.stringify(results));
    }

    res.send({
      fromCache: isCached,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
};

const getLoggedInUserFeed = async (req, res) => {
  const user_id = req.user.user_id;
  //console.log(user_id);
  let results;
  let isCached = false;
  let cachedResults;
  //redisClient.del("loggedInUserFeed");
  try {
    cachedResults = await redisClient.get("loggedInUserFeed");
    if (cachedResults) {
      isCached = true;

      results = JSON.parse(cachedResults);
    } else {
      posts = await client.query("select * from posts where user_id=$1", [
        user_id,
      ]);
      console.log("Request sent to the API");
      results = posts.rows;
      console.log(results);

      if (posts.rowCount === 0) {
        throw "API returned an empty array";
      }
      await redisClient.set("loggedInUserFeed", JSON.stringify(results));
    }

    res.send({
      fromCache: isCached,
      data: results,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Data unavailable");
  }
};

const deletePost = async (req, res) => {
  const { post_id } = req.params;
  const { user_id } = req.user;
  console.log(post_id, user_id);
  try {
    const loggedInUser = await client.query(
      "select * from posts where  user_id=$1 and post_id=$2",
      [user_id, post_id]
    );
    //console.log(loggedInUser.rows[0]);
    if (
      loggedInUser.rows[0].user_id !== user_id ||
      loggedInUser.rowCount === 0
    ) {
      return res.status(403).send("unauthorized");
    }
    const splittedPicName = loggedInUser.rows[0].post_image.split("/");

    const picName = splittedPicName.pop().split("?")[0];
    const decodedPicName = decodeURIComponent(picName);
    const bucket = storage.bucket(process.env.POST_BUCKET);

    const file = bucket.file(decodedPicName);

    await file.delete();
    console.log("pic delted from GCP");

    await client.query("delete from posts where post_id=$1 and user_id=$2", [
      post_id,
      user_id,
    ]);
    res.send("post deleted successfuly");
  } catch (error) {
    console.log("unable to delete");
    res.status(403).send(error);
  }
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

module.exports = {
  createPost,
  getAllUsersFeed,
  getSingleUserFeed,
  getLoggedInUserFeed,
  deletePost,
};
