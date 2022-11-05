import { Button, Card, Divider, Image, Input, notification, Space } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import React, { useState } from "react";
import ethLogo from "../../assets/ethereumLogo.png";
import ProfilePage from "./ProfilePage";

const Profile = ({
  gun,
  address,
  gunUser,
  setGunUser,
  startTime,
  loggedIn,
  loginProfile,
  createProfile,
  logoutProfile,
}) => {

  const HandleLogin = () => {
    const [passphrase, setPass] = useState();

    const handlePWChange = e => {
      // console.log(e.target.value);
      setPass(e.target.value);
    };
    return (
      <><Input.Group compact>
        <Input.Password
          placeholder="input password"
          onChange={e => setPass(e.target.value)}
          iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
        />
      </Input.Group>
        <Button
          onClick={() => {
            if (passphrase) {
              loginProfile(passphrase);
            } else {
              notification.open({ message: "Enter your secret passphrase!" });
            }
          }}
          type="primary"
        >
          Submit
        </Button>
      </>
    )
  }

  const HandleNewPassword = () => {
    const [passphrase, setPass] = useState();
    return (
      <><Input.Group compact>
        <Input.Password
          placeholder="input password"
          iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          onChange={e => setPass(e.target.value)}
        />
      </Input.Group>
        <Button
          onClick={() => {
            if (passphrase) {
              createProfile(passphrase);
            } else {
              notification.open({ message: "Create a passphrase!" });
            }
          }}
          type="primary"
        >
          Submit
        </Button></>
    )
  }

  const LogInCard = () => {
    return (
      <div
        style={{ marginTop: 80, marginBottom: 180, alignContent: "center", justifyContent: "center", display: "flex" }}
      >
        <Card style={{ width: "400px" }}>
          {address ? (
            <>
              <Space>
                <div style={{ marginTop: 60, marginBottom: 60 }}>
                  <h2>
                    ♔ <br />
                    Log-In
                  </h2>
                  <Space>
                    <HandleLogin />
                  </Space>
                </div>
              </Space>
              <Divider />
              <Space>
                <div style={{ marginTop: 60, marginBottom: 60 }}>
                  <h2>
                    ♙ <br />
                    Sign-Up
                  </h2>
                  <Space>
                    <HandleNewPassword />
                  </Space>
                  <div style={{ marginTop: 30 }}>
                    <h1>Only a secure password is needed!</h1>
                    <p>Your connected wallet address is used as an alias.</p>
                  </div>
                </div>
              </Space>
            </>
          ) : (
            <div>
              <Image preview={false} style={{ width: 60 }} src={ethLogo} />
              <h3>Please connect an ETH wallet!</h3>
              <p>* Connect button is located in the top right *</p>
            </div>
          )}
        </Card>
      </div>
    );
  };

  return <>{!loggedIn ? <LogInCard /> : <ProfilePage gun={gun} address={address} gunUser={gunUser} />}</>;
};

export default Profile;
