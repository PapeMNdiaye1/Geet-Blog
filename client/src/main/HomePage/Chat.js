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
      AllMessages: [
        <div key="chat_starting" className="chat_starting">
          <h3>Your Private Chat</h3>
        </div>,
      ],
      AllExistingMessagesId: [],
      Message: "",
      CurrentlyLastMessageN: 0,
      CurrentlyFirstMessageN: 0,
      LastMessageInDbN: 0,
      FirstMessageInDbN: 0,
      NoCollision: true,
    };
    this.getContact = this.getContact.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.getLastMessages = this.getLastMessages.bind(this);
    this.getSomeMessages = this.getSomeMessages.bind(this);
    this.startChat = this.startChat.bind(this);
    this.changeChat = this.changeChat.bind(this);
    this.deleteSomeMessages = this.deleteSomeMessages.bind(this);
    this.closeLeftBar = this.closeLeftBar.bind(this);
    this.toggleChatContainer = this.toggleChatContainer.bind(this);
    this.resetCurrentlyLastMessageN = this.resetCurrentlyLastMessageN.bind(
      this
    );
  }
  // ##########################################################################
  async changeChat(contactDat) {
    if (this.state.CourantContactId) {
      document.getElementById(
        `contact${this.state.CourantContactId}`
      ).style.display = "";
    }
    this.setState({
      AllMessages: [
        <div key="my_message_loader" className="my_massage_loader">
          <div className="lds-ripple">
            <div></div>
            <div></div>
          </div>
        </div>,
      ],
    });
    await this.startChat(
      contactDat.chatIdentification,
      contactDat.contactPicture,
      contactDat.contactId,
      contactDat.contactName,
      true
    );
  }
  // ##########################################################################
  async startChat(
    theChatId,
    theProfilePicture,
    theContactId,
    theContactName,
    inChangeChat
  ) {
    if (theChatId !== "") {
      await this.setState({
        CourantContactProfilePicture: theProfilePicture,
        CourantContactId: theContactId,
        CourantContactName: theContactName,
        CourantChatId: theChatId,
      });

      if (inChangeChat) {
        document.getElementById(
          `contact${this.state.CourantContactId}`
        ).style.display = "none";
      }
    }
    if ((theContactId !== "") & (theProfilePicture === "")) {
      let response = await myGetFetcher(`
  Chat/get-contact-profile-picture/${theContactId}`);
      if (response.contactProfilePicture) {
        this.setState({
          CourantContactProfilePicture:
            response.contactProfilePicture.profilePicture,
        });
      }
    }
    if (this.state.CourantChatId !== "") {
      let response = await myPostFetcher(
        `
      Chat/get-Last-Mes/${this.state.CourantChatId}
      `,
        { NtoGrab: -15 }
      );
      if (response.messages) {
        this.getLastMessages(response.messages.message);
      }
    }
  }

  // ##########################################################################
  closeLeftBar() {
    document
      .querySelector(".hamburger_menu")
      .children[0].classList.remove("bare_active");
    document.querySelector(".Left_Bar").classList.remove("Left_Bar_active");
  }
  // ##########################################################################
  async componentDidMount() {
    this.closeLeftBar();
    this.startChat(
      this.props.TheCourantChatId,
      this.props.TheCourantContactProfilePicture,
      this.props.TheCourantContactId,
      this.props.TheCourantContactName,
      false
    );
    let response = await myGetFetcher(`
    Chat/get-last-contacts/${this.props.MyId}
    `);

    this.getContact(response.contacts);

    this.refresh = setInterval(async () => {
      if ((this.state.CourantChatId !== "") & this.state.NoCollision) {
        let deletedMessages = await myGetFetcher(
          `
          Chat/get-deleted-messages/${this.state.CourantChatId}`
        );

        if (deletedMessages.allDeletedMessages) {
          await this.deleteSomeMessages(deletedMessages.allDeletedMessages);
        }
        // ###############################################
        let response = await myPostFetcher(
          `
          Chat/refresh/${this.state.CourantChatId}
          `,
          {
            CurrentlyLastMessageN: this.state.CurrentlyLastMessageN,
          }
        );
        if (response.messages) {
          await this.getSomeMessages(response.messages.message);
          let messagesContainer = document.querySelector(".messages_container");
          messagesContainer.scrollTop =
            messagesContainer.scrollHeight - messagesContainer.clientHeight;
        } else {
          console.log(response.messages);
        }
      }
    }, 15000);
  }
  // ##########################################################################
  componentWillUnmount() {
    clearInterval(this.refresh);
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
          MyId={this.props.MyId}
          CourantContactId={this.state.CourantContactId}
          ContactName={contact.contactName}
          lastMessageTime={contact.messageTime}
          ChatIdentification={contact.chatIdentification}
          onChangeChat={this.changeChat}
        />
      );
      this.setState({
        AllMyContact: contactsArray,
      });
    });
  }
  // ##########################################################################
  async getLastMessages(messages) {
    await this.setState({
      CurrentlyLastMessageN: messages[messages.length - 1].messageN,
      CurrentlyFirstMessageN: messages[0].messageN,
      AllExistingMessagesId: [
        ...new Set([...messages.map((message) => message._id)]),
      ],
    });
    // console.log(this.state.AllExistingMessagesId);
    let messagesArray = [];
    await messages.map((message) => {
      messagesArray.push(
        <Message
          key={message._id}
          messageId={message._id}
          MessageAuthorId={message.messageAuthorId}
          MyId={this.props.MyId}
          MessageText={message.messageText}
          MessageSendingTime={message.messageTime}
          messageN={message.messageN}
          ChatIdentification={this.state.CourantChatId}
          onMessageDelete={this.resetCurrentlyLastMessageN}
        />
      );
    });
    this.setState({
      AllMessages: messagesArray,
    });
    let messagesContainer = document.querySelector(".messages_container");
    messagesContainer.scrollTop =
      messagesContainer.scrollHeight - messagesContainer.clientHeight;
  }
  // ##########################################################################
  async getSomeMessages(messages) {
    let someMessagesArray = [];
    await messages.map((message) => {
      console.log(!this.state.AllExistingMessagesId.includes(message._id));
      !this.state.AllExistingMessagesId.includes(message._id) &&
        someMessagesArray.push(
          <Message
            key={message._id}
            messageId={message._id}
            MessageAuthorId={message.messageAuthorId}
            MyId={this.props.MyId}
            MessageText={message.messageText}
            MessageSendingTime={message.messageTime}
            messageN={message.messageN}
            ChatIdentification={this.state.CourantChatId}
            onMessageDelete={this.resetCurrentlyLastMessageN}
          />
        );
    });
    this.setState({
      AllMessages: [...this.state.AllMessages, ...someMessagesArray],
      AllExistingMessagesId: [
        ...new Set([
          ...this.state.AllExistingMessagesId,
          ...messages.map((message) => message._id),
        ]),
      ],
      CurrentlyLastMessageN: messages[messages.length - 1].messageN,
    });
    let loader = document.querySelector(".my_massage_loader");
    if (loader !== null) {
      loader.style.display = "none";
    }
    let starter = document.querySelector(".chat_starting");
    if (starter !== null) {
      starter.style.display = "none";
    }
  }
  // ##########################################################################
  resetCurrentlyLastMessageN() {
    this.setState({
      CurrentlyLastMessageN: this.state.CurrentlyLastMessageN - 1,
    });
  }
  // ##########################################################################
  async sendMessage() {
    if ((this.state.Message !== "") & (this.state.CourantChatId !== "")) {
      this.setState({
        Message: "",
        NoCollision: false,
      });
      document.querySelector("#message_textarea").value = "";
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
        `Chat/send-message/${this.state.CourantChatId}`,
        {
          MessageAuthorId: this.props.MyId,
          MessageText: this.state.Message,
          MessageTime: date,
          ContactId: this.state.CourantContactId,
        }
      );

      if (isMessageSend.response) {
        await this.setState({
          LastMessageInDbN: isMessageSend.nofMes,
        });
        let theNtoGrab = -1;
        if (this.state.LastMessageInDbN > this.state.CurrentlyLastMessageN) {
          theNtoGrab = -(
            this.state.LastMessageInDbN - this.state.CurrentlyLastMessageN
          );
        }
        let response = await myPostFetcher(
          `
          Chat/get-Last-Mes/${this.state.CourantChatId}
          `,
          {
            NtoGrab: theNtoGrab,
          }
        );
        if (response.messages) {
          await this.getSomeMessages(response.messages.message);
          let messagesContainer = document.querySelector(".messages_container");
          messagesContainer.scrollTop =
            messagesContainer.scrollHeight - messagesContainer.clientHeight;
          this.setState({
            NoCollision: true,
          });
        }
      } else {
        this.setState({
          NoCollision: true,
        });
      }
    }
  }
  // ##########################################################################
  async deleteSomeMessages(allDeletedMessages) {
    allDeletedMessages.forEach((messageId) => {
      let message = document.getElementById(`messageA${messageId}`);
      if (message !== null) {
        message.style.display = "none";
        this.setState({
          CurrentlyLastMessageN: this.state.CurrentlyLastMessageN - 1,
        });
      }
    });
  }
  // #########################################################################
  toggleChatContainer() {
    document
      .querySelector(".all_existing_chats")
      .classList.toggle("all_existing_chats_active");
    document
      .querySelector(".other_chats")
      .classList.toggle("other_chats_active");
  }
  // ?#########################################################################
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
          <div className="courant_contact_in_mobile">
            <div
              className="contact_picture_mobile"
              style={{
                backgroundImage: this.state.CourantContactProfilePicture,
              }}
            ></div>
            <div className="courant_contact_name_mobile">
              {this.state.CourantContactName}
            </div>
            <div className="other_chats" onClick={this.toggleChatContainer}>
              <i className="fas fa-times"></i>
              <i className="fas fa-ellipsis-v"></i>
            </div>
          </div>
          <div className="messages_container">{this.state.AllMessages}</div>
          <div className="the_message_form_container">
            <form>
              <textarea
                name="message"
                placeholder="Your Message..."
                cols="30"
                rows="10"
                onChange={this.handleChange}
                id="message_textarea"
              ></textarea>
              {this.state.Message !== "" ? (
                <div className="send_message" onClick={this.sendMessage}>
                  send
                </div>
              ) : (
                <div className="send_message">send</div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }
}

