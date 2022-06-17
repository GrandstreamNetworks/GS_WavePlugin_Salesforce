import React, { useEffect, useRef } from "react";
import { connect, history, useIntl } from "umi";
import { Button, Col, Row } from "antd";
import moment from "moment";
import { ConnectError, ConnectState, CRMFooter, SwitchBtn } from '@/components';
import { EVENT_KEY, SESSION_STORAGE_KEY, WAVE_CALL_TYPE } from "@/constant";
import { getNotificationBody } from "../../utils/utils";
import styles from "./index.less";

const HomePage = ({
    getQueryList,
    user,
    userConfig,
    putCallInfo,
    saveUserConfig,
}) => {
    const { formatMessage } = useIntl();

    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo));

    const callNumber = useRef(null);

    const logoutClick = () => {
        const config = JSON.parse(JSON.stringify(userConfig));
        config.autoLogin = false;
        config.password = undefined;
        config.securityCode = undefined;
        saveUserConfig(config);
        history.replace({ pathname: "login" });
    };

    const uploadCallInfo = (callNum, callStartTimeStamp, callEndTimeStamp, callDirection) => {
        if (!userConfig.uploadCall) {
            return;
        }
        callNum = callNum.replace(/\b(0+)/gi, "");
        getQueryList({ ...userConfig, callNum }).then(contactInfo => {
            if (!contactInfo?.Id) {
                return;
            }
            const duration = callEndTimeStamp - callStartTimeStamp;
            const duration_hours = moment.duration(duration).hours();
            const duration_minutes = moment.duration(duration).minutes();
            const duration_seconds = moment.duration(duration).seconds();
            const call_from = callDirection !== WAVE_CALL_TYPE.out ? `${contactInfo.Name} ${callNum}` : `${user.Name}`;
            const call_to = callDirection !== WAVE_CALL_TYPE.out ? `${user.Name}` : `${contactInfo.Name} ${callNum}`;
            const params = {
                WhoId: null,
                WhatId: null,
                Subject: `${contactInfo.Name} 's call`,
                Status: "Completed",
                OwnerId: user.Id,
                Description: `Start Date & Time: ${moment(callStartTimeStamp || undefined).format()}\n
                          End Date & Time: ${moment(callEndTimeStamp || undefined).format()}\n
                          Duration: ${duration_hours}h ${duration_minutes}m ${duration_seconds}s\n
                          Created ${callDirection} Call from ${call_from} to ${call_to}`,
                CallDurationInSeconds: moment.duration(duration).asSeconds(),
                CallType: callDirection,
                TaskSubtype: "Call"
            };
            // module不为Contact，关联ID的字段为WhoId
            contactInfo.attributes.type === "Contact" ? params.WhoId = contactInfo.Id : params.WhatId = contactInfo.Id;
            const payload = {
                callInfo: params, userConfig
            };
            putCallInfo(payload);
        });
    }

    const getUrl = contact => {
        return contact?.Id ? tokenInfo?.instance_url + "/" + contact.Id : tokenInfo?.instance_url + "/lightning/o/Contact/new";
    };

    const initCallInfo = (callNum) => {
        callNum = callNum.replace(/\b(0+)/gi, "");
        getQueryList({ ...userConfig, callNum }).then(contact => {
            if (!contact?.displayNotification) {
                return;
            }
            const url = getUrl(contact);
            const name = contact?.Name;
            const department = contact?.Department;
            const title = contact?.Title;
            // 职位展示：部门｜职位
            const job = department && title ? department + '|' + title : department || title;
            const pluginPath = sessionStorage.getItem("pluginPath");
            const body = {
                logo: `<div style="margin-bottom: 12px"><img src="${pluginPath}/salesforce.svg" alt=""/> Salesforce CRM</div>`,
                info: name ? `<div style="font-weight: bold; text-overflow: ellipsis; white-space:nowrap; overflow: hidden">${name}</div>` : null,
                PhoneNumber: `<div style="font-weight: bold; text-overflow: ellipsis; white-space:nowrap; overflow: hidden">${callNum}</div>`,
                title: job ? `<div style="font-weight: bold; text-overflow: ellipsis; white-space:nowrap; overflow: hidden">${job}</div>` : null,
                action: `<div style="margin-top: 10px;display: flex;justify-content: flex-end;"><button style="background: none; border: none;">
                             <a href="${url}" target="_blank" style="color: #62B0FF">
                                 ${contact?.Id ? formatMessage({ id: "home.detail" }) : formatMessage({ id: "home.edit" })}
                             </a>
                         </button></div>`
            };

            console.log("displayNotification");
            pluginSDK.displayNotification({
                notificationBody: getNotificationBody(body),
            })
        });
    }

    useEffect(() => {

        /**
         * 监听收到语音/视频来电
         * 回调函数参数：callType,callNum
         **/
        pluginSDK.eventEmitter.on(EVENT_KEY.recvP2PIncomingCall, function ({ callType, callNum }) {
            console.log("onRecvP2PIncomingCall", callType, callNum);
            callNumber.current = callNum;
            initCallInfo(callNum);
        });

        /**
         * 监听wave发起语音/视频
         * 回调函数参数：callType,callNum
         */
        pluginSDK.eventEmitter.on(EVENT_KEY.initP2PCall, function ({ callType, callNum }) {
            console.log("onHangupP2PCall", callType, callNum);
            callNumber.current = callNum;
            initCallInfo(callNum);
        });

        /**
         * 监听拒绝语音/视频
         * 回调函数参数：callType,callNum
         */
        pluginSDK.eventEmitter.on(EVENT_KEY.rejectP2PCall, function ({ callType, callNum }) {
            console.log("onRejectP2PCall", callType, callNum);
            uploadCallInfo(callNum, 0, 0, WAVE_CALL_TYPE.in);
            if (callNumber.current === callNum) {
                setTimeout(() => {
                    // @ts-ignore
                    pluginSDK.hideNotification();
                }, 1000)
            }
        });

        /**
         * 监听挂断语音/视频
         * 回调函数参数：callType,callNum
         */
        pluginSDK.eventEmitter.on(EVENT_KEY.hangupP2PCall, function (data) {
            console.log("onHangupP2PCall", data);
            let { callNum, callStartTimeStamp, callEndTimeStamp, callDirection } = data;
            callDirection = callDirection === "in" ? WAVE_CALL_TYPE.in : WAVE_CALL_TYPE.out;
            uploadCallInfo(callNum, callStartTimeStamp ?? 0, callEndTimeStamp ?? 0, callDirection);
            if (callNumber.current === callNum) {
                setTimeout(() => {
                    // @ts-ignore
                    pluginSDK.hideNotification();
                }, 1000)
            }
        });

        pluginSDK.eventEmitter.on(EVENT_KEY.p2PCallCanceled, function ({ callType, callNum }) {
            console.log("p2PCallCanceled", callType, callNum);
            uploadCallInfo(callNum, 0, 0, WAVE_CALL_TYPE.in);
            if (callNumber.current === callNum) {
                setTimeout(() => {
                    // @ts-ignore
                    pluginSDK.hideNotification();
                }, 1000)
            }
        });

        return function cleanup() {

            pluginSDK.eventEmitter.off(EVENT_KEY.recvP2PIncomingCall);

            pluginSDK.eventEmitter.off(EVENT_KEY.initP2PCall);

            pluginSDK.eventEmitter.off(EVENT_KEY.rejectP2PCall);

            pluginSDK.eventEmitter.off(EVENT_KEY.hangupP2PCall);

            pluginSDK.eventEmitter.off(EVENT_KEY.p2PCallCanceled);
        };

    }, [userConfig]);

    return (
        <>
            <ConnectError />
            <div className={styles.homePage}>
                <ConnectState />
                <div className={styles.callConfig}>
                    <Row justify="space-between">
                        <Col span={19}>
                            <span className={styles.spanLabel}>{formatMessage({ id: "home.Synchronize" })}</span>
                        </Col>
                        <Col span={4}>
                            <SwitchBtn />
                        </Col>
                    </Row>
                </div>
                <Button onClick={logoutClick}>{formatMessage({ id: "home.logout" })}</Button>
            </div>
            <CRMFooter url={tokenInfo?.instance_url} message={formatMessage({ id: 'home.toCRM' })} />
        </>
    );
};

export default connect(({ global }) => ({
    userConfig: global.userConfig
}), (dispatch) => ({
    getQueryList: (payload) => dispatch({
        type: "home/getQueryList", payload
    }), putCallInfo: (payload) => dispatch({
        type: "home/putCallInfo", payload
    }), saveUserConfig: payload => dispatch({
        type: "global/saveUserConfig", payload
    })
}))(HomePage);
