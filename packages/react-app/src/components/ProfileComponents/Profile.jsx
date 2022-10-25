import { Button, Card, Image, Input, notification, Space } from "antd";
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
  const [passphrase, setPass] = useState("");

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
                    <Input.Group compact>
                      <Input.Password
                        placeholder="input password"
                        onChange={e => {
                          e.preventDefault();
                          setPass({ pass: e.target.value });
                        }}
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
                  </Space>
                </div>
              </Space>
              <Space>
                <div style={{ marginBottom: 60 }}>
                  <h2>
                    ♙ <br />
                    Sign-Up
                  </h2>
                  <Space>
                    <Input.Group compact>
                      <Input.Password
                        placeholder="input password"
                        iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        onChange={e => {
                          e.preventDefault();
                          setPass({ pass: e.target.value });
                        }}
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
                    </Button>
                  </Space>
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
