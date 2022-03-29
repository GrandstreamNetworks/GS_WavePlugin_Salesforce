import { DEVELOP_USER_CONFIG } from '../constant';
import request from '../utils/request';

/**
 * 获取版本信息
 * @returns
 */
export function getVersionList() {
    return request(`${DEVELOP_USER_CONFIG.host}/services/data`);
}

/**
 * 获取联系人列表
 * @param params
 * @returns
 */
export function getUser(params) {
    const tokenInfo = JSON.parse(sessionStorage.getItem('tokenInfo')) || {};
    const version_uri = sessionStorage.getItem('version_uri');
    return request(`${tokenInfo.instance_url}${version_uri}/sobjects/User${params}`);
}
