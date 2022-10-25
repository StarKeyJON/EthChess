import { Card } from "antd";
import React from "react";

const ProfilePage = ({ gun, address }) => {
  return (
    <>
      <div>
        <h1>Profile</h1>
        <Card>
            <h3>Profile of {address}!</h3>
        </Card>
      </div>
    </>
  );
};

export default ProfilePage;
