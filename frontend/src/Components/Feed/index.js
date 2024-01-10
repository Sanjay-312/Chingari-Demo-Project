import { Component } from "react";
import "./index.css";
import Post from "../UserPost/Post";

// const Feed = ({ posts }) => {
//   //console.log(posts);
//   posts.map((post) => console.log(post.post_content));

//   return (
//     <div className="feed">
//       {posts.map((post) => (
//         <Post
//           key={post.post_id}
//           content={post.post_content}
//           Image={post.post_image}
//           posted={post.posted_date}
//           likes={post.likes}
//           userName={post.user_name}
//           profilePic={post.profile_image}
//         />
//       ))}
//     </div>
//   );
// };

class Feed extends Component {
  state = { userFeedData: null };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    try {
      const response = await fetch("http://localhost:4000/AllUsersfeed");
      if (response.ok) {
        const userData = await response.json();
        //console.log(userData.data);
        this.setState({ userFeedData: userData });
      } else {
        console.error("Failed to fetch user feed");
      }
    } catch (error) {
      console.error("Error fetching user feed:", error);
    }
  };
  likePost = async (post_id) => {
    let url = `http://localhost:4000/posts/${post_id}/like`;
    const options = {
      method: "PUT",
      headers: {
        Authorization:
          "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiQnVRcGg5OEp3MmVwM1k2a3JINUpHZ1N4T3poMSIsInVzZXJfZW1haWwiOiJzYW5qZWV2YUBjaGluZ2FyaS5pbyIsImlhdCI6MTcwNDc4MDU5M30.21pEYaRXypSM4td1gaKUqy3Uz47hXwTAe_M1N9gJHDo",
      },
    };
    await fetch(url, options);
    this.fetchData();
  };

  render() {
    const { userFeedData } = this.state;
    let userFeed = null;
    if (userFeedData) {
      userFeed = userFeedData.data;
    }
    return (
      <div className="user-feed-page-container">
        <div className="user-feed-page">
          <h1 className="user-feed-heading">Posts</h1>
          {userFeed && (
            <ul className="tweets-list">
              {userFeed.map((post) => (
                <Post
                  key={post.post_id}
                  content={post.post_content}
                  userName={post.user_name}
                  Image={post.post_image}
                  posted={post.posted_date}
                  profilePic={post.profile_image}
                  likes={post.likes}
                  post_id={post.post_id}
                  likePost={this.likePost}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
}

export default Feed;
