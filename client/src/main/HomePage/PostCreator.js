import React from "react";
import { Link } from "react-router-dom";
import { get } from "lodash";
import { debounce } from "lodash";

//! #############################################################################
class PostCreator extends React.Component {
  constructor(props) {
    super(props);
    let dt = new Date();
    this.state = {
      PostImage: "",
      PostTitle: "",
      PostDescription: "",
      ProfilePictureToDelete: "",
      PostDate: `${(dt.getMonth() + 1)
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
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendPost = this.sendPost.bind(this);
    this.getFile = this.getFile.bind(this);
    this.getValue = this.getValue.bind(this);
    this.closeLeftBar = this.closeLeftBar.bind(this);
  }
  // ###############################################################################
  componentDidMount() {
    document.querySelector(".post_creation_container_overlay").style.display =
      "none";
    this.closeLeftBar();
  }
  // ###############################################################################
  handleChange(e) {
    const theFormName = e.target.name;
    const theFormValue = e.target.value.trim();
    this.setState({
      [theFormName]: theFormValue.replace(/(\n)+/g, "\n"),
    });
  }
  // ###############################################################################
  async sendPost(e) {
    document.querySelector(".post_creation_container_overlay").style.display =
      "flex";
    let Data = await {
      UserId: this.props.UserId,
      UserName: this.props.UserName,
      UserProfilePicture: this.props.UserProfilePicture,
      PostImage: this.state.PostImage,
      PostImageId: this.state.ProfilePictureToDelete,
      PostTitle: this.state.PostTitle,
      PostDescription: this.state.PostDescription,
      PostDate: this.state.PostDate,
    };
    // #####################
    await fetch("/Post/creat-post", {
      method: "post",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(Data),
    });
    // #####################
    this.setState({
      PostImage: "",
      PostTitle: "",
      PostDescription: "",
    });
    document.querySelector("#creat_title").value = "";
    document.querySelector("#creat_description").value = "";
    this.props.onGetHome();
    document.querySelector(".goToHome").click();
  }
  // ###############################################################################
  getFile() {
    document.querySelector(".creat_post_image_loader").style.display = "none";
    this.setState({
      PostImage: "",
    });
    document.getElementById("hidden_file2").click();
    if (this.state.ProfilePictureToDelete !== "") {
      fetch(`/files/${this.state.ProfilePictureToDelete}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    }
  }
  // ###############################################################################
  async getValue() {
    const allFileInfos = document.getElementById("hidden_file2");
    if (allFileInfos.value) {
      document.querySelector(".creat_post_image_loader").style.display = "flex";
    }
    console.log();
    const formData = new FormData();
    formData.append("file", allFileInfos.files[0]);
    // #######################
    let response = await fetch("/upload", {
      method: "post",
      body: formData,
    });
    let pictureInServer = await response.json();
    let theFile = await get(pictureInServer, "file.filename");
    let theFileId = await get(pictureInServer, "file.id");
    if ((theFile !== undefined) & (theFileId !== undefined)) {
      await this.setState({
        PostImage: theFile,
        ProfilePictureToDelete: theFileId,
      });

      let imageContainer = document.querySelector(".post_creation_container");
      imageContainer.scrollTop =
        imageContainer.scrollHeight - imageContainer.clientHeight;

      setTimeout(() => {
        document.querySelector(".creat_post_image_loader").style.display =
          "none";
      }, 1000);
    }
  }
  // ###############################################################################
  closeLeftBar() {
    document
      .querySelector(".hamburger_menu")
      .children[0].classList.remove("bare_active");
    document.querySelector(".Left_Bar").classList.remove("Left_Bar_active");
  }
  // ###############################################################################
  render() {
    let postImage;
    if (this.state.PostImage !== "") {
      postImage = (
        <img src={`image/${this.state.PostImage}`} alt="" width="100%" />
      );
    } else {
      postImage = null;
    }
    // ####################
    let postSendingBtn;
    if (this.state.PostTitle && this.state.PostDescription) {
      postSendingBtn = (
        <div onClick={debounce(this.sendPost, 1000)} className="send_post btn">
          Send Post
        </div>
      );
    } else {
      postSendingBtn = <div className="send_post2 btn">Send Post</div>;
    }

    return (
      <React.Fragment>
        <div className="post_creation_container_overlay">
          <div className="lds-ripple">
            <div></div>
            <div></div>
          </div>
          <h2>Your Post is Send...</h2>
        </div>
        <div className="post_creation_container">
          <div className="send_post_container">
            {postSendingBtn}
            <Link style={{ textDecoration: "none" }} to="/home">
              <h3 style={{ opacity: "0" }} className="goToHome">
                goToHome
              </h3>
            </Link>
          </div>
          <div className="creat_post">
            <div className="creat_post_header">
              <Link style={{ textDecoration: "none" }} to="/my-profile-page">
                <div
                  className="post_author_picture"
                  style={{
                    backgroundImage: this.props.UserProfilePicture,
                  }}
                ></div>
              </Link>

              <h6 className="post_author_name">{this.props.UserName}</h6>
            </div>
            <div className="creat_post_image">
              {postImage}
              <div className="select_picture_container">
                <div onClick={this.getFile} className="select_picture btn">
                  Select picture
                </div>
              </div>
              <div className="creat_post_image_loader loader">
                <div className="lds-ripple">
                  <div></div>
                  <div></div>
                </div>
              </div>
            </div>
            <form
              className="fileInput"
              method="post"
              encType="multipart/form-data"
            >
              <input
                type="file"
                id="hidden_file2"
                name="file"
                onChange={this.getValue}
              />
            </form>
            <div className="post_description">
              <h5 className="creat_post_title">
                <input
                  id="creat_title"
                  type="text"
                  name="PostTitle"
                  placeholder="Your post title..."
                  onChange={this.handleChange}
                  maxLength="65"
                />
              </h5>
              <textarea
                name="PostDescription"
                id="creat_description"
                cols="10"
                rows="10"
                placeholder="Your post..."
                onChange={this.handleChange}
              ></textarea>
            </div>
            <div className="post_date">{this.state.PostDate}</div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default PostCreator;
