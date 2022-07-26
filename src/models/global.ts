import { get } from 'lodash';
import { Effect, Reducer, history } from 'umi';
import { REQUEST_CODE, SESSION_STORAGE_KEY } from '@/constant';
import { getUser, getVersionList } from '@/services/global';

export interface GlobalModelState {
    user: LooseObject
    userConfig: LooseObject
    connectState: string
    tokenInfo: LooseObject
    uploadCall: boolean
    showConfig: LooseObject
    callState: Map<string, boolean>
}

export interface GlobalModelType {
    namespace: string
    state: GlobalModelState
    effects: {
        getVersionList: Effect
        getUser: Effect
        uploadCallChange: Effect
        saveShowConfig: Effect
        saveUserConfig: Effect
        logout: Effect
    }
    reducers: {
        save: Reducer<GlobalModelState>
    }
}

const GlobalModel: GlobalModelType = {
    namespace: 'global',
    state: {
        user: {},
        userConfig: {},
        connectState: 'SUCCESS',
        tokenInfo: {},
        uploadCall: true,
        showConfig: {},
        callState: new Map(),
    },

    effects: {
        * getVersionList(_, { call, put }) {
            console.log("getVersionList")
            const res = yield call(getVersionList);
            console.log(res);
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'save', payload: { connectState, }
            })
            if (Array.isArray(res)) {
                const lastVersion = res?.pop();
                sessionStorage.setItem(SESSION_STORAGE_KEY.version_uri, get(lastVersion, 'url'));
                return lastVersion;
            }
            return null;
        },

        * getUser(_, { call, put }) {
            const version_uri = sessionStorage.getItem(SESSION_STORAGE_KEY.version_uri);
            if (!version_uri) {
                const getVersion = yield put({
                    type: 'getVersionList'
                })

                yield call(() => getVersion);
            }
            const res = yield call(getUser, '');
            if (res?.status === REQUEST_CODE.forbidden) {
                return {
                    error: 'error.no.permissions'
                }
            }
            const user = get(res, 'recentItems[0]') || {};
            yield put({
                type: 'save', payload: {
                    connectState: res?.code || 'SUCCESS',
                },
            })
            if (user?.Id) {
                const userInfo = yield call(getUser, '/' + user.Id);
                if (userInfo.error) {
                    return;
                }
                yield put({
                    type: 'save', payload: {
                        user: userInfo,
                    },
                })
                return userInfo;
            }
            return null;
        },

        * uploadCallChange({ payload }, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global);
            userConfig.uploadCall = payload;
            yield put({
                type: 'saveUserConfig',
                payload: userConfig,
            })
            yield put({
                type: 'save',
                payload: {
                    uploadCall: payload,
                }
            })
        },

        * saveShowConfig({ payload }, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global);
            console.log(userConfig);
            userConfig.showConfig = payload;
            yield put({
                type: 'saveUserConfig',
                payload: userConfig,
            })
            yield put({
                type: 'save',
                payload: {
                    showConfig: payload,
                }
            })
        },

        * saveUserConfig({ payload }, { put }) {
            console.log(payload);
            // @ts-ignore
            pluginSDK.userConfig.addUserConfig({ userConfig: JSON.stringify(payload) }, function ({ errorCode }) {
                console.log(errorCode);
            })
            yield put({
                type: 'save', payload: {
                    userConfig: payload
                },
            })
        },

        * logout(_, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global);
            userConfig.autoLogin = false;
            userConfig.tokenInfo.password = undefined;
            userConfig.tokenInfo.securityCode = undefined;
            yield put({
                type: 'saveUserConfig',
                payload: userConfig,
            })
            history.replace({ pathname: "login" });
        }
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },
};

export default GlobalModel;