class App {
  constructor() {
    
    this.firebaseConfig = {
      apiKey: "AIzaSyAy1k4p3XTRFettHhKlMn8lyi1kpY2UCcI",
      authDomain: "instagram-83d9f.firebaseapp.com",
      projectId: "instagram-83d9f",
      storageBucket: "instagram-83d9f.appspot.com",
      messagingSenderId: "795046993869",
      appId: "1:795046993869:web:7d31a989d9ed6c63222e84"
    };

    firebase.initializeApp(this.firebaseConfig);

    //Post information
    this.postInfo = {
      postID: "",
      displayName: "",
      imgFile: "",
      userUID: "",
      caption: "This is a caption",
      likes: Math.floor(Math.random() * 101),
      timestamp: this.getTimestamp(),
    };

    // Attributes
    this.firebaseAuth = firebase.auth();
    this.firebaseStorage = firebase.storage().ref();
    this.db = firebase.firestore();
    this.firebaseUI = document.querySelector("#firebaseui-auth-container");
    this.appUI = document.querySelector(".App");
    this.ui = new firebaseui.auth.AuthUI(firebase.auth());
    this.posts = [];
    this.logoutBtn = document.querySelector(".logout-btn");
    this.files = document.querySelector("#files");
    this.postBtn = document.querySelector("#post-btn");
    this.updateBtn = document.querySelector("#update-btn");
    this.postBTN = document.querySelector(".post-btn");
    this.exit_edit = document.querySelector(".exit-edit");
    this.exit_post = document.querySelector(".exit-post");

    //Methods to run when initializing an object
    this.handelAuth();
    this.handelEventListeners();
  }

  // App Methods

  // handle the Authentication
  handelAuth() {
    const uiConfig = {
      callbacks: {
        signInSuccessWithAuthResult: () => {
          console.log("Loged in");

          let user = this.firebaseAuth.currentUser;
          this.postInfo.userUID = user.uid;
          this.postInfo.displayName = user.displayName;

          this.appUI.style.display = "block";

          this.getPost();
        },
      },
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
    };

    this.ui.start(this.firebaseUI, uiConfig);
  }

  //handle all the events on page
  handelEventListeners() {
    this.logoutBtn.addEventListener("click", () => {
      this.logout();
    });

    this.files.addEventListener("change", (e) => {
      this.uploadPost(e.target.files[0]);
    });

    this.postBtn.addEventListener("click", () => {
      let captionText = document.querySelector("#post-caption-text").value;
      this.postInfo.postID = `post${Math.floor(Math.random() * 100)}`;
      this.postInfo.caption = captionText;
      this.UploadPost();
      this.closeSection();
    });

    this.updateBtn.addEventListener("click", () => {
      let captionText = document.querySelector("#post-caption-text").value;
      this.postInfo.caption = captionText;

      this.UploadPost();
      this.closeSection();
    });

    this.postBTN.addEventListener("click", () => {
      this.createPost();
    });

    this.exit_edit.addEventListener("click", () => {
      this.closeSection();
    });

    this.exit_post.addEventListener("click", () => {
      this.closeSection();
    });

    // diplay options to edit and delete a posts
    document.body.addEventListener("click", (e) => {
      
      let editBtn = document.querySelector(".edit");
      let deleteBtn = document.querySelector(".delete");

      //Check if the user is on that posted the post and that the options menu are clicked
      if (
        e.target.classList.contains("openEdit") &
        e.target.classList.contains(this.postInfo.userUID)
      ) {
        this.postInfo.postID = e.target.classList[2];
        this.postInfo.ImgUrl = e.target.classList[3];
        this.postInfo.imgFile = e.target.classList[4];

        editBtn.style.display = "flex";
        deleteBtn.style.display = "flex";
        this.openOptionsModal();
      } else if (
        e.target.classList.contains("openEdit") &
        (e.target.classList.contains(this.postInfo.userUID) === false)
      ) {
        //hide the edit and delete button
        editBtn.style.display = "none";
        deleteBtn.style.display = "none";

        this.openOptionsModal();
      }

      //edit button on options modal
      if (e.target.classList.contains("edit")) {
        this.edit();
      }

      //delete button on options modal
      if (e.target.classList.contains("delete")) {
        this.deletePost();
        this.closeSection();
      }
    });
  }
  //open the options modal
  openOptionsModal() {
    let editSection = document.querySelector(".edit-section");

    editSection.style.display = "block";
  }
  //hide post section and options modal
  closeSection() {
    let editSection = document.querySelector(".edit-section");
    let postSection = document.querySelector(".new-post-section");

    editSection.style.display = "none";
    postSection.style.display = "none";
  }

  //logout
  logout() {
    this.firebaseAuth
      .signOut()
      .then(() => {
        // Sign-out successful.

        this.appUI.style.display = "none";

        this.handelAuth();

        console.log("logged out");
      })
      .catch((error) => {
        // An error happened.
        console.log(error);
      });
  }

