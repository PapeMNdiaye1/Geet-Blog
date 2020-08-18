import React from "react";
import { myGetFetcher } from "../myFetcher";
import { myDeleteFetcher, myPostFetcher } from "../myFetcher";
import { Link } from "react-router-dom";
import Comments from "./Comment/Comments";
import ProfilesPresentation from "./ProfilePresentation";
import { debounce, throttle } from "lodash";

//! ##############################################################################
class HomePostsContainer extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      AllPost: [],
      AllPostArrayContaine: "",
      LastGrabPostArrayContaine: [],
      MyPosts: [],
      AllExistingId: [],
      // ###########################
      NumberOfPost: null,
      AllLikedPosts: this.props.AllLikedPosts,
      PostToComment: "",
      OpenComment: false,
      LodeMore: true,
    };
    this.getLastPosts = this.getLastPosts.bind(this);
    this.getOnlyMyPosts = this.getOnlyMyPosts.bind(this);
    this.getSomePost = this.getSomePost.bind(this);
    this.getScrollPosition = this.getScrollPosition.bind(this);
    this.grabPostIdFromPost = this.grabPostIdFromPost.bind(this);
    this.grabProfilePageIdFromPost = this.grabProfilePageIdFromPost.bind(this);
    this.getAllLikedPosts = this.getAllLikedPosts.bind(this);
    this.closeComment = this.closeComment.bind(this);
  }
  // ##############################################################################
  async componentDidMount() {
    document.querySelector(".posts_loader").style.display = "flex";

    this.getAllLikedPosts();
    let LastPosts = await myGetFetcher("/Post/get-last-post", "get");
    let AllMyPost = await myGetFetcher(
      `/Post/only-my-post/${this.props.UserId}`,
      "get"
    );
    await this.getLastPosts(LastPosts);
    await this.getOnlyMyPosts(AllMyPost);
    if (window.innerWidth <= 800) {
      document.querySelector(".users_on_top").style.display = "flex";
    } else {
      document.querySelector(".users_on_top").style.display = "none";
    }
  }
  // #############################################################################
  componentWillUnmount() {
    document.querySelector(".users_on_top").style.display = "none";
  }
  // #############################################################################
  async getLastPosts(data) {
    if (
      JSON.stringify(this.state.AllPostArrayContaine) !==
      JSON.stringify(data.allposts)
    ) {
      await this.setState({
        AllExistingId: [
          ...new Set([
            ...this.state.AllExistingId,
            ...data.allposts.map((postInfos) => postInfos._id),
          ]),
        ],
      });
      // ###################################
      let allPostArray = [];
      await data.allposts.map((postInfos) =>
        allPostArray.push(
          <Post
            key={postInfos._id}
            NofLike={postInfos.nofLikes}
            NofResponse={postInfos.postResponses.length}
            postImage={postInfos.postImage}
            postId={postInfos._id}
            postTitle={postInfos.postTitle}
            postDescription={postInfos.postDescription}
            postDate={postInfos.postDate}
            postAuthorId={postInfos.postAuthorId}
            postAuthorName={postInfos.postAuthorName}
            postAuthorPicture={postInfos.postAuthorPicture}
            deletePost="none"
            onComment={this.grabPostIdFromPost}
            onOpenProfilePage={this.grabProfilePageIdFromPost}
            UserId={this.props.UserId}
            allLikedPosts={this.state.AllLikedPosts}
          />
        )
      );
      await this.setState({
        AllPostArrayContaine: [...data.allposts],
        AllPost: allPostArray,
        NumberOfPost: allPostArray.length,
      });
    }
  }
  // #############################################################################
  async getOnlyMyPosts(data) {
    let myPostsArray = [];
    data.allposts.map((postInfos) => {
      return myPostsArray.push(
        <Post
          key={postInfos._id}
          NofLike={postInfos.nofLikes}
          NofResponse={postInfos.postResponses.length}
          postImage={postInfos.postImage}
          postImageId={postInfos.postImageId}
          postId={postInfos._id}
          postTitle={postInfos.postTitle}
          postDescription={postInfos.postDescription}
          postDate={postInfos.postDate}
          postAuthorId={postInfos.postAuthorId}
          postAuthorName={postInfos.postAuthorName}
          postAuthorPicture={postInfos.postAuthorPicture}
          deletePost="flex"
          onComment={this.grabPostIdFromPost}
          onOpenProfilePage={this.grabProfilePageIdFromPost}
          UserId={this.props.UserId}
          allLikedPosts={this.state.AllLikedPosts}
        />
      );
    });
    this.setState({
      MyPosts: myPostsArray,
    });
  }
  // #############################################################################
  async getSomePost(data) {
    if (
      JSON.stringify(this.state.LastGrabPostArrayContaine) !==
      JSON.stringify(data.allposts)
    ) {
      await this.setState({
        AllExistingId: [
          ...new Set([
            ...this.state.AllExistingId,
            ...this.state.LastGrabPostArrayContaine.map((post) => post._id),
          ]),
        ],
      });

      let somePostArray = [];
      await data.allposts.map(
        (postInfos) =>
          !this.state.AllExistingId.includes(postInfos._id) &&
          somePostArray.push(
            <Post
              key={postInfos._id}
              NofLike={postInfos.nofLikes}
              NofResponse={postInfos.postResponses.length}
              postImage={postInfos.postImage}
              postTitle={postInfos.postTitle}
              postId={postInfos._id}
              postDescription={postInfos.postDescription}
              postDate={postInfos.postDate}
              postAuthorId={postInfos.postAuthorId}
              postAuthorName={postInfos.postAuthorName}
              postAuthorPicture={postInfos.postAuthorPicture}
              deletePost="none"
              onComment={this.grabPostIdFromPost}
              onOpenProfilePage={this.grabProfilePageIdFromPost}
              UserId={this.props.UserId}
              allLikedPosts={this.state.AllLikedPosts}
            />
          )
      );
      await this.setState({
        NumberOfPost: this.state.NumberOfPost + somePostArray.length,
        LastGrabPostArrayContaine: [...data.allposts],
        AllPost: [...this.state.AllPost, ...somePostArray],
        LodeMore: true,
      });
    } else {
      this.setState({
        LodeMore: true,
      });
    }
  }
  // #############################################################################
  async getScrollPosition() {
    // ##################################
    try {
      const homePostsContainer = document.querySelector(
        ".home_posts_container"
      );
      let sroll = await Math.floor(
        (homePostsContainer.scrollTop /
          (homePostsContainer.scrollHeight - homePostsContainer.clientHeight)) *
          100
      );
      // ###################################
      if (sroll < 1) {
        let LastPosts = await myGetFetcher("/Post/get-last-post", "get");
        if (LastPosts.allposts.length > 0) {
          await this.getLastPosts(LastPosts);
        }
      } else if (sroll >= 90) {
        if (this.state.LodeMore) {
          let AllPost = await myGetFetcher(
            `/Post/get-some-post/${this.state.NumberOfPost}`,
            "get"
          );
          if (AllPost.allposts.length > 0) {
            this.setState({
              LodeMore: false,
            });
            await this.getSomePost(AllPost);
          } else {
            this.setState({
              LodeMore: false,
            });
            document.querySelector(".posts_loader").style.display = "none";
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  // ############################################################################
  async grabPostIdFromPost(childDataFromPost) {
    await this.setState({
      PostToComment: childDataFromPost,
      OpenComment: true,
    });
    document.querySelector(".close_comment").style.display = "flex";
  }
  closeComment() {
    this.setState({
      OpenComment: false,
    });
    document.querySelector(".close_comment").style.display = "none";
  }
  // ############################################################################
  grabProfilePageIdFromPost(childDataFromPost) {
    this.props.onOpenProfilePage(childDataFromPost);
  }
  // ###########################################################################
  async getAllLikedPosts() {
    let allLikedPosts = await myGetFetcher(
      `User/get-all-liked-posts/${this.props.UserId}`,
      "get"
    );
    await this.setState({
      AllLikedPosts: [
        ...allLikedPosts.response.allLikedPosts.map((post) => post.postId),
      ],
    });
  }
  // ?###########################################################################
  render() {
    let Comment = () => (
      <div className="the_comment_container">
        <Comments
          PostId={this.state.PostToComment}
          UserName={this.props.UserName}
          UserId={this.props.UserId}
          UserProfilePicture={this.props.UserProfilePicture}
          onOpenProfilePage={this.grabProfilePageIdFromPost}
          onCloseComment={this.closeComment}
        />
      </div>
    );
    let profilesPresentation = () => (
      <ProfilesPresentation
        UserId={this.props.UserId}
        UserName={this.props.UserName}
        UserEmail={this.props.UserEmail}
        ProfilePicture={this.props.UserProfilePicture}
        onOpenProfilePage={this.grabProfilePageIdFromPost}
      />
    );
    if (!this.props.SeeAllMyPost) {
      return (
        <React.Fragment>
          {this.state.OpenComment && Comment()}
          <div
            onScroll={throttle(this.getScrollPosition, 1000)}
            className="home_posts_container"
          >
            {this.state.AllPost}
            <div key="posts_loader" className="posts_loader">
              <div className="lds-ripple">
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
          {profilesPresentation()}
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {this.state.OpenComment && Comment()}
          <div className="home_posts_container">
            {this.state.MyPosts}
            <div key="posts_loader" className="posts_loader"></div>
          </div>
          {profilesPresentation()}
        </React.Fragment>
      );
    }
  }
}
//! #############################################################################
class Post extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      liked: false,
      NofLike: props.NofLike,
      PostDescription: <p>...</p>,
    };
    this.handleDeletePost = this.handleDeletePost.bind(this);
    this.handleComment = this.handleComment.bind(this);
    this.like = this.like.bind(this);
    this.dislike = this.dislike.bind(this);
    this.openProfilePage = this.openProfilePage.bind(this);
    this.sowAlldescription = this.sowAlldescription.bind(this);
    this.showDeleteoverlay = this.showDeleteoverlay.bind(this);
    this.closeDeleteoverlay = this.closeDeleteoverlay.bind(this);
    this.clickToName = this.clickToName.bind(this);
  }
  async componentDidMount() {
    if (this.props.allLikedPosts.includes(this.props.postId)) {
      await this.setState({
        liked: true,
      });
    } else {
      this.setState({
        liked: false,
      });
    }
    // ###############################
    if (this.props.postDescription.length > 113) {
      this.setState({
        PostDescription: (
          <p>
            {this.props.postDescription.slice(0, 113) + "... "}
            <samp onClick={this.sowAlldescription}>Ride-More</samp>
          </p>
        ),
      });
    } else {
      this.setState({
        PostDescription: <p>{this.props.postDescription}</p>,
      });
    }
  }
  // ################################################################################
  async handleDeletePost() {
    myDeleteFetcher(`Post/delete-one-post/${this.props.postId}`);
    if (this.props.postImage !== "") {
      myDeleteFetcher(`/files/${this.props.postImageId}`);
    }
    document.getElementById(this.props.postId).style.display = "none";
  }
  // ################################################################################
  handleComment(e) {
    this.props.onComment(this.props.postId);
    // console.log(this.props.postId);
  }
  // ################################################################################
  like() {
    this.setState({
      liked: true,
      NofLike: this.state.NofLike + 1,
    });
    myPostFetcher(`/Post/like-and-dislike/${this.props.postId}`, {
      operation: "like",
      UserId: this.props.UserId,
      N: this.state.NofLike + 1,
    });
  }
  // ################################################################################
  dislike() {
    this.setState({
      liked: false,
      NofLike: this.state.NofLike - 1,
    });
    myPostFetcher(`/Post/like-and-dislike/${this.props.postId}`, {
      operation: "dislike",
      UserId: this.props.UserId,
      N: this.state.NofLike - 1,
    });
  }
  // ################################################################################
  openProfilePage() {
    this.props.onOpenProfilePage(this.props.postAuthorId);
  }
  // ################################################################################
  sowAlldescription() {
    this.setState({
      PostDescription: <p>{this.props.postDescription}</p>,
    });
  }
  // ################################################################################
  showDeleteoverlay() {
    document.getElementById(`overlay${this.props.postId}`).style.display =
      "flex";
  }
  // ################################################################################
  closeDeleteoverlay() {
    document.getElementById(`overlay${this.props.postId}`).style.display =
      "none";
  }

  // ################################################################################
  clickToName(e) {
    document.getElementById(`post_author_picture${this.props.postId}`).click();
  }
  // ?################################################################################
  render() {
    let theHeart;
    if (this.state.liked) {
      theHeart = (
        <div className="post_option heart_active" onClick={this.dislike}>
          <i className="fas fa-angle-double-down"></i>
        </div>
      );
    } else {
      theHeart = (
        <div className="post_option heart" onClick={this.like}>
          <i className="fas fa-angle-double-up"></i>
        </div>
      );
    }
    // ####################################
    let postImage;
    if (this.props.postImage !== "") {
      postImage = (
        <img
          onClick={this.handleComment}
          src={`image/${this.props.postImage}`}
          alt={this.props.postTitle}
          width="100%"
        />
      );
    } else {
      postImage = null;
    }
    // ####################################
    let theProfilePicture;
    if (this.props.postAuthorPicture !== "") {
      theProfilePicture = { backgroundImage: this.props.postAuthorPicture };
    } else {
      theProfilePicture = { background: "#000" };
    }

    let ProfilePicture;
    if (this.props.UserId === this.props.postAuthorId) {
      ProfilePicture = (
        <Link style={{ textDecoration: "none" }} to="/my-profile-page">
          <div
            style={theProfilePicture}
            className="post_author_picture btn"
            id={`post_author_picture${this.props.postId}`}
          ></div>
        </Link>
      );
    } else {
      ProfilePicture = (
        <Link style={{ textDecoration: "none" }} to="/profile-page">
          <div
            onClick={this.openProfilePage}
            style={theProfilePicture}
            id={`post_author_picture${this.props.postId}`}
            className="post_author_picture btn"
          ></div>
        </Link>
      );
    }

    return (
      <div className="post" id={this.props.postId}>
        <div className="post_header">
          {ProfilePicture}
          <h3 className="post_author_name" onClick={this.clickToName}>
            {this.props.postAuthorName}
          </h3>
        </div>
        <div className="post_image">
          {postImage}
          <div className="delete_overlay" id={`overlay${this.props.postId}`}>
            <h3>You wanna delet this post</h3>
            <div className="btn_container">
              <div className="btn Close" onClick={this.closeDeleteoverlay}>
                Close
              </div>
              <div className="btn delete" onClick={this.handleDeletePost}>
                Delete
              </div>
            </div>
          </div>
        </div>
        <div className="options_of_post">
          <div className="basice_options">
            {theHeart}
            <div
              onClick={this.handleComment}
              className="post_option comments_post"
            >
              <i className="fas fa-comment-alt"></i>
              <h6
                style={{ display: "none" }}
                id={`container${this.props.postId}`}
              >
                go to container
              </h6>
            </div>
          </div>
          <div
            className="post_option delete_post"
            style={{ display: this.props.deletePost }}
            onClick={this.showDeleteoverlay}
          >
            <i className="fas fa-trash"></i>
          </div>
        </div>
        <div className="show_NLike_NComment">
          <div>
            {this.state.NofLike}
            {this.state.NofLike > 1 ? " Likes" : " Like"}
          </div>
          <div>
            <span id={`NofResponse${this.props.postId}`}>
              {this.props.NofResponse}
            </span>
            {this.props.NofResponse > 1 ? " Responses" : " Response"}
          </div>
        </div>
        <div
          className="post_description"
          id={`post_description${this.props.postId}`}
        >
          <h4 className="post_title">{this.props.postTitle}</h4>
          {this.state.PostDescription}
          <div className="post_date">
            <h2>{this.props.postDate}</h2>
          </div>
        </div>
      </div>
    );
  }
}

export { HomePostsContainer, Post };
