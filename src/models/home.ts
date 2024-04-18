import { REQUEST_CODE, SESSION_STORAGE_KEY } from '@/constant';
import { createAccount, createContact, getAccountById, getContactById, getFullInfo, getSearchList, putCallInfo } from '@/services/home';
import { get } from 'lodash';
import { Effect, Reducer } from "umi";

export interface HomeModelState {
    query: LooseObject,
}

export interface HomeModelType {
    namespace: string
    state: HomeModelState
    effects: {
        getQueryList: Effect
        createNewContact: Effect
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
        * getQueryList({ payload }, { call, put }): any {
            const version_uri = sessionStorage.getItem(SESSION_STORAGE_KEY.version_uri);
            if (!version_uri) {
                const getVersion = yield put({
                    type: 'login/getVersionList'
                })

                yield call(() => getVersion);
            }
            let res = yield call(getSearchList, payload.callNum);
            if (res?.status === REQUEST_CODE.noAuthority) {
                const getToken = yield put({
                    type: 'login/getToken', payload,
                })
                yield call(() => getToken);
                res = yield call(getSearchList, payload.callNum);
            }
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save', payload: { connectState }
            })
            let result = get(res, ['searchRecords', 0]) || {};
            if (result?.Id) {
                const url = get(result, ['attributes', 'url']);
                result = yield call(getFullInfo, url);
            }
            return {
                displayNotification: connectState === 'SUCCESS', ...result,
            };
        },

        * putCallInfo({ payload }, { call, put }): any {
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
        },

        * createNewContact({ payload }, { call, put }): any {
            const { contactInfo, attributesType } = payload;
            let res = null;
            switch (attributesType) {
                case 'Account':
                    res = yield call(createAccount, contactInfo);
                    if (res.id) {
                        res = yield call(getAccountById, res.id);
                    }
                    break
                default:
                    res = yield call(createContact, contactInfo);
                    if (res.id) {
                        res = yield call(getContactById, res.id);
                    }
                    break
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