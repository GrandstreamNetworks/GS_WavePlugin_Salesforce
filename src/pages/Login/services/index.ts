import { stringify } from 'qs';
import request from '@/utils/request';
import { SESSION_STORAGE_KEY } from '@/constant';

/**
 * 授权
 * @param params {{grant_type, client_id, client_secret, username, password}}
 * @returns
 */
export function getToken(params: LooseObject) {
    const domain = sessionStorage.getItem(SESSION_STORAGE_KEY.domain)
    return request(`${domain}/services/oauth2/token`,
        {
            method: 'POST',
            body: stringify(params),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
        },
    );
}