class Contact extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ContactPicture: "",
      ContactName: "",
    };
    this.chatWith = this.chatWith.bind(this);
  }
  // ###########################################
  chatWith() {
    this.props.onChangeChat({
      contactPicture: this.state.ContactPicture,
      contactId: this.props.ContactId,
      contactName: this.props.ContactName,
      chatIdentification: this.props.ChatIdentification,
    });
  }
  // ###########################################
  async componentDidMount() {
    if (this.props.ContactName.length > 15) {
      this.setState({
        ContactName: this.props.ContactName.slice(0, 12) + "... ",
      });
    } else {
      this.setState({
        ContactName: this.props.ContactName,
      });
    }

    if (this.props.CourantContactId === this.props.ContactId) {
      document.getElementById(
        `contact${this.props.CourantContactId}`
      ).style.display = "none";
    }

    let response = await myGetFetcher(`
    Chat/get-contact-profile-picture/${this.props.ContactId}`);
    if (response.contactProfilePicture) {
      this.setState({
        ContactPicture: response.contactProfilePicture.profilePicture,
      });
    } else {
      try {
        document.getElementById(
          `contact${this.props.CourantContactId}`
        ).style.display = "none";
      } catch (error) {
        throw error;
      }
      await myPostFetcher(
        `
      Chat/delete-chat/${this.props.ChatIdentification}`,
        {
          MyId: this.props.MyId,
          ContactId: this.props.ContactId,
        }
      );
    }
  }
  render() {
    return (
      <div
        className="one_contact_container"
        id={`contact${this.props.ContactId}`}
        onClick={this.chatWith}
      >
        <div
          className="contact_profile_picture"
          style={{
            backgroundImage: this.state.ContactPicture,
          }}
        ></div>
        <div className="contact_infos">
          <div className="contact_name">{this.state.ContactName}</div> <br />
          <div className="last_contact">
            last See: {this.props.lastMessageTime}
          </div>
        </div>
      </div>
    );
  }
}

