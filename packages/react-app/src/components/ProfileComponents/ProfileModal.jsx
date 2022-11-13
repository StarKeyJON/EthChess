import React, { useState } from "react";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { Button, Card, Divider, Image, Input, notification, Space } from "antd";
import ethLogo from "../../assets/ethereumLogo.png";

const ProfileModal = ({ address, loginProfile, createProfile }) => {
  const HandleLogin = () => {
    const [passphrase, setPass] = useState();

    return (
      <>
        <Input.Group compact>
          <Input.Password
            placeholder="input password"
            onChange={e => setPass(e.target.value)}
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
          />
        </Input.Group>
        <br />
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
    );
  };

  const HandleNewPassword = () => {
    const [passphrase, setPass] = useState();
    return (
      <>
        <Input.Group compact>
          <Input.Password
            placeholder="input password"
            iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            onChange={e => setPass(e.target.value)}
          />
        </Input.Group>
        <br />
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
      </>
    );
  };

  const LogInCard = () => {
    return (
      <div
        style={{ marginTop: 20, marginBottom: 80, alignContent: "center", justifyContent: "center", display: "flex" }}
      >
        <Card style={{ width: "400px" }}>
          {address ? (
            <>
              <Space>
                <div style={{ marginTop: 30, marginBottom: 30 }}>
                  <h2>
                    ♔ <br />
                    Log-In
                  </h2>
                  <HandleLogin />
                </div>
              </Space>
              <Divider />
              <Space>
                <div style={{ marginTop: 30, marginBottom: 30 }}>
                  <h2>
                    ♙ <br />
                    Sign-Up
                  </h2>
                  <HandleNewPassword />
                  <div style={{ marginTop: 30 }}>
                    <h2>Only a secure password is needed!</h2>
                    <p>Your connected wallet address is used as an alias.</p>
                    <p>
                      This ensures that only you can access your chess profile when your wallet is connected with the
                      correct password entered.
                    </p>
                    <h3>* Accounts cannot be recovered if you forget your password! *</h3>
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
  return <LogInCard />;
};

export default ProfileModal;
