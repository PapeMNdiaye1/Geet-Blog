import React from "react";
import { myGetFetcher, myPostFetcher } from "../myFetcher";

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      CourantContactId: "",
      CourantContactProfilePicture: "",
      CourantChatId: "",
      CourantContactName: "...",
      AllMyContact: [],
      Message: "",
      LastMessageN: 0,
    };
    this.getContact = this.getContact.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }
  // ##########################################################################
  async componentDidMount() {
    if (this.props.TheCourantContactProfilePicture !== "") {
      this.setState({
        CourantContactProfilePicture: this.props
          .TheCourantContactProfilePicture,
        CourantContactId: this.props.TheCourantContactId,
        CourantContactName: this.props.TheCourantContactName,
        CourantChatId: this.props.TheCourantChatId,
      });
      let response = await myGetFetcher(`
      Chat/get-last-contacts/${this.props.MyId}
      `);
      this.getContact(response.contacts);
      // ######################
      // let nimp = await myGetFetcher(`
      // Chat/get-Last-Mes/${this.state.CourantChatId}
      // `);
      // console.log(nimp);
    }
  }
  // ##########################################################################
  handleChange(e) {
    const theFormValue = e.target.value.trim();
    this.setState({
      Message: theFormValue.replace(/(\n)+/g, "\n"),
    });
  }
  // ##########################################################################
  async getContact(contacts) {
    let contactsArray = [];
    contacts.map((contact) => {
      contactsArray.push(
        <Contact
          key={contact.contactId}
          ContactId={contact.contactId}
          CourantContactId={this.state.CourantContactId}
          ContactName={contact.contactName}
          lastMessageTime={contact.messageTime}
          ChatIdentification={contact.chatIdentification}
        />
      );
      this.setState({
        AllMyContact: contactsArray,
      });
    });
  }
  // ##########################################################################
  async sendMessage() {
    let dt = new Date();
    let date = `${(dt.getMonth() + 1)
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
      .padStart(2, "0")}:${dt.getMinutes().toString().padStart(2, "0")}`;

    let isMessageSend = await myPostFetcher(
      `
  Chat/send-message/${this.state.CourantChatId}
  `,
      {
        MessageN: this.state.LastMessageN,
        MessageAuthorId: this.props.MyId,
        MessageText: this.state.Message,
        MessageTime: date,
        ContactId: this.state.CourantContactId,
      }
    );
    console.log(isMessageSend);
  }
  // ?##########################################################################
  render() {
    return (
      <div className="the_chat_container">
        <div className="all_existing_chats">
          <div className="all_existing_chats_head">
            <h3>Contacts</h3>
          </div>
          <div className="courant_contact">
            <div
              className="contact_picture"
              style={{
                backgroundImage: this.state.CourantContactProfilePicture,
              }}
            ></div>
            <div className="courant_contact_name">
              {this.state.CourantContactName}
            </div>
          </div>
          <div className="chat_contact_container">
            {this.state.AllMyContact}
          </div>
        </div>
        <div className="courant_chat_container">
          <div className="messages_container">
            <Message SendByMe={true} />
            <Message SendByMe={false} />
            <Message SendByMe={true} />
            <Message SendByMe={true} />
            <Message SendByMe={false} />
            <Message SendByMe={false} />
            <Message SendByMe={true} />
            <Message SendByMe={false} />
            <Message SendByMe={true} />
            <Message SendByMe={false} />
            <Message SendByMe={false} />
            <Message SendByMe={true} />
            <Message SendByMe={false} />
          </div>
          <div className="the_message_form_container">
            <form>
              <textarea
                name="message"
                placeholder="Your Message..."
                cols="30"
                rows="10"
                onChange={this.handleChange}
              ></textarea>
              <div className="send_message" onClick={this.sendMessage}>
                send
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

class Contact extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ContactPicture: "",
    };
  }

  async componentDidMount() {
    if (this.props.CourantContactId === this.props.ContactId) {
      document.getElementById(`contact${this.props.ContactId}`).style.display =
        "none";
    }
    let response = await myGetFetcher(`
    Chat/get-contact-profile-picture/${this.props.ContactId}`);

    if (response.contactProfilePicture) {
      this.setState({
        ContactPicture: response.contactProfilePicture.profilePicture,
      });
    }
  }
  render() {
    return (
      <div
        className="one_contact_container"
        id={`contact${this.props.ContactId}`}
      >
        <div
          className="contact_profile_picture"
          style={{
            backgroundImage: this.state.ContactPicture,
          }}
        ></div>
        <div className="contact_infos">
          <div className="contact_name">{this.props.ContactName}</div> <br />
          <div className="last_contact">
            last See: {this.props.lastMessageTime}
          </div>
        </div>
      </div>
    );
  }
}

class Message extends React.Component {
  render() {
    return (
      <React.Fragment>
        {this.props.SendByMe ? (
          <div className="one_message_container">
            <div className="received_message">Lorem ipsum</div>
          </div>
        ) : (
          <div className="one_message_container one_message_container_by_me ">
            <div className="sending_message ">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Laboriosam natus sapele
            </div>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default Chat;
