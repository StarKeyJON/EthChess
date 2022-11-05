import { Modal } from "antd";
import React from "react";

export const NotifyMatch = ({ showNotifyMatch, setShowNotifyMatch, matchId }) => {
    return (
        <>
        <Modal 
            title="Match started!"
            visible={showNotifyMatch}
            onCancel={() => setShowNotifyMatch(false)}
            onOk={() => window.location.replace(`/match/${matchId}`)}
        >
            </Modal></>
    )
}

export const NotifyDeathMatch = ({ showNotifyDeathMatch, setShowNotifyDeathMatch, matchId }) => {
    return (
        <>
        <Modal 
            title="DeathMatch started!"
            visible={showNotifyDeathMatch}
            onCancel={() => setShowNotifyDeathMatch(false)}
            onOk={() => window.location.replace(`/deathmatch/${matchId}`)}
        >
            </Modal></>
    )
}
