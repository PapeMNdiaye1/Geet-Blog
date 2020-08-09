import React from "react";
import { myGetFetcher, myPostFetcher } from "../myFetcher";
import { OneOfMyPost } from "./ProfilePage";
import { Link } from "react-router-dom";
import { get } from "lodash";

//! ###########################################################################
class MyProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      UserName: "",
      UserEmail: "",
      UserProfilePicture: "",
      AllLikedPosts: [],
      MyPosts: [
        <div key="my_posts_loader" className="my_posts_loader">
          <div className="lds-ripple">
            <div></div>
            <div></div>
          </div>
        </div>,
      ],
      Description: "",
      SelfDescription: true,
      SeePosts: true,
      SeeFriend: true,
      AllFriends: [],
      ALLFollowers: [],
      AllFriendsProfile: [
        <div key="my_posts_loader" className="my_posts_loader">
          <div className="lds-ripple">
            <div></div>
            <div></div>
          </div>
        </div>,
      ],
      ALLFollowersProfile: [
        <div key="my_posts_loader" className="my_posts_loader">
          <div className="lds-ripple">
            <div></div>
            <div></div>
          </div>
        </div>,
      ],
      // ProfilePictureToDelete: "",
    };
    this.getOnlyMyPosts = this.getOnlyMyPosts.bind(this);
    this.grabPostIdFromOneOfMyPost = this.grabPostIdFromOneOfMyPost.bind(this);
    this.closeLeftBar = this.closeLeftBar.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.sendSelfDescription = this.sendSelfDescription.bind(this);
    this.closeModify = this.closeModify.bind(this);
    this.changeHeadBtn = this.changeHeadBtn.bind(this);
    this.getAllFriendProfile = this.getAllFriendProfile.bind(this);
    this.getALLFollowersProfile = this.getALLFollowersProfile.bind(this);
    this.creatOrModifySelfDescription = this.creatOrModifySelfDescription.bind(
      this
    );
    this.grabProfilePageIdFromPost = this.grabProfilePageIdFromPost.bind(this);
    this.getFile = this.getFile.bind(this);
    this.getValue = this.getValue.bind(this);
  }
  // ##########################################################################
  async componentDidMount() {
    this.closeLeftBar();
    // ##############################
    let UserInfos = await myGetFetcher(
      `/User/get-user-profile/${this.props.UserId}`,
      "get"
    );
    await this.setState({
      UserName: UserInfos.User.username,
      UserEmail: UserInfos.User.email,
      UserProfilePicture: UserInfos.User.profilePicture,
      Description: UserInfos.User.description,
      AllLikedPosts: [
        ...UserInfos.User.allLikedPosts.map((post) => post.postId),
      ],
    });
    if (this.state.Description === "") {
      await this.setState({
        SelfDescription: false,
      });
    }
    // ##############################
    let AllMyPost = await myGetFetcher(
      `/Post/only-my-post/${this.props.UserId}`,
      "get"
    );
    this.getOnlyMyPosts(AllMyPost);
    // ##############################
    let AllMyFriendsAndFollowersId = await myGetFetcher(
      `/Follow/get-all-friends-and-followers/${this.props.UserId}`,
      "get"
    );
    this.setState({
      AllFriends: AllMyFriendsAndFollowersId.allFriendsId.friends,
      ALLFollowers: AllMyFriendsAndFollowersId.allFriendsId.followers,
    });
  }
  // ##########################################################################
  handleChange(e) {
    const theFormName = e.target.name;
    const theFormValue = e.target.value.trim();
    this.setState({
      [theFormName]: theFormValue.replace(/(\n)+/g, "\n"),
    });
  }
  // ##########################################################################
  async getOnlyMyPosts(data) {
    let myPostsArray = [];

    data.allposts.map((postInfos) =>
      myPostsArray.push(
        <OneOfMyPost
          key={postInfos._id}
          postId={postInfos._id}
          postImageId={postInfos.postImageId}
          postImage={postInfos.postImage}
          postTitle={postInfos.postTitle}
          postDate={postInfos.postDate}
          nofLikes={postInfos.nofLikes}
          nofResponses={postInfos.postResponses.length}
          UserId={this.props.UserId}
          allLikedPosts={this.state.AllLikedPosts}
          onComment={this.grabPostIdFromOneOfMyPost}
        />
      )
    );
    this.setState({
      MyPosts: myPostsArray,
    });
  }
  // ##########################################################################
  grabPostIdFromOneOfMyPost(childDataFromPost) {
    this.props.onCommentInProfilePage(childDataFromPost);
  }
  // ##########################################################################
  closeLeftBar() {
    document
      .querySelector(".hamburger_menu")
      .children[0].classList.remove("bare_active");
    document.querySelector(".Left_Bar").classList.remove("Left_Bar_active");
  }
  // ##########################################################################
  async creatOrModifySelfDescription() {
    await this.setState({
      SelfDescription: false,
    });
    document.getElementById(
      "self_description_modifier"
    ).innerHTML = this.state.Description;
  }
  // ##########################################################################
  closeModify() {
    this.setState({
      SelfDescription: true,
    });
  }
  // ##########################################################################
  async sendSelfDescription() {
    await this.setState({
      SelfDescription: true,
    });
    await myPostFetcher(`/User/update-description/${this.props.UserId}`, {
      Description: this.state.Description,
    });
  }
  // ##########################################################################
  changeHeadBtn(e) {
    let AllHeadBtn = document.querySelectorAll(".head_btn");
    AllHeadBtn.forEach((element) => {
      element.classList.remove("active");
    });
    e.target.classList.add("active");

    if (e.target === AllHeadBtn[0] && !this.state.SeePosts) {
      this.setState({
        SeePosts: true,
      });
    } else if (
      e.target === AllHeadBtn[1] &&
      (!this.state.SeeFriend || this.state.SeeFriend & this.state.SeePosts)
    ) {
      this.setState({
        SeeFriend: true,
        SeePosts: false,
      });
      this.getAllFriendProfile(this.state.AllFriends);
    } else if (
      e.target === AllHeadBtn[2] &&
      (this.state.SeeFriend || !this.state.SeeFriend & this.state.SeePosts)
    ) {
      this.setState({
        SeeFriend: false,
        SeePosts: false,
      });
      this.getALLFollowersProfile(this.state.ALLFollowers.reverse());
    }
  }
  // ##########################################################################
  getAllFriendProfile(theArray) {
    let profileArray = [];
    theArray.map(
      (user) =>
        this.props.UserId !== user.friendId &&
        profileArray.push(
          <OneProfile
            key={user.friendId}
            UserName={user.friendName}
            UserId={user.friendId}
            ProfilePicture={user.friendProfilePicture}
            MyId={this.props.UserId}
            onOpenProfilePage={this.grabProfilePageIdFromPost}
            IsFriend={true}
          />
        )
    );
    this.setState({
      AllFriendsProfile: profileArray,
    });
  }
  // ##########################################################################
  getALLFollowersProfile(theArray) {
    let followersArray = [];
    theArray.map(
      (user) =>
        this.props.UserId !== user.friendId &&
        followersArray.push(
          <OneProfile
            key={user.friendId}
            UserName={user.friendName}
            UserId={user.friendId}
            MyId={this.props.UserId}
            ProfilePicture={user.friendProfilePicture}
            onOpenProfilePage={this.grabProfilePageIdFromPost}
          />
        )
    );
    this.setState({
      ALLFollowersProfile: followersArray,
    });
  }
  // #########################################################################
  grabProfilePageIdFromPost(childDataFromPost) {
    this.props.onOpenProfilePage(childDataFromPost);
  }
  // #########################################################################
  getFile() {
    document.getElementById("hidden_file").click();
  }

  // #########################################################################
  async getValue() {
    document.querySelector(".the_profile_picture_loader").style.display =
      "flex";
    const allFileInfos = document.getElementById("hidden_file").files;
    const formData = new FormData();
    formData.append("file", allFileInfos[0]);
    // // #######################
    let response = await fetch("/upload", {
      method: "post",
      body: formData,
    });

    let pictureInServer = await response.json();
    let theFile = await get(pictureInServer, "file.filename");

    if (theFile !== undefined) {
      this.setState({
        UserProfilePicture: `url(image/${theFile})`,
      });
      let isProfilePictureChange = await myPostFetcher(
        `/User/update-profile-picture/${this.props.UserId}`,
        {
          NewProfilePicture: `url(image/${theFile})`,
        }
      );
      if (isProfilePictureChange.response) {
        document.querySelector(
          ".the_profile_picture"
        ).style.backgroundImage = `url(image/${theFile})`;
        setTimeout(() => {
          document.querySelector(".the_profile_picture_loader").style.display =
            "none";
        }, 2000);
      }
    }
  }
  // ?#########################################################################
  render() {
    return (
      <div className="my_profile_page_container">
        <div className="profile_container">
          <div className="profile_first_container">
            <div
              className="the_profile_picture"
              style={{ backgroundImage: this.state.UserProfilePicture }}
            >
              <div
                className="change_my_profile_picture btn"
                onClick={this.getFile}
              >
                <i className="fas fa-camera"></i>
              </div>
              <div className="the_profile_picture_loader loader">
                <div className="lds-ripple">
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
            <div className="the_user_name">
              {this.state.UserName}
              <br />
              <div className="email">{this.state.UserEmail}</div>
            </div>
            {/* ############################### */}
            <form
              className="fileInput"
              method="post"
              encType="multipart/form-data"
            >
              <input
                type="file"
                id="hidden_file"
                name="file"
                onChange={this.getValue}
              />
            </form>
            {/* ################################# */}
          </div>
          <div className="number_of_posts_container">
            <div className="head_btn active" onClick={this.changeHeadBtn}>
              {this.state.MyPosts.length} Post
            </div>
            <div className="head_btn" onClick={this.changeHeadBtn}>
              {this.state.AllFriends.length}
              {this.state.AllFriends.length > 1 ? "Followings" : "Following"}
            </div>
            <div className="head_btn" onClick={this.changeHeadBtn}>
              {this.state.ALLFollowers.length}
              {this.state.ALLFollowers.length > 1 ? "Followers" : "Follower"}
            </div>
          </div>
          {this.state.SelfDescription ? (
            <div className="profile_self_description_container">
              <p className="profile_self_description">
                {this.state.Description}
              </p>
              <br />
              <div
                className="modify_description btn"
                onClick={this.creatOrModifySelfDescription}
              >
                Modify Description
              </div>
            </div>
          ) : (
            <div className="profile_self_description_container">
              <textarea
                id="self_description_modifier"
                name="Description"
                onChange={this.handleChange}
                placeholder="Creat a description..."
              ></textarea>
              <br />
              <div className="close_and_send_container">
                <div
                  className="modify_description close_modify btn"
                  onClick={this.closeModify}
                >
                  Class
                </div>
                <div
                  className="modify_description btn"
                  onClick={this.sendSelfDescription}
                >
                  Send
                </div>
              </div>
            </div>
          )}
        </div>
        {/* ############################################################ */}
        {this.state.SeePosts ? (
          <div className="all_my_posts_container">
            {this.state.MyPosts}
            <Link style={{ textDecoration: "none" }} to="/creat-new-post">
              <div className="add_one_post_container">
                <div className="add_one_post">
                  <i className="fas fa-folder-plus"></i>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <React.Fragment>
            {this.state.SeeFriend ? (
              <div className="all_my_friends_and_followers_container">
                {this.state.AllFriendsProfile}
              </div>
            ) : (
              <div className="all_my_friends_and_followers_container">
                {this.state.ALLFollowersProfile}
              </div>
            )}
          </React.Fragment>
        )}
      </div>
    );
  }
}

