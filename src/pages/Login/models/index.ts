import { SESSION_STORAGE_KEY, DEVELOP_USER_CONFIG } from '@/constant';
import { getToken } from '../services';
import { Effect, Reducer } from "umi";

export interface LoginModelState {
    versionList: string[],
    tokenData: LooseObject | null | undefined,
}

export interface LoginModelType {
    namespace: string
    state: LoginModelState
    effects: {
        getToken: Effect
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
        * getToken({ payload }, { call, put }) {
            const version_uri = sessionStorage.getItem(SESSION_STORAGE_KEY.version_uri);
            if (!version_uri) {
                const getVersion = yield put({
                    type: 'global/getVersionList'
                })
                yield call(() => getVersion);
            }
            const params = {
                ...DEVELOP_USER_CONFIG,
                username: payload.username,
                password: payload.securityCode ? payload.password + payload.securityCode : payload.password,
            };
            const res = yield call(getToken, params);
            sessionStorage.setItem(SESSION_STORAGE_KEY.tokenInfo, JSON.stringify(res))
            yield put({
                type: 'global/save', payload: {
                    connectState: res?.code || "SUCCESS",
                }
            })
            return res;
        },
    },
    
    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },
};

export default LoginModel;