class Message extends React.PureComponent {
  constructor(props) {
    super(props);
    this.selectMessage = this.selectMessage.bind(this);
    this.activeOption = this.activeOption.bind(this);
    this.deleteMessage = this.deleteMessage.bind(this);
  }
  // ##########################################################################
  async selectMessage() {
    let AllMessages = await document.querySelectorAll(
      ".one_message_container_by_me"
    );
    AllMessages.forEach((message) => {
      message.classList.remove("one_message_container_active");
    });

    document
      .getElementById(`message${this.props.messageId}`)
      .classList.toggle("one_message_container_active");
  }
  // ##########################################################################
  async activeOption() {
    let AllDelete = await document.querySelectorAll(".delete_message");
    AllDelete.forEach((del) => {
      del.classList.remove("delete_message_active");
    });
    document
      .getElementById(`delete${this.props.messageId}`)
      .classList.toggle("delete_message_active");
  }
  // ##########################################################################
  async deleteMessage() {
    this.props.onMessageDelete();
    let isMessageDelete = await myPostFetcher(
      `Chat/delete-message/${this.props.ChatIdentification}`,
      {
        MessageId: this.props.messageId,
      }
    );
    if (isMessageDelete.response) {
      let messageToDelete = document.getElementById(
        `message${this.props.messageId}`
      );
      messageToDelete.style.display = "none";
    }
  }
  // ?##########################################################################
  render() {
    return (
      <React.Fragment>
        {this.props.MessageAuthorId === this.props.MyId ? (
          <div
            className="one_message_container one_message_container_by_me "
            id={`message${this.props.messageId}`}
            onClick={this.selectMessage}
          >
            <div
              className="delete_message"
              id={`delete${this.props.messageId}`}
              onClick={this.deleteMessage}
            >
              delete
            </div>
            <div onClick={this.activeOption} className="messages_option">
              <i className="fas fa-ellipsis-v"></i>
            </div>
            <p
              className="sending_message 
            "
              onClick={this.selectMessage}
            >
              {this.props.MessageText}
            </p>
          </div>
        ) : (
          <div
            className="one_message_container"
            id={`messageA${this.props.messageId}`}
          >
            <p className="received_message">{this.props.MessageText}</p>
          </div>
        )}
      </React.Fragment>
    );
  }
}

export default Chat;