//! ##########################################################################
class OneProfile extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.openProfilePage = this.openProfilePage.bind(this);
    this.unFollow = this.unFollow.bind(this);
  }
  openProfilePage() {
    this.props.onOpenProfilePage(this.props.UserId);
  }
  // ##################################################################
  async unFollow() {
    let isUserUnFollowing = await myPostFetcher(
      `/Follow/unFollow/${this.props.MyId}`,
      {
        Id: this.props.UserId,
      }
    );
    if (isUserUnFollowing.response) {
      this.setState({
        IsFollowed: false,
      });
      try {
        await myPostFetcher(`/Follow/remove-follower/${this.props.UserId}`, {
          Id: this.props.MyId,
        });
      } catch (error) {
        console.log(error);
      }
      document.getElementById(`one_profile${this.props.UserId}`).style.display =
        "none";
    }
  }
  // ?##########################################################################
  render() {
    let theProfilePicture;
    if (this.props.ProfilePicture !== "") {
      theProfilePicture = { backgroundImage: this.props.ProfilePicture };
    } else {
      theProfilePicture = { background: "#000" };
    }

    // ##################################################################
    return (
      <div className="one_profile" id={`one_profile${this.props.UserId}`}>
        <Link style={{ textDecoration: "none" }} to="/profile-page">
          <div
            onClick={this.openProfilePage}
            style={theProfilePicture}
            className="profile_picture btn"
          ></div>
        </Link>
        <div className="user_info">
          <div className="user_name">{this.props.UserName}</div> <br />
        </div>
        <div className="follow_container">
          {this.props.IsFriend && (
            <div className="follow btn" onClick={this.unFollow}>
              unFollow
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default MyProfilePage;
