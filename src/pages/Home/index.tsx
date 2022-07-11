import React, { useCallback } from "react";
import { connect, Dispatch, GlobalModelState, useIntl } from "umi";
import moment from "moment";
import { CallAction, ConfigBlock, ConnectError, ConnectState, CRMFooter } from '@/components';
import { WAVE_CALL_TYPE } from "@/constant";
import { getNotificationBody, getUrlByContact, getValueByConfig } from "@/utils/utils";
import styles from "./index.less";

interface HomePageProps {
    getQueryList: (obj: LooseObject) => Promise<any>
    putCallInfo: (obj: LooseObject) => Promise<any>
    user: LooseObject
    tokenInfo: LooseObject
    showConfig: LooseObject
    uploadCall: boolean
}

const HomePage: React.FC<HomePageProps> = ({ getQueryList, user, tokenInfo, putCallInfo, showConfig, uploadCall, }) => {
    const { formatMessage } = useIntl();

    const uploadCallInfo = useCallback((callNum: string, callStartTimeStamp: number, callEndTimeStamp: number, callDirection?: string) => {
        if (!uploadCall) {
            return;
        }
        callNum = callNum.replace(/\b(0+)/gi, "");
        getQueryList({ ...tokenInfo, callNum }).then(contactInfo => {
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
            contactInfo.attributes.type === "Account" ? params.WhatId = contactInfo.Id : params.WhoId = contactInfo.Id;
            const payload = {
                callInfo: params, userConfig: tokenInfo
            };
            putCallInfo(payload).then(r => console.log(r));
        });
    }, [tokenInfo, user]);

    const initCallInfo = useCallback((callNum) => {
        callNum = callNum.replace(/\b(0+)/gi, "");
        getQueryList({ ...tokenInfo, callNum }).then(contact => {
            if (!contact?.displayNotification) {
                return;
            }
            const url = getUrlByContact(contact);
            const pluginPath = sessionStorage.getItem("pluginPath");

            // body对象，
            const body = {
                logo: `<div style="margin-bottom: 12px"><img src="${pluginPath}/salesforce.svg" alt=""/> Salesforce CRM</div>`,
            }

            // 根据自定义信息，添加body属性
            if (contact?.Id) {
                // 将showConfig重复的删除
                const configList = [...new Set(Object.values(showConfig))]
                console.log(configList);
                for (const key in configList) {
                    console.log(configList[key])
                    if (!configList[key]) {
                        continue;
                    }

                    // 取出联系人的信息用于展示
                    const configValue = getValueByConfig(contact, configList[key]);
                    console.log(configValue);
                    if (configList[key] === 'Phone') {
                        Object.defineProperty(body, `config_${key}`,
                            {
                                value: `<div style="font-weight: bold">${callNum}</div>`,
                                writable: true,
                                enumerable: true,
                                configurable: true
                            });
                    }
                    else if (configValue) {
                        Object.defineProperty(body, `config_${key}`,
                            {
                                value: `<div style="font-weight: bold; display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 5;overflow: hidden;">${configValue}</div>`,
                                writable: true,
                                enumerable: true,
                                configurable: true
                            });
                    }
                }
            }
            else {
                Object.defineProperty(body, 'phone', {
                    value: `<div style="font-weight: bold;">${callNum}</div>`,
                    writable: true,
                    enumerable: true,
                    configurable: true
                });
            }

            Object.defineProperty(body, 'action', {
                value: `<div style="margin-top: 10px;display: flex;justify-content: flex-end;"><button style="background: none; border: none;">
                                 <a href=${url} target="_blank" style="color: #62B0FF">
                                     ${contact?.Id ? formatMessage({ id: 'home.detail' }) : formatMessage({ id: 'home.edit' })}
                                 </a>
                             </button></div>`,
                writable: true,
                enumerable: true,
                configurable: true
            });

            console.log("displayNotification");
            // @ts-ignore
            pluginSDK.displayNotification({
                notificationBody: getNotificationBody(body),
            })
        });
    }, [tokenInfo, showConfig])

    return (
        <>
            <CallAction uploadCallInfo={uploadCallInfo} initCallInfo={initCallInfo} />
            <ConnectError />
            <div className={styles.homePage}>
                <ConnectState />
                <ConfigBlock />
            </div>
            <CRMFooter url={getUrlByContact({}, true)} message={formatMessage({ id: 'home.toCRM' })} />
        </>
    );
};

export default connect(({ global }: {global: GlobalModelState}) => ({
    user: global.user,
    uploadCall: global.uploadCall,
    tokenInfo: global.tokenInfo,
    showConfig: global.showConfig
}), (dispatch: Dispatch) => ({
    getQueryList: (payload: LooseObject) => dispatch({
        type: "home/getQueryList",
        payload
    }),
    putCallInfo: (payload: LooseObject) => dispatch({
        type: "home/putCallInfo",
        payload
    }),
}))(HomePage);