  // upload image to firebase
  uploadPost(file) {
    if (file) {
      this.postInfo.imgFile = file.name;

      this.firebaseStorage.child(file.name).put(file).then((snapshot) => {
        console.log("Uploaded a file!");
        this.getURL(file);
      });
    }
  }

  //get the url of the images from firebase
  getURL(file) {
    this.firebaseStorage.child(file.name).getDownloadURL().then((url) => {
        this.postInfo.ImgUrl = url;
      });
  }

  //upload the post object to database
  UploadPost() {
    this.db.collection("posts").doc(this.postInfo.postID).set(this.postInfo).then(() => {
        console.log("Document successfully written!");
        this.getPost();
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  }

  //get data data from the database
  getPost() {
    this.posts = [];
    this.db.collection("posts").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          this.posts.push(doc.data());
        });
        this.displayPost();
      });
  }

// Get the time the post was posted

  getTimestamp() {
    const d = new Date();
    const timestamp = d.getHours() + ':' + d.getUTCMinutes();
    return timestamp;
  }

  //Load the post to the webpage from the object
  displayPost() {
    if (this.posts) {
      let postContainer = document.querySelector(".posts");
      postContainer.innerHTML = null;

      this.posts.forEach((item) => {
        postContainer.innerHTML += `
           <div class="post">
                <div class="header">
                  <div class="profile-area">
                    <div class="post-pic">
                      <img
                        alt="jayshetty's profile picture"
                        class="_6q-tv"
                        data-testid="user-avatar"
                        draggable="false"
                        src="assets/akhil.png"
                      />
                    </div>
                    <span class="profile-name">${item.displayName}</span>
                  </div>
                  <div class="options">
                    <div
                      class="Igw0E rBNOH YBx95 _4EzTm"
                      style="height: 24px; width: 24px"
                    >
                      <svg class="openEdit ${item.userUID} ${item.postID} ${item.ImgUrl} ${item.imgFile}"
                        aria-label="More options"
                        class="_8-yf5"
                        fill="#262626"
                        height="16"
                        viewBox="0 0 48 48"
                        width="16"
                      >
                        <circle
                          clip-rule="evenodd"
                          cx="8"
                          cy="24"
                          fill-rule="evenodd"
                          r="4.5"
                        ></circle>
                        <circle
                          clip-rule="evenodd"
                          cx="24"
                          cy="24"
                          fill-rule="evenodd"
                          r="4.5"
                        ></circle>
                        <circle
                          clip-rule="evenodd"
                          cx="40"
                          cy="24"
                          fill-rule="evenodd"
                          r="4.5"
                        ></circle>
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="body">
                  <img
                    alt="Photo by Jay Shetty on September 12, 2020. Image may contain: 2 people."
                    class="FFVAD"
                    decoding="auto"
                    sizes="614px"
                    src="${item.ImgUrl}"
                    style="object-fit: cover"
                  />
                </div>
                <div class="footer">
                  <div class="user-actions">
                    <div class="like-comment-share">
                      <div>
                        <span class=""
                          ><svg
                            aria-label="Like"
                            class="_8-yf5"
                            fill="#262626"
                            height="24"
                            viewBox="0 0 48 48"
                            width="24"
                          >
                            <path
                              d="M34.6 6.1c5.7 0 10.4 5.2 10.4 11.5 0 6.8-5.9 11-11.5 16S25 41.3 24 41.9c-1.1-.7-4.7-4-9.5-8.3-5.7-5-11.5-9.2-11.5-16C3 11.3 7.7 6.1 13.4 6.1c4.2 0 6.5 2 8.1 4.3 1.9 2.6 2.2 3.9 2.5 3.9.3 0 .6-1.3 2.5-3.9 1.6-2.3 3.9-4.3 8.1-4.3m0-3c-4.5 0-7.9 1.8-10.6 5.6-2.7-3.7-6.1-5.5-10.6-5.5C6 3.1 0 9.6 0 17.6c0 7.3 5.4 12 10.6 16.5.6.5 1.3 1.1 1.9 1.7l2.3 2c4.4 3.9 6.6 5.9 7.6 6.5.5.3 1.1.5 1.6.5.6 0 1.1-.2 1.6-.5 1-.6 2.8-2.2 7.8-6.8l2-1.8c.7-.6 1.3-1.2 2-1.7C42.7 29.6 48 25 48 17.6c0-8-6-14.5-13.4-14.5z"
                            ></path></svg></span>
                      </div>
                      <div class="margin-left-small">
                        <svg
                          aria-label="Comment"
                          class="_8-yf5"
                          fill="#262626"
                          height="24"
                          viewBox="0 0 48 48"
                          width="24"
                        >
                          <path
                            clip-rule="evenodd"
                            d="M47.5 46.1l-2.8-11c1.8-3.3 2.8-7.1 2.8-11.1C47.5 11 37 .5 24 .5S.5 11 .5 24 11 47.5 24 47.5c4 0 7.8-1 11.1-2.8l11 2.8c.8.2 1.6-.6 1.4-1.4zm-3-22.1c0 4-1 7-2.6 10-.2.4-.3.9-.2 1.4l2.1 8.4-8.3-2.1c-.5-.1-1-.1-1.4.2-1.8 1-5.2 2.6-10 2.6-11.4 0-20.6-9.2-20.6-20.5S12.7 3.5 24 3.5 44.5 12.7 44.5 24z"
                            fill-rule="evenodd"
                          ></path>
                        </svg>
                      </div>
                      <div class="margin-left-small">
                        <svg
                          aria-label="Share Post"
                          class="_8-yf5"
                          fill="#262626"
                          height="24"
                          viewBox="0 0 48 48"
                          width="24"
                        >
                          <path
                            d="M47.8 3.8c-.3-.5-.8-.8-1.3-.8h-45C.9 3.1.3 3.5.1 4S0 5.2.4 5.7l15.9 15.6 5.5 22.6c.1.6.6 1 1.2 1.1h.2c.5 0 1-.3 1.3-.7l23.2-39c.4-.4.4-1 .1-1.5zM5.2 6.1h35.5L18 18.7 5.2 6.1zm18.7 33.6l-4.4-18.4L42.4 8.6 23.9 39.7z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                    <div class="bookmark">
                      <div class="QBdPU rrUvL">
                        <svg
                          aria-label="Save"
                          class="_8-yf5"
                          fill="#262626"
                          height="24"
                          viewBox="0 0 48 48"
                          width="24"
                        >
                          <path
                            d="M43.5 48c-.4 0-.8-.2-1.1-.4L24 29 5.6 47.6c-.4.4-1.1.6-1.6.3-.6-.2-1-.8-1-1.4v-45C3 .7 3.7 0 4.5 0h39c.8 0 1.5.7 1.5 1.5v45c0 .6-.4 1.2-.9 1.4-.2.1-.4.1-.6.1zM24 26c.8 0 1.6.3 2.2.9l15.8 16V3H6v39.9l15.8-16c.6-.6 1.4-.9 2.2-.9z"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <span class="likes"
                    >Likes <b>${item.likes}</b></span
                  >
                  <span class="caption">
                    <span class="caption-username"><b>${item.displayName}</b></span>
                    <span class="caption-text">
                     ${item.caption}
                     </span>
                  </span>
                  <span class="comment">
                    <span class="caption-username"><b>akhilboddu</b></span>
                    <span class="caption-text">Thank you</span>
                  </span>
                  <span class="comment">
                    <span class="caption-username"><b>imharjot</b></span>
                    <span class="caption-text"> Great stuff</span>
                  </span>
                  <span class="posted-time">${item.timestamp}</span>
                </div>
                <div class="add-comment">
                  <input type="text" placeholder="Add a comment..." />
                  <a class="post-btn">Post</a>
                </div>
              </div>
          
          `;
      });
    }
  }

  //display the edit modal
  edit() {
    if (this.posts) {
      this.posts.forEach((item) => {
        if (item.postID === this.postInfo.postID) {
          let postSection = document.querySelector(".new-post-section");
          let editSection = document.querySelector(".edit-section");
          let postContainer = document.querySelector(".post-container");
          postSection.style.display = "block";
          editSection.style.display = "none";

          console.log(postContainer.children);

          postContainer.children[0].style.display = "block";
          postContainer.children[0].src = item.ImgUrl;
          postContainer.children[1].style.display = "none";
          postContainer.children[4].textContent = item.caption;
          postContainer.children[5].value = item.caption;
          postContainer.children[7].style.display = "none";
          postContainer.children[8].style.display = "block";
        }
      });
    }
  }

  //create a post
  createPost() {
    let postSection = document.querySelector(".new-post-section");
    let editSection = document.querySelector(".edit-section");
    let postContainer = document.querySelector(".post-container");
    postSection.style.display = "block";
    editSection.style.display = "none";

    console.log(postContainer.children);

    postContainer.children[0].style.display = "none";
    postContainer.children[1].style.display = "block";
    postContainer.children[4].textContent = null;
    postContainer.children[5].value = null;
    postContainer.children[7].style.display = "block";
    postContainer.children[8].style.display = "none";
  }

  //delete an image from storage
  deletePost() {
    console.log(this.postInfo.postID);

    this.firebaseStorage.child(this.postInfo.imgFile).delete();

    setTimeout(() => {
      this.delete();
    }, 3000);
  }

  //delete the post from the database
  delete() {
    this.db.collection("posts").doc(this.postInfo.postID).delete().then(() => {
        console.log("Document successfully deleted!");
        this.getPost();
      })
      .catch((error) => {
        console.error("Error removing document: ", error);
      });
  }
}

const app = new App();
