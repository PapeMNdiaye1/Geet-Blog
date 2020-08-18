import React from "react";
import { myGetFetcher, myPostFetcher } from "../../myFetcher";
import { Link } from "react-router-dom";
import { debounce } from "lodash";

// !#####################################################################################

class Comments extends React.Component {
  constructor(props) {
    super(props);
    let dt = new Date();

    this.state = {
      AllResponses: [],
      PostAuthorId: "",
      PostAuthorName: "",
      PostAuthorPicture: "",
      PostDate: "",
      PostDescription: "",
      PostImage: "",
      PostImageId: "",
      PostResponses: [],
      PostTitle: "",
      Response: "",
      ResponseDate: `${(dt.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${dt
        .getDate()
        .toString()
        .padStart(2, "0")}/${dt
        .getFullYear()
        .toString()
        .padStart(4, "0")} ${dt
        .getHours()
        .toString()
        .padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`,
      NofResponse: "",
      PostDescriptionModified: "",
      PostTitleModified: "",
      StartModification: false,
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendResponse = this.sendResponse.bind(this);
    this.getAllResponses = this.getAllResponses.bind(this);
    this.openProfilePage = this.openProfilePage.bind(this);
    this.grabProfilePageIdFromResponse = this.grabProfilePageIdFromResponse.bind(
      this
    );
    this.modifiPost = this.modifiPost.bind(this);
    this.closeModification = this.closeModification.bind(this);
    this.sendModification = this.sendModification.bind(this);
    this.closeComment = this.closeComment.bind(this);
  }
  // #####################################################################################
  async componentDidMount() {
    document.querySelector(".close_comment").style.display = "none";
    let rawResponse = myGetFetcher(
      `/Post/one-post/${this.props.PostId}`,
      "get"
    );
    let response = await rawResponse;
    this.setState({
      PostAuthorId: response.Post.postAuthorId,
      PostAuthorName: response.Post.postAuthorName,
      PostAuthorPicture: response.Post.postAuthorPicture,
      PostDate: response.Post.postDate,
      PostDescription: response.Post.postDescription,
      PostImage: response.Post.postImage,
      PostImageId: response.Post.postImageId,
      PostResponses: response.Post.postResponses,
      PostTitle: response.Post.postTitle,
      NofResponse: response.Post.postResponses.length,
      PostDescriptionModified: response.Post.postDescription,
      PostTitleModified: response.Post.postTitle,
    });
    this.getAllResponses(this.state.PostResponses.reverse());

    let NofResponseContainer = document.getElementById(
      `NofResponse${this.props.PostId}`
    );
    if (NofResponseContainer) {
      NofResponseContainer.innerHTML = this.state.NofResponse;
    }
  }
  // #####################################################################################
  handleChange(e) {
    const theFormName = e.target.name;
    const theFormValue = e.target.value.trim();
    this.setState({
      [theFormName]: theFormValue.replace(/(\n)+/g, "\n"),
    });
  }
  // #####################################################################################
  async sendResponse(e) {
    e.preventDefault();

    let ResponseData = await {
      AuthorId: this.props.UserId,
      ResponseAuthorName: this.props.UserName,
      ResponseAuthorPicture: this.props.UserProfilePicture,
      Response: this.state.Response,
      ResponseDate: this.state.ResponseDate,
    };
    // #####################
    let isResponseSended = await myPostFetcher(
      `/Post/add-response/${this.props.PostId}`,
      ResponseData
    );
    // #####################
    this.setState({
      Response: "",
    });
    document.querySelector("#creat_response").value = "";
    // #####################
    if (isResponseSended.response) {
      let rawResponse = myGetFetcher(
        `/Post/get-all-response/${this.props.PostId}`,
        "get"
      );
      let response = await rawResponse;
      this.getAllResponses(response.allresponse.postResponses.reverse());
      await this.setState({
        NofResponse: this.state.NofResponse + 1,
      });

      let NofResponseContainer = document.getElementById(
        `NofResponse${this.props.PostId}`
      );
      if (NofResponseContainer) {
        let NofResponse = Number(NofResponseContainer.innerHTML);
        NofResponseContainer.innerHTML = NofResponse + 1;
      }
    }
  }
  // #####################################################################################
  async getAllResponses(data) {
    let allResponsesArray = [];
    await data.map((response) =>
      allResponsesArray.push(
        <Response
          key={response._id}
          postId={this.props.PostId}
          responseId={response._id}
          authorId={response.authorId}
          responseAuthorName={response.responseAuthorName}
          responseAuthorPicture={response.responseAuthorPicture}
          response={response.response}
          responseDate={response.responseDate}
          UserId={this.props.UserId}
          onOpenProfilePage={this.grabProfilePageIdFromResponse}
        />
      )
    );
    await this.setState({
      AllResponses: allResponsesArray,
    });
    console.log(this.state.AllResponses);
  }
  // #####################################################################################
  grabProfilePageIdFromResponse(childDataFromPost) {
    this.props.onOpenProfilePage(childDataFromPost);
  }
  // ######################################################################################
  openProfilePage() {
    this.props.onOpenProfilePage(this.state.PostAuthorId);
  }
  // ######################################################################################
  modifiPost() {
    this.setState({
      StartModification: true,
    });
    document.querySelector(".the_post_image").style.filter = "grayscale(100%)";
    document.querySelector(".the_post_image").style.opacity = ".5";
    document.querySelector(".the_post_description").style.bottom = "12%";
    document.getElementById(
      "post_description_modified"
    ).innerHTML = this.state.PostDescription;
    document.getElementById(
      "post_title_modified"
    ).innerHTML = this.state.PostTitle;
  }
  // ######################################################################################
  closeModification() {
    this.setState({
      StartModification: false,
    });
    document.querySelector(".the_post_image").style.filter = "";
    document.querySelector(".the_post_image").style.opacity = "";
    document.querySelector(".the_post_description").style.bottom = "";
  }
  // ######################################################################################
  async sendModification() {
    if (
      this.state.PostDescriptionModified !== this.state.PostDescription ||
      this.state.PostTitleModified !== this.state.PostTitle
    ) {
      await myPostFetcher(`Post/modify-post/${this.props.PostId}`, {
        PostTitle: this.state.PostTitleModified,
        PostDescription: this.state.PostDescriptionModified,
      });
      document.querySelector(".close_modifications").click();
      await this.setState({
        PostTitle: this.state.PostTitleModified,
        PostDescription: this.state.PostDescriptionModified,
      });

      let theDescription = document.querySelector(
        `#post_description${this.props.PostId}`
      );
      if (theDescription) {
        theDescription.children[0].innerHTML = this.state.PostTitleModified;
        theDescription.children[1].innerHTML = this.state.PostDescriptionModified;
      }
    }
  }
  // ######################################################################################
  closeComment() {
    this.props.onCloseComment && this.props.onCloseComment();
  }
  // ?#####################################################################################
  render() {
    let textareaDisplay;
    let postDisplay;
    if (this.state.StartModification) {
      textareaDisplay = { display: "flex" };
      postDisplay = { display: "none" };
    } else {
      textareaDisplay = { display: "none" };
      postDisplay = { display: "flex" };
    }
    // ####################################################
    let postImage;
    if (this.state.PostImage !== "") {
      postImage = { backgroundImage: `url(image/${this.state.PostImage})` };
    } else {
      postImage = { background: "#000" };
    }
    // #################################################
    let postAuthorPicture;
    if (this.state.PostAuthorPicture !== "") {
      postAuthorPicture = { backgroundImage: this.state.PostAuthorPicture };
    } else {
      postAuthorPicture = { background: "#000" };
    }
    // #######################################
    let AuthorPictureContainer;
    let possibilityToModify;
    if (this.props.UserId === this.state.PostAuthorId) {
      AuthorPictureContainer = (
        <Link style={{ textDecoration: "none" }} to="/my-profile-page">
          <div style={postAuthorPicture} className="post_author_picture"></div>
        </Link>
      );
      possibilityToModify = { display: "flex" };
    } else {
      AuthorPictureContainer = (
        <Link style={{ textDecoration: "none" }} to="/profile-page">
          <div
            onClick={this.openProfilePage}
            style={postAuthorPicture}
            className="post_author_picture"
          ></div>
        </Link>
      );
      possibilityToModify = { display: "none" };
    }

    return (
      <div className="comments">
        <div className="close_comment btn" onClick={this.closeComment}>
          <i className="fas fa-times"></i>
        </div>
        <div className="the_post_header">
          {AuthorPictureContainer}
          <h3 className="post_author_name">{this.state.PostAuthorName}</h3>
          <div className="post_date">{this.state.PostDate}</div>
        </div>
        {/* ################################################## */}
        <div className="the_post">
          <div className="the_post_image_loader">
            <div className="lds-ripple">
              <div></div>
              <div></div>
            </div>
          </div>
          <div style={postImage} className="the_post_image"></div>

          <div className="the_post_description">
            {this.state.StartModification ? (
              <div
                className="modifi_post close_modifications"
                style={possibilityToModify}
                onClick={this.closeModification}
              >
                <i className="fas fa-times"></i>
              </div>
            ) : (
              <div
                className="modifi_post"
                onClick={this.modifiPost}
                style={possibilityToModify}
              >
                modifi
              </div>
            )}
            <h4 className="the_post_title" style={postDisplay}>
              {this.state.PostTitle}
            </h4>
            <p style={postDisplay}>{this.state.PostDescription}</p>
            <textarea
              id="post_title_modified"
              name="PostTitleModified"
              placeholder="Your New Title..."
              maxLength="65"
              cols="30"
              rows="10"
              onChange={this.handleChange}
              style={textareaDisplay}
            ></textarea>
            <textarea
              id="post_description_modified"
              name="PostDescriptionModified"
              placeholder="Your New Description..."
              maxLength="500"
              cols="30"
              rows="10"
              onChange={this.handleChange}
              style={textareaDisplay}
            ></textarea>
            <div
              className="sendModifications"
              style={textareaDisplay}
              onClick={this.sendModification}
            >
              Save
            </div>
          </div>
        </div>
        {/* ################################################## */}
        <div className="comments_container">
          <div className="responses_container">{this.state.AllResponses}</div>
          <form className="the_response_form" method="post">
            <textarea
              name="Response"
              id="creat_response"
              cols="30"
              rows="10"
              placeholder="Your response.."
              maxLength="400"
              onChange={this.handleChange}
            ></textarea>
            <div onClick={debounce(this.sendResponse, 1000)}>Send</div>
          </form>
        </div>
      </div>
    );
  }
}
// !#####################################################################################
class Response extends React.PureComponent {
  constructor(props) {
    super(props);
    this.openProfilePage = this.openProfilePage.bind(this);
    this.deleteResponse = this.deleteResponse.bind(this);
  }
  // #####################################################################################
  openProfilePage() {
    this.props.onOpenProfilePage(this.props.authorId);
  }
  // #####################################################################################
  deleteResponse() {
    let isResponseDeleted = myPostFetcher(
      `/Post/delete-one-response/${this.props.postId}`,
      { id: this.props.responseId }
    );
    if (isResponseDeleted) {
      let NofResponseContainer = document.getElementById(
        `NofResponse${this.props.postId}`
      );
      if (NofResponseContainer) {
        let NofResponse = Number(NofResponseContainer.innerHTML);
        NofResponseContainer.innerHTML = NofResponse - 1;
      }
    }
    document.getElementById(this.props.responseId).style.display = "none";
  }
  // ?#####################################################################################
  render() {
    let theProfilePicture;
    if (this.props.responseAuthorPicture !== "") {
      theProfilePicture = { backgroundImage: this.props.responseAuthorPicture };
    } else {
      theProfilePicture = { background: "#000" };
    }
    // #######################################
    let AuthorPictureContainer;
    if (this.props.UserId === this.props.authorId) {
      AuthorPictureContainer = (
        <Link style={{ textDecoration: "none" }} to="/my-profile-page">
          <div
            style={theProfilePicture}
            className="response_author_picture"
          ></div>
        </Link>
      );
    } else {
      AuthorPictureContainer = (
        <Link style={{ textDecoration: "none" }} to="/profile-page">
          <div
            onClick={this.openProfilePage}
            style={theProfilePicture}
            className="response_author_picture"
          ></div>
        </Link>
      );
    }
    // #########################
    return (
      <div className="response" id={this.props.responseId}>
        <div className="response_header">{AuthorPictureContainer}</div>
        <div className="response_body">
          <p>
            {this.props.UserId === this.props.authorId ? (
              <span
                style={{
                  borderRadius: ".1em",
                  background: "rgba(0,0,0,0.1)",
                  color: "var(--colorX)",
                  padding: "0 .2em 0 .2em",
                }}
              >
                {this.props.responseAuthorName}
              </span>
            ) : (
              <span>{this.props.responseAuthorName}</span>
            )}
            {this.props.response}
            <span className="response_date">{this.props.responseDate}</span>
          </p>
        </div>
        {this.props.UserId === this.props.authorId && (
          <div className="delete_my_response" onClick={this.deleteResponse}>
            <i className="fas fa-times"></i>
          </div>
        )}
      </div>
    );
  }
}

export default Comments;
