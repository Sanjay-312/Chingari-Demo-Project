import "./index.css";
import { FaRegHeart } from "react-icons/fa";

const Post = (props) => {
  const {
    content,
    Image,
    posted,
    likes,
    userName,
    profilePic,
    likePost,
    post_id,
  } = props;

  const addLike = () => {
    likePost(post_id);
  };
  const date = posted.split("T")[0];
  return (
    <li className="tweet-list-item">
      <div className="user-profile-pic-container">
        <img className="user-profile-pic" src={profilePic} alt="" />
      </div>
      <div className="tweet-container">
        <div className="tweet-username-time-container">
          <h1 className="tweet-username">{userName}</h1>
          <p className="tweet-time">{date}</p>
        </div>
        <p className="tweet-content">{content}</p>
        {Image && <img className="tweet-picture" src={Image} alt="" />}
        <div className="like-container">
          <FaRegHeart size={"20px"} onClick={addLike} />
          {likes ? <span>{likes}</span> : ""}
        </div>
      </div>
    </li>
  );
};

export default Post;
