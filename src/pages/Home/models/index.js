import { get } from 'lodash';
import { getQueryList, putCallInfo } from '../services';
import { REQUEST_CODE, SESSION_STORAGE_KEY } from '@/constant';

export default {
    namespace: 'home', state: {
        query: {},
    },
    
    effects: {
        getQueryList: function* ({ payload }, { call, put }) {
            const version_uri = sessionStorage.getItem(SESSION_STORAGE_KEY.version_uri);
            if (!version_uri) {
                yield put.resolve({
                    type: 'login/getVersionList'
                })
            }
            const paramsContact = {
                q: `SELECT Id, Name, Title, Department FROM Contact WHERE Phone = '${payload.callNum}'
                or HomePhone = '${payload.callNum}'
                or MobilePhone = '${payload.callNum}'
                or OtherPhone = '${payload.callNum}'
                or AssistantPhone = '${payload.callNum}'
                `
            }
            let res = yield call(getQueryList, paramsContact);
            if (res?.status === REQUEST_CODE.noAuthority) {
                yield put.resolve({
                    type: 'login/getToken', payload,
                })
                res = yield call(getQueryList, paramsContact);
            }
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save', payload: { connectState }
            })
            let result = get(res, ['records', [0]]);
            if (result?.Id) {
                return {
                    displayNotification: true, ...result,
                };
            }
            const paramsAccount = {
                q: `SELECT Id, Name FROM Account WHERE Phone = '${payload.callNum}'`
            }
            res = yield call(getQueryList, paramsAccount);
            result = get(res, ['records', [0]]);
            return {
                displayNotification: true, ...result,
            };
        },
        
        * putCallInfo({ payload }, { call, put }) {
            const { callInfo, userConfig } = payload;
            let res = yield call(putCallInfo, callInfo);
            if (res?.status === REQUEST_CODE.noAuthority) {
                yield put.resolve({
                    type: 'login/getToken', payload: {
                        ...userConfig,
                    },
                })
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
