import { get } from 'lodash';
import { REQUEST_CODE, SESSION_STORAGE_KEY } from '@/constant';
import { getUser, getVersionList } from '@/services/global';

export default {
    namespace: 'global', state: {
        user: {}, userConfig: {}, connectState: 'SUCCESS',
    },
    
    effects: {
        * getVersionList(_, { call, put }) {
            const res = yield call(getVersionList);
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'save', payload: { connectState, }
            })
            const lastVersion = res.pop();
            sessionStorage.setItem(SESSION_STORAGE_KEY.version_uri, get(lastVersion, 'url'));
            return lastVersion;
        },
        
        * getUser(_, { call, put }) {
            const version_uri = sessionStorage.getItem(SESSION_STORAGE_KEY.version_uri);
            if (!version_uri) {
                yield put.resolve({
                    type: 'getVersionList'
                })
            }
            const res = yield call(getUser, '');
            if (res?.status === REQUEST_CODE.forbidden) {
                return {
                    error: 'error.no.permissions'
                }
            }
            const user = get(res, 'recentItems[0]') || {};
            if (user?.Id) {
                const userInfo = yield call(getUser, '/' + user.Id);
                if (userInfo.error) {
                    return;
                }
                yield put({
                    type: 'save', payload: {
                        user: userInfo, connectState: res?.code || 'SUCCESS',
                    },
                })
                return userInfo;
            }
            return null;
        },
        
        * saveUserConfig({ payload }, { put }) {
            console.log(payload);
            pluginSDK.userConfig.addUserConfig({ userConfig: JSON.stringify(payload) }, function ({ errorCode }) {
                console.log(errorCode);
            })
            yield put({
                type: 'save', payload: {
                    userConfig: payload
                },
            })
        }
    },
    
    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },
};
