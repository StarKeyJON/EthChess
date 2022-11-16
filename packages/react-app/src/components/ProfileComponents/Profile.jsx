import React from "react";
import ProfileInfo from "./ProfileInfo";
import ProfileModal from "./ProfileModal";

const Profile = ({ gun, address, gunUser, loggedIn, createProfile, loginProfile }) => {
  return (
    <>
      {!loggedIn ? (
        <ProfileModal address={address} loginProfile={loginProfile} createProfile={createProfile} />
      ) : (
        <ProfileInfo gun={gun} address={address} gunUser={gunUser} />
      )}
    </>
  );
};

export default Profile;
