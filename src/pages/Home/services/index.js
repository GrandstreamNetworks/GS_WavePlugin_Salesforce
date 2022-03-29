import { stringify } from 'qs';
import { SESSION_STORAGE_KEY } from '../../../constant';
import request from '../../../utils/request';

/**
 * 获取联系人列表
 * @param params
 * @returns
 */
export function getQueryList(params) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo));
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/query?${stringify(params)}`);
}

export function getFullInfo(url) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo));
    return request(`${tokenInfo.instance_url}${url}`);
}

/**
 * 上报通话记录
 * @returns {*}
 * @param params
 */
export function putCallInfo(params) {
    const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo));
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/sobjects/Task`, {
        method: 'POST',
        body: JSON.stringify(params)
    })
}
