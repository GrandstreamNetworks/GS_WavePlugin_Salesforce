import { REQUEST_CODE, SESSION_STORAGE_KEY } from '@/constant';
import { getUser, getVersionList } from '@/services/global';
import { get } from 'lodash';
import { Effect, Reducer } from 'umi';

export interface GlobalModelState {
    user: LooseObject
    userConfig: LooseObject
    connectState: string
}

export interface GlobalModelType {
    namespace: string
    state: GlobalModelState
    effects: {
        getVersionList: Effect
        getUser: Effect
        userConfigChange: Effect
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
    },

    effects: {
        * getVersionList(_, { call, put }): any {
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

        * getUser(_, { call, put }): any {
            const version_uri = sessionStorage.getItem(SESSION_STORAGE_KEY.version_uri);
            if (!version_uri) {
                const getVersion = yield put({
                    type: 'getVersionList'
                })

                yield call(() => getVersion);
            }
            let res = yield call(getUser, '');
            if (res?.status === REQUEST_CODE.noAuthority) {
                const getToken = yield put({
                    type: 'login/getToken',
                })
                yield call(() => getToken);
                res = yield call(getUser, '');
            }
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

        * userConfigChange({ payload }, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global);
            const newConfig = {
                ...userConfig,
                ...payload,
            }
            yield put({
                type: 'saveUserConfig',
                payload: newConfig,
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

        *logout(_, { put, select }): any {
            const { userConfig } = yield select((state: any) => state.global);
            userConfig.autoLogin = false;
            yield put({
                type: 'saveUserConfig',
                payload: userConfig
            });
            // @ts-ignore
            yield pluginSDK.clearCookie({ origin: 'https://login.salesforce.com' }, function () { });
            var url = new URL(window.location.href);
            url.search = '';
            url.hash = '#/login';
            window.location.href = url.toString()
        }
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },
};

export default GlobalModel;