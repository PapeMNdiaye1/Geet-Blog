import React, { Component } from "react";
import { BrowserRouter, Route, Switch, Redirect, Link } from "react-router-dom";
import { myGetFetcher, myDeleteFetcher } from "./myFetcher";
// ###############################
import SignUp from "./UsersController/SignUp";
import Login from "./UsersController/Login";
import { HomePostsContainer } from "./HomePage/HomePostsContainer";
import { ProfilePage } from "./HomePage/ProfilePage";
import MyProfilePage from "./HomePage/MyProfilePage";
import PostCreator from "./HomePage/PostCreator";
import Comments from "./HomePage/Comment/Comments";
import Chat from "./HomePage/Chat";
import "./Style/style.css";
//! ###################################################################################
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Id: "",
      Name: "",
      Email: "",
      AllLikedPosts: [],
      ProfilePicture: "",
      IsUserLogin: "",
      GetAllMyPost: false,
      ShowOverlay: false,
      GrabPostToCommentId: "",
      TheHomePostsContainer: (
        <Route
          exact
          path={"/home"}
          render={(props) => (
            <HomePostsContainer
              {...props}
              UserId={this.state.Id}
              AllLikedPosts={this.state.AllLikedPosts}
              SeeAllMyPost={this.state.GetAllMyPost}
              onOpenProfilePage={this.goToProfilePage}
              UserName={this.state.Name}
              UserProfilePicture={this.state.ProfilePicture}
              UserEmail={this.state.Email}
            />
          )}
        />
      ),
      IdToPassInProfilePage: "",
      TheCourantChatId: "",
      TheCourantContactId: "",
      TheCourantContactName: "",
      TheCourantContactProfilePicture: "",
    };
    this.handleUserLogin = this.handleUserLogin.bind(this);
    this.findUserInfos = this.findUserInfos.bind(this);
    this.toggleToGetAllMyPost = this.toggleToGetAllMyPost.bind(this);
    this.toggleToGetHome = this.toggleToGetHome.bind(this);
    this.grabPostIdFromHomePostsContainer = this.grabPostIdFromHomePostsContainer.bind(
      this
    );
    this.toggleOverlay = this.toggleOverlay.bind(this);
    this.LogOut = this.LogOut.bind(this);
    this.signOut = this.signOut.bind(this);
    this.goToProfilePage = this.goToProfilePage.bind(this);
    this.getChatData = this.getChatData.bind(this);
  }
  // ##################################################################################
  async componentDidMount() {
    let EmailInSession = await sessionStorage.getItem("Email");
    if (EmailInSession) {
      let theUserInDb = await this.findUserInfos(EmailInSession);
      try {
        if (theUserInDb.User._id) {
          this.setState({
            Name: theUserInDb.User.username,
            Id: theUserInDb.User._id,
            ProfilePicture: theUserInDb.User.profilePicture,
            AllLikedPosts: [
              ...theUserInDb.User.allLikedPosts.map((post) => post.postId),
            ],
            IsUserLogin: true,
            Email: theUserInDb.User.email,
          });
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("no Session");
    }
  }
  // ##################################################################################
  async findUserInfos(UserEmail) {
    let UserInDb = await myGetFetcher(
      `/User/get-user-infos/${UserEmail}`,
      "get"
    );
    return UserInDb;
  }
  // ##################################################################################
  async handleUserLogin(childData) {
    console.log(childData);

    await this.setState({
      Email: childData.Email,
    });
    if (childData.TheUserIsLogin) {
      let theUserInDb = await this.findUserInfos(this.state.Email);
      if (theUserInDb.User._id) {
        this.setState({
          Name: theUserInDb.User.username,
          Id: theUserInDb.User._id,
          ProfilePicture: theUserInDb.User.profilePicture,
          AllLikedPosts: [
            ...theUserInDb.User.allLikedPosts.map((post) => post.postId),
          ],
          IsUserLogin: true,
        });
      }
    }
  }
  // ##################################################################################
  toggleToGetHome() {
    this.setState({
      GetAllMyPost: false,
      TheHomePostsContainer: (
        <Route
          exact
          path={"/home"}
          render={(props) => (
            <HomePostsContainer
              {...props}
              UserId={this.state.Id}
              AllLikedPosts={this.state.AllLikedPosts}
              SeeAllMyPost={false}
              onOpenProfilePage={this.goToProfilePage}
              UserName={this.state.Name}
              UserProfilePicture={this.state.ProfilePicture}
              UserEmail={this.state.Email}
            />
          )}
        />
      ),
    });
  }
  // ##################################################################################
  toggleToGetAllMyPost() {
    this.setState({
      GetAllMyPost: true,
      TheHomePostsContainer: (
        <Route
          exact
          path={"/only-my-posts"}
          render={(props) => (
            <HomePostsContainer
              {...props}
              UserId={this.state.Id}
              AllLikedPosts={this.state.AllLikedPosts}
              SeeAllMyPost={true}
              onOpenProfilePage={this.goToProfilePage}
              UserName={this.state.Name}
              UserProfilePicture={this.state.ProfilePicture}
              UserEmail={this.state.Email}
            />
          )}
        />
      ),
    });
  }
  // ##################################################################################
  async grabPostIdFromHomePostsContainer(childDataFromPostsContainer) {
    await this.setState({
      GrabPostToCommentId: childDataFromPostsContainer,
    });
    console.log(this.state.GrabPostToCommentId);
  }
  //###################################################################################
  toggleOverlay(theOption) {
    this.setState({
      ShowOverlay: theOption,
    });
  }
  //###################################################################################
  LogOut() {
    sessionStorage.removeItem("Email");
    this.setState({
      IsUserLogin: false,
      ShowOverlay: false,
    });
  }
  //###################################################################################
  signOut() {
    sessionStorage.removeItem("Email");
    this.setState({
      IsUserLogin: false,
      ShowOverlay: false,
    });
    //################################
    myDeleteFetcher(`User/delete-one-user/${this.state.Id}`);
  }
  // #################################################################################
  goToProfilePage(theId) {
    this.setState({
      IdToPassInProfilePage: theId,
    });
  }
  // ################################################################################
  getChatData(childFromProfilePage) {
    console.log(childFromProfilePage);
    this.setState({
      TheCourantChatId: childFromProfilePage.chatId,
      TheCourantContactId: childFromProfilePage.contactId,
      TheCourantContactName: childFromProfilePage.contactName,
      TheCourantContactProfilePicture: childFromProfilePage.profilePicture,
    });
  }
  // ?#################################################################################
  render() {
    let theOverlay;
    if (
      this.state.ShowOverlay === "logout" ||
      this.state.ShowOverlay === "signOut" ||
      this.state.ShowOverlay === "about"
    ) {
      theOverlay = (
        <Overlay
          onCloseOverlay={this.toggleOverlay}
          onLogOut={this.LogOut}
          onSignOut={this.signOut}
          carte={this.state.ShowOverlay}
        />
      );
    }
    // ##################################################################
    if (this.state.IsUserLogin) {
      return (
        <div id="home_page_container">
          <BrowserRouter>
            <TopBar />
            <LeftBar
              onGetHome={this.toggleToGetHome}
              onGetAllMyPost={this.toggleToGetAllMyPost}
              onOpenOverlay={this.toggleOverlay}
              UserProfilePicture={this.state.ProfilePicture}
              UserName={this.state.Name}
              UserId={this.state.Id}
              UserEmail={this.state.Email}
            />
            {theOverlay}
            {/* ################################################################### */}
            <Redirect to={"/home"} />
            {/* <Redirect to={"/Chat"} /> */}
            <Switch>
              {this.state.TheHomePostsContainer}
              <Route
                exact
                path={"/my-profile-page"}
                render={(props) => (
                  <MyProfilePage
                    {...props}
                    UserId={this.state.Id}
                    onCommentInProfilePage={
                      this.grabPostIdFromHomePostsContainer
                    }
                    onOpenProfilePage={this.goToProfilePage}
                  />
                )}
              />
              <Route
                exact
                path={"/profile-page"}
                render={(props) => (
                  <ProfilePage
                    {...props}
                    AuthorId={this.state.IdToPassInProfilePage}
                    UserId={this.state.Id}
                    UserName={this.state.Name}
                    UserProfilePicture={this.state.ProfilePicture}
                    onCommentInProfilePage={
                      this.grabPostIdFromHomePostsContainer
                    }
                    onOpenProfilePage={this.goToProfilePage}
                    onChat={this.getChatData}
                  />
                )}
              />
              <Route
                exact
                path={"/creat-new-post"}
                render={(props) => (
                  <PostCreator
                    {...props}
                    onGetHome={this.toggleToGetHome}
                    UserName={this.state.Name}
                    UserId={this.state.Id}
                    UserProfilePicture={this.state.ProfilePicture}
                  />
                )}
              />
              <Route
                exact
                path={"/container"}
                render={(props) => (
                  <Comments
                    {...props}
                    PostId={this.state.GrabPostToCommentId}
                    UserName={this.state.Name}
                    UserId={this.state.Id}
                    UserProfilePicture={this.state.ProfilePicture}
                    onOpenProfilePage={this.goToProfilePage}
                  />
                )}
              />
              <Route
                exact
                path={"/Chat"}
                render={(props) => (
                  <Chat
                    TheCourantChatId={this.state.TheCourantChatId}
                    TheCourantContactId={this.state.TheCourantContactId}
                    TheCourantContactProfilePicture={
                      this.state.TheCourantContactProfilePicture
                    }
                    TheCourantContactName={this.state.TheCourantContactName}
                    MyId={this.state.Id}
                  />
                )}
              />
            </Switch>
          </BrowserRouter>
        </div>
      );
    } else {
      return (
        <BrowserRouter>
          <Redirect to={"/login"} />
          <Switch>
            <Route
              exact
              path={"/SignUp"}
              render={(props) => (
                <SignUp {...props} onUserLogin={this.handleUserLogin} />
              )}
            />
            <Route
              exact
              path={"/login"}
              render={(props) => (
                <Login {...props} onUserLogin={this.handleUserLogin} />
              )}
            />
          </Switch>
        </BrowserRouter>
      );
    }
  }
}
//! ###################################################################################
class LeftBar extends Component {
  constructor(props) {
    super(props);
    this.handleAllMyPost = this.handleAllMyPost.bind(this);
    this.handleHome = this.handleHome.bind(this);
    this.openLogout = this.openLogout.bind(this);
    this.closeLeftBar = this.closeLeftBar.bind(this);
  }
  // #################################################################################
  handleAllMyPost() {
    this.props.onGetAllMyPost();
    this.closeLeftBar();
  }
  // #################################################################################
  handleHome() {
    this.props.onGetHome();
    if (document.querySelectorAll(".close_comment").length > 0) {
      document.querySelectorAll(".close_comment")[0].click();
    }
    this.closeLeftBar();
  }
  //##################################################################################
  openLogout(e) {
    let theOption = e.target.classList[1];
    this.props.onOpenOverlay(theOption);
    this.closeLeftBar();
  }
  // ################################################################################
  closeLeftBar() {
    document
      .querySelector(".hamburger_menu")
      .children[0].classList.remove("bare_active");
    document.querySelector(".Left_Bar").classList.remove("Left_Bar_active");
  }
  // ?################################################################################
  render() {
    return (
      <div className="Left_Bar">
        <div id="profile_cart">
          <div className="profile_picture_container">
            <Link style={{ textDecoration: "none" }} to="/my-profile-page">
              <div
                className="profile_picture"
                style={{ backgroundImage: this.props.UserProfilePicture }}
              ></div>
            </Link>
          </div>
          <Link style={{ textDecoration: "none" }} to="/my-profile-page">
            <h5 className="user_name">{this.props.UserName}</h5>
          </Link>
          <h6 className="user_email">{this.props.UserEmail}</h6>
        </div>
        {/* ############################################## */}
        <div id="options">
          <Link style={{ textDecoration: "none" }} to="/home">
            <div className="option home" onClick={this.handleHome}>
              <h3>Home</h3>
            </div>
          </Link>
          <Link style={{ textDecoration: "none" }} to="/creat-new-post">
            <div className="option creat_new_pot">
              <h3>Creat New Post</h3>
            </div>
          </Link>
          <Link style={{ textDecoration: "none" }} to="/Chat">
            <div className="option chat">
              <h3>Chats</h3>
            </div>
          </Link>
          <Link style={{ textDecoration: "none" }} to="/only-my-posts">
            <div
              className="option only_my_posts"
              onClick={this.handleAllMyPost}
            >
              <h3>See All My Posts</h3>
            </div>
          </Link>
        </div>
        {/* ############################################## */}
        <div id="params">
          <div onClick={this.openLogout} className="option logout">
            <h3>Logout</h3>
          </div>
          <div onClick={this.openLogout} className="option signOut">
            <h3>Sign Out</h3>
          </div>
          <div onClick={this.openLogout} className="option about">
            <h3>About</h3>
          </div>
        </div>
      </div>
    );
  }
}
//! ###################################################################################
class TopBar extends Component {
  constructor(props) {
    super(props);
    this.toggleLeftBar = this.toggleLeftBar.bind(this);
    this.toggleProfilesPresentation = this.toggleProfilesPresentation.bind(
      this
    );
  }
  // ###################################################################################
  toggleLeftBar() {
    document
      .querySelector(".hamburger_menu")
      .children[0].classList.toggle("bare_active");
    document.querySelector(".Left_Bar").classList.toggle("Left_Bar_active");
  }
  // ###################################################################################
  toggleProfilesPresentation(e) {
    e.target.classList.toggle("users_on_top_active");
    document
      .querySelector(".profiles_presentation")
      .classList.toggle("profiles_presentation_active");
  }
  // ?###################################################################################

  render() {
    return (
      <div className="top_Bar">
        <div onClick={this.toggleLeftBar} className="hamburger_menu">
          <div className="bare "></div>
        </div>
        <Link style={{ textDecoration: "none" }} to="/home">
          <h1 className="top_Title">Geek Blog</h1>
        </Link>
        <div
          className="users_on_top btn"
          onClick={this.toggleProfilesPresentation}
        >
          <i className="fas fa-users"></i>
        </div>
      </div>
    );
  }
}
//! ###################################################################################
class Overlay extends Component {
  constructor(props) {
    super(props);
    this.closeOverlay = this.closeOverlay.bind(this);
    this.LogOut = this.LogOut.bind(this);
    this.signOut = this.signOut.bind(this);
  }
  // #################################################################################
  closeOverlay() {
    this.props.onCloseOverlay(false);
  }
  // #################################################################################
  LogOut() {
    this.props.onLogOut();
  }
  // #################################################################################
  signOut() {
    this.props.onSignOut();
  }
  // ?################################################################################
  render() {
    const cart = (a, b, c, d) => {
      return (
        <div className={a}>
          <h3>{b}</h3>
          <div className="overlay_btn_container">
            <div className="overlay_btn btn" onClick={this.closeOverlay}>
              Close
            </div>
            <div className="overlay_btn btn" onClick={d}>
              {c}
            </div>
          </div>
        </div>
      );
    };
    return (
      <div className="overlay">
        {this.props.carte === "logout" &&
          cart("logout_cart", "You Wanna Logout", "Logout", this.LogOut)}
        {/* ################################################### */}
        {this.props.carte === "signOut" &&
          cart("signOut_cart", "You Wanna Sign Out", "Sign Out", this.signOut)}
        {this.props.carte === "about" && (
          <div className="about_cart">
            <div className="the_JAC_logo">
              <svg x="0px" y="0px" viewBox="0 0 960 560">
                <path
                  className="logo0"
                  d="M567.5,417.5c0.04,1.26,12-5,11-10l-44.06-126.3c-0.56-1.62-2.09-2.7-3.8-2.7h-54.06
                c-1.89,0-3.6,1.08-4.42,2.78L444.5,338.5c-5.51,9.98-0.16,16.44,11,21l-97-1c13.18-1.89,17-5,21-12
                c70.39-135.7,99.79-193.71,107.09-208.2c0.7-1.4,1.74-1.25,2.23,0.24c23.27,70.73,72.25,206.95,93.68,268.97
                c2.83,8.67,12.12,9.75,14,10H567.5z"
                />
                <path
                  className="logo1"
                  d="M478.5,267.5c16-31,22.65-47.7,26.11-54.29c1.12-2.13,4.69-1.97,5.89,0.29l18.41,53.99
                c0.54,2.71-2.36,7.06-5.23,7.12l-42.95-0.2C478.4,274.45,477.43,269.57,478.5,267.5z"
                />
                <path
                  className="logo2"
                  d="M569.5,136.5c87,0,86,0,86,0l110,109c-93,101-93,101-93,101c-5.43,7.28-1.95,10.44,5,12h-100l103-111
                L569.5,136.5z"
                />
                <path
                  className="logo2"
                  d="M351.9,136.79c-87,0-86,0-86,0l-110,109c93,101,93,101,93,101c5.43,7.28,1.95,10.44-5,12h100l-103-111
                L351.9,136.79z"
                />
              </svg>
            </div>
            <p>
              Geek-Blog 0.1 '08/07/2020' par Pape Momar Ndiaye
              (Developer/Designer <br />
              tel:777278655 mail:pmomar44@gmail.com) :
            </p>
            <br />
            <p>
              Infos: Cette app est mon premier projet M.E.R.N., si tout c'est
              bien passé il doit actuellement être hébergé sur Heroku avec une
              DataBase Atlas de 500 MB. <br />
              je tiens a preciser que ceci est la version beta d'un simple test.
              <br />
              je tenterai de le maintenir et de l'étendre le plus possible
              <br />
              ps: le code est en open-source sur mon Github{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://github.com/PapeMNdiaye1/Geet-Blog"
              >
                Le repository
              </a>
              <br />
            </p>
            <div className="close_about btn" onClick={this.closeOverlay}>
              <i className="fas fa-times"></i>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default App;
