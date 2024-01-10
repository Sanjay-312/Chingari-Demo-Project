const client = require("../database/pg");

const likePost = async (req, res) => {
  try {
    const { post_id } = req.params;
    const { user_id } = req.user;
    const current_date = new Date();

    const existingTweet = await client.query(
      "select * from posts where post_id=$1",
      [post_id]
    );

    if (!existingTweet.rowCount > 0) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const alredayLiked = await client.query(
      "select * from likes where user_id=$1 and post_id=$2",
      [user_id, post_id]
    );

    if (alredayLiked.rowCount > 0) {
      res.status(400).json("you have already liked this post");
    } else {
      const likePost = await client.query(
        "insert into likes (post_id,user_id,liked_at) values($1,$2,$3) returning * ",
        [post_id, user_id, current_date]
      );
      await client.query("update posts set likes=likes+1 where post_id=$1", [
        post_id,
      ]);
      res.status(200);
      res.json({ message: "you liked this post", like: likePost.rows[0] });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const unlikePost = async (req, res) => {
  const { post_id } = req.params;
  const uid = req.user.user_id;
  try {
    const details = await client.query(
      "delete from likes where post_id=$1 and user_id=$2 returning *",
      [post_id, uid]
    );
    if (details.rowCount === 0) {
      res.status(404).json({ error: "you haven't liked this post" });
    } else {
      await client.query("update posts set likes=likes-1 where post_id=$1", [
        post_id,
      ]);
      res.status(200).json({
        message: "unliked successfully",
        like: details.rows[0],
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("internal server error");
  }
};
module.exports = { likePost, unlikePost };
