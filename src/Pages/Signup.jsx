import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  auth,
  updateProfile,
  addDoc,
  collection,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  db,
} from "../../FirebaseConfig/Firebase"; // Ensure the correct imports
import "./signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const email = useRef();
  const password = useRef();
  const userFirstName = useRef();
  const userLastName = useRef();
  const file = useRef();

  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false); // Loading state

  const loginBtn = () => {
    navigate("/Login");
  };
  function loginWithGoogle() {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        console.log(user);
        navigate("/");
        // IdP data available using getAdditionalUserInfo(result)
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.customData.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  }
  const SignupBtn = async (e) => {
    e.preventDefault();
    setWarning("");
    setLoading(true); // Set loading to true when signup starts

    const userEmail = email.current.value;
    const userPassword = password.current.value;
    const firstName = userFirstName.current.value;
    const lastName = userLastName.current.value;
    const userFile = file.current.files[0];

    if (!userEmail || !userPassword || !firstName || !lastName) {
      setWarning("Please fill in all fields.");
      setLoading(false); // Stop loading if validation fails
      return;
    }

    if (!userFile) {
      setWarning("Please add your profile pic.");
      setLoading(false); // Stop loading if file is missing
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userEmail,
        userPassword
      );
      const user = auth.currentUser;
      const uid = user.uid;

      // Upload the profile picture
      const storageRef = ref(storage, `profilePic/${userFile.name}`);
      await uploadBytes(storageRef, userFile);

      // Get the download URL for the uploaded image
      const getImage = await getDownloadURL(storageRef);
      console.log(getImage);
      // Update the user's profile with name and photo
      await updateProfile(auth.currentUser, {
        displayName: `${firstName} ${lastName}`,
        photoURL: getImage,
      });

      // Store user data in Firestore
      await addDoc(collection(db, "userData"), {
        email: userEmail,
        firstName: firstName,
        lastName: lastName,
        image: getImage,
        uid: uid,
      });

      // Navigate to home page after successful signup
      // navigate("/");
    } catch (error) {
      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        setWarning(
          "This email is already in use. Please use a different email."
        );
      } else if (error.code === "auth/weak-password") {
        setWarning("Password is too weak. Please use a stronger password.");
      } else if (error.code === "auth/invalid-email") {
        setWarning("Invalid email format. Please enter a valid email.");
      } else {
        setWarning("Error during signup: " + error.message);
      }
    }
  };

  return (
    <div className="signupDiv">
      <form>
        <div>
          <h1>Signup Page</h1>
        </div>
        <input type="file" ref={file} />
        <input type="text" placeholder="Enter email" ref={email} />
        <br />
        <input type="password" placeholder="Enter password" ref={password} />
        <br />
        <input
          type="text"
          placeholder="Enter your first name"
          ref={userFirstName}
        />
        <br />
        <input
          type="text"
          placeholder="Enter your last name"
          ref={userLastName}
        />
        <a onClick={loginBtn}>Already have an account</a>
        <input type="submit" value="Signup" onClick={SignupBtn} />
        <span
          style={{
            textAlign: "center",
            color: "white",
          }}
        >
          OR
        </span>
        <div className="flex -ml-[85px]">
          <button
            onClick={loginWithGoogle}
            type="button"
            style={{
              marginLeft: "90px",
              width: "289px",
              paddingLeft: "76px",
              paddingBottom: "18px",
              paddingTop: "18px",
              fontSize: "15px",
              textAlign: "center",
            }}
            class=" text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-[#4285F4]/55 me-2 mb-2"
          >
            <svg
              class="w-4 h-4 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 19"
            >
              <path
                fill-rule="evenodd"
                d="M8.842 18.083a8.8 8.8 0 0 1-8.65-8.948 8.841 8.841 0 0 1 8.8-8.652h.153a8.464 8.464 0 0 1 5.7 2.257l-2.193 2.038A5.27 5.27 0 0 0 9.09 3.4a5.882 5.882 0 0 0-.2 11.76h.124a5.091 5.091 0 0 0 5.248-4.057L14.3 11H9V8h8.34c.066.543.095 1.09.088 1.636-.086 5.053-3.463 8.449-8.4 8.449l-.186-.002Z"
                clip-rule="evenodd"
              />
            </svg>
            Sign in with Google
          </button>

          <button
            style={{
              marginLeft: "90px",
              width: "289px",
              paddingLeft: "76px",
              paddingBottom: "18px",
              paddingTop: "18px",
              fontSize: "15px",
              textAlign: "center",
            }}
            type="button"
            class="text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 me-2 mb-2"
          >
            <svg
              class="w-4 h-4 me-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M10 .333A9.911 9.911 0 0 0 6.866 19.65c.5.092.678-.215.678-.477 0-.237-.01-1.017-.014-1.845-2.757.6-3.338-1.169-3.338-1.169a2.627 2.627 0 0 0-1.1-1.451c-.9-.615.07-.6.07-.6a2.084 2.084 0 0 1 1.518 1.021 2.11 2.11 0 0 0 2.884.823c.044-.503.268-.973.63-1.325-2.2-.25-4.516-1.1-4.516-4.9A3.832 3.832 0 0 1 4.7 7.068a3.56 3.56 0 0 1 .095-2.623s.832-.266 2.726 1.016a9.409 9.409 0 0 1 4.962 0c1.89-1.282 2.717-1.016 2.717-1.016.366.83.402 1.768.1 2.623a3.827 3.827 0 0 1 1.02 2.659c0 3.807-2.319 4.644-4.525 4.889a2.366 2.366 0 0 1 .673 1.834c0 1.326-.012 2.394-.012 2.72 0 .263.18.572.681.475A9.911 9.911 0 0 0 10 .333Z"
                clip-rule="evenodd"
              />
            </svg>
            Sign in with Github
          </button>
        </div>
        <br />

        {warning && (
          <div role="alert" className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 shrink-0 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{warning}</span>
          </div>
        )}
      </form>
    </div>
  );
};

export default Signup;
