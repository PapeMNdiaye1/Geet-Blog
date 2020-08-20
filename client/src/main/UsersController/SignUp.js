import React, { Component } from "react";
import { Redirect, Link } from "react-router-dom";
import { myFetcher } from "../myFetcher";
import { get } from "lodash";
//! ##########################################################################################################
class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      Name: "",
      Email: "",
      Password: "",
      PasswordConfirmation: "",
      ProfilePicture: "",
      ProfilePictureToDelete: "",
      TheUserIsLogin: false,
      ErrorMessage: false,
    };
    this.handleSignup = this.handleSignup.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getFile = this.getFile.bind(this);
    this.getValue = this.getValue.bind(this);
    this.validationBorder = this.validationBorder.bind(this);
  }
  // #################################################################################
  componentDidMount() {
    document.querySelector(".signup_body_overlay").style.display = "none";
    document.querySelector(".the_profile_picture_loader").style.display =
      "none";
  }
  // #################################################################################
  handleChange(e) {
    document.querySelectorAll(".forms")[2].style.border = "";
    document.querySelectorAll(".forms")[3].style.border = "";
    this.validationBorder("1px #FFF solid");
    this.setState({
      ErrorMessage: false,
    });
    const theFormName = e.target.name;
    const theFormValue = e.target.value;
    this.setState({
      [theFormName]: theFormValue,
    });
  }
  // #################################################################################
  async handleSignup(e) {
    e.preventDefault();
    if (this.state.PasswordConfirmation === this.state.Password) {
      document.querySelector(".signup_body_overlay").style.display = "flex";
      let Data = {
        Name: this.state.Name,
        Email: this.state.Email,
        Password: this.state.Password,
        ProfilePicture: this.state.ProfilePicture,
      };
      let isUserLogin = await myFetcher("/User/signup", "post", Data);

      if (isUserLogin === true) {
        this.setState({
          TheUserIsLogin: isUserLogin,
        });
        sessionStorage.setItem("Email", this.state.Email);
        this.props.onUserLogin(this.state);
      } else if (isUserLogin === "Email Already Exists") {
        document.querySelector(".signup_body_overlay").style.display = "none";
        this.validationBorder("1px red solid");
        this.setState({
          ErrorMessage: true,
        });
      }
    } else {
      document.querySelectorAll(".forms")[2].style.border = "1px red solid";
      document.querySelectorAll(".forms")[3].style.border = "1px red solid";
    }
  }
  // ###############################################
  getFile() {
    document.querySelector(".my_profile_picture").style.backgroundImage = "";
    document.getElementById("hidden_file").click();
    if (this.state.ProfilePictureToDelete !== "") {
      fetch(`/files/${this.state.ProfilePictureToDelete}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
      });
    }
  }
  // ##############################################
  async getValue() {
    const allFileInfos = document.getElementById("hidden_file");
    if (allFileInfos.value) {
      document.querySelector(".the_profile_picture_loader").style.display =
        "flex";
    }
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
      document.querySelector(
        ".my_profile_picture"
      ).style.backgroundImage = `url(image/${theFile})`;
      this.setState({
        ProfilePicture: `url(image/${theFile})`,
        ProfilePictureToDelete: theFileId,
      });
      setTimeout(() => {
        document.querySelector(".the_profile_picture_loader").style.display =
          "none";
      }, 2000);
    }
  }
  // ############################################
  validationBorder(border) {
    document.querySelectorAll(".forms")[1].style.border = border;
  }
  // ############################################
  render() {
    if (this.state.TheUserIsLogin) {
      return <Redirect to={"/home"} />;
    }
    return (
      <React.Fragment>
        <div className="signup_body_overlay">
          <div className="lds-ripple">
            <div></div>
            <div></div>
          </div>
        </div>
        <div className="signup_body">
          <h1 className="signup_and_login_title">Signup</h1>
          <div className="forms_container">
            <div className="creat_profile_picture">
              <div onClick={this.getFile} className="my_profile_picture btn">
                <div className="the_profile_picture_loader">
                  <div className="lds-ripple">
                    <div></div>
                    <div></div>
                  </div>
                </div>
              </div>
            </div>
            <form onSubmit={this.handleSignup}>
              <Form
                type="text"
                name="Name"
                onchange={this.handleChange}
                maxLength={18}
                minLength={5}
              />
              <Form type="email" name="Email" onchange={this.handleChange} />
              {this.state.ErrorMessage && (
                <div className="user_not_fund">Email Already Exists</div>
              )}
              <div className="password_forms_container">
                <Form
                  type="password"
                  name="Password"
                  onchange={this.handleChange}
                  maxLength={20}
                  minLength={5}
                />
                <Form
                  type="password"
                  name="PasswordConfirmation"
                  onchange={this.handleChange}
                />
              </div>
              <br />
              <div className="btn_container">
                <button type="submit" className="btn">
                  Send
                </button>
              </div>
            </form>
            <div className="switch">
              <Link to="/login">
                <button type="submit" className="btn btn-warning mt-1">
                  Go To Login
                </button>
              </Link>
            </div>
          </div>
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
        </div>
      </React.Fragment>
    );
  }
}

// !##########################################################################################
export const Form = ({ type, name, onchange, maxLength, minLength }) => {
  return (
    <div>
      {name !== "PasswordConfirmation" ? (
        <label htmlFor={name}>{name}</label>
      ) : (
        <label htmlFor={name}>Confirmation</label>
      )}
      <br />

      <input
        required
        type={type}
        name={name}
        id={name}
        className="forms"
        maxLength={maxLength}
        minLength={minLength}
        onChange={onchange}
      />
    </div>
  );
};

export default SignUp;
