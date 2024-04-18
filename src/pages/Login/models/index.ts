import { DEVELOP_USER_CONFIG, LOGIN_CONFIG, SESSION_STORAGE_KEY } from '@/constant';
import { Effect, Reducer } from "umi";
import { getToken } from '../services';
import { stringify } from 'qs';

export interface LoginModelState {
    versionList: string[],
    tokenData: LooseObject | null | undefined,
}

export interface LoginModelType {
    namespace: string
    state: LoginModelState
    effects: {
        getToken: Effect
        login: Effect
        getTokenByCode: Effect
    }
    reducers: {
        save: Reducer<LoginModelState>
    }
}

const LoginModel: LoginModelType = {
    namespace: 'login',
    state: {
        versionList: [],
        tokenData: {},
    },

    effects: {
        * getToken(_, { call, put }): any {
            const version_uri = sessionStorage.getItem(SESSION_STORAGE_KEY.version_uri);
            if (!version_uri) {
                const getVersion = yield put({
                    type: 'global/getVersionList'
                })
                yield call(() => getVersion);
            }
            const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
            const params = {
                grant_type: 'refresh_token',
                client_id: DEVELOP_USER_CONFIG.client_id,
                client_secret: DEVELOP_USER_CONFIG.client_secret,
                refresh_token: tokenInfo?.refresh_token,
            }
            const res = yield call(getToken, params);
            sessionStorage.setItem(SESSION_STORAGE_KEY.tokenInfo, JSON.stringify(res))
            yield put({
                type: 'global/save', payload: {
                    connectState: res?.code || "SUCCESS",
                }
            })
            return res;
        },

        *getTokenByCode({ payload }, { call }): any {
            return yield call(getToken, payload);
        },

        *login() {
            console.log("login");
            const data = {
                interceptField: LOGIN_CONFIG.redirect_uri,
                hash: '#/login'
            }

            // 向Wave注册重定向监听
            // @ts-ignore
            yield pluginSDK.setPluginURLInterceptor(data);

            const params = LOGIN_CONFIG;
            const domain = sessionStorage.getItem(SESSION_STORAGE_KEY.domain) || '';
            window.location.replace(`${domain}/services/oauth2/authorize?${stringify(params)}`);
        },
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },
};

export default LoginModel;
