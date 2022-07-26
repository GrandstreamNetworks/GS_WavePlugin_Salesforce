import { get } from 'lodash';
import { Effect, Reducer } from "umi";
import { REQUEST_CODE, SESSION_STORAGE_KEY } from '@/constant';
import { getFullInfo, getQueryList, putCallInfo } from '../services';

export interface HomeModelState {
    query: LooseObject,
}

export interface HomeModelType {
    namespace: string
    state: HomeModelState
    effects: {
        getQueryList: Effect
        putCallInfo: Effect
    }
    reducers: {
        save: Reducer<HomeModelState>
    }
}

const HomeModel: HomeModelType = {
    namespace: 'home',
    state: {
        query: {},
    },

    effects: {
        * getQueryList({ payload }, { call, put }) {
            const version_uri = sessionStorage.getItem(SESSION_STORAGE_KEY.version_uri);
            if (!version_uri) {
                const getVersion = yield put({
                    type: 'login/getVersionList'
                })

                yield call(() => getVersion);
            }
            const paramsContact = {
                q: `SELECT Id, Name FROM Contact WHERE Phone = '${payload.callNum}'
                or HomePhone = '${payload.callNum}'
                or MobilePhone = '${payload.callNum}'
                or OtherPhone = '${payload.callNum}'
                or AssistantPhone = '${payload.callNum}'
                `
            }
            let res = yield call(getQueryList, paramsContact);
            if (res?.status === REQUEST_CODE.noAuthority) {
                const getToken = yield put({
                    type: 'login/getToken', payload,
                })
                yield call(() => getToken);
                res = yield call(getQueryList, paramsContact);
            }
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save', payload: { connectState }
            })
            let result = get(res, ['records', 0]);
            if (result?.Id) {
                const url = get(result, ['attributes', 'url']);
                result = yield call(getFullInfo, url);
                return {
                    displayNotification: connectState === 'SUCCESS', ...result,
                };
            }
            const paramsAccount = {
                q: `SELECT Id, Name FROM Account WHERE Phone = '${payload.callNum}'`
            }
            res = yield call(getQueryList, paramsAccount);
            result = get(res, ['records', 0]);
            if (result?.Id) {
                const url = get(result, ['attributes', 'url']);
                result = yield call(getFullInfo, url);
                return {
                    displayNotification: connectState === 'SUCCESS', ...result,
                };
            }
            const paramsLead = {
                q: `SELECT Id, Name FROM Lead WHERE Phone = '${payload.callNum}'`
            }
            res = yield call(getQueryList, paramsLead);
            result = get(res, ['records', 0]);
            if (result?.Id) {
                const url = get(result, ['attributes', 'url']);
                result = yield call(getFullInfo, url);
            }
            return {
                displayNotification: connectState === 'SUCCESS', ...result,
            };
        },

        * putCallInfo({ payload }, { call, put }) {
            const { callInfo, userConfig } = payload;
            let res = yield call(putCallInfo, callInfo);
            if (res?.status === REQUEST_CODE.noAuthority) {
                const getToken = yield put({
                    type: 'login/getToken', payload: {
                        ...userConfig,
                    },
                })
                yield call(() => getToken);
                res = yield call(putCallInfo, callInfo);
            }
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save', payload: { connectState }
            })
            return res;
        }
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },
};

export default HomeModel;