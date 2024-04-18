import React, { useEffect, useRef, useState } from 'react';
import { Button, Checkbox, Form, Image, Input } from 'antd';
import { get } from 'lodash';
import { ConnectProps, Dispatch, Loading, connect, history, useIntl } from 'umi';
import { AUTO_CREATE_CONFIG_DEF, DEFAULT_DOMAIN, DEVELOP_USER_CONFIG, LOGIN_CONFIG, NOTIFICATION_CONFIG_DEF, REQUEST_CODE, SESSION_STORAGE_KEY, UPLOAD_CALL_CONFIG_DEF } from '@/constant';
import { checkServerAddress, setToken } from '@/utils/utils';
import { Footer } from '@/components';
import ServerIcon from '@/asset/login/service-line.svg'
import DownIcon from '@/asset/login/down.svg'
import styles from './index.less';


interface LoginProps extends ConnectProps {
    getVersionList: () => Promise<any>
    saveUserConfig: (obj: LooseObject) => void
    getUser: () => Promise<any>
    login: () => void
    getTokenByCodeRequest: (obj: any) => Promise<any>
    loginLoading: boolean | undefined
}

/**
 * 登录页
 *
 * 需要用户输入：username、password、securityCode
 * @param getToken 获取token接口
 * @param getVersionList 获取salesforce版本信息
 * @param getUser 获取当前用户信息
 * @param save save
 * @param saveUserConfig 保存用户配置至global state与wave
 * @param loginLoading 加载状态
 * @constructor
 */
const IndexPage: React.FC<LoginProps> = ({
    login,
    getVersionList,
    saveUserConfig,
    getUser,
    getTokenByCodeRequest,
    loginLoading = false,
}) => {
    const [form] = Form.useForm();
    const userConfig = useRef<LooseObject>({});
    const [errorMessage, setErrorMessage] = useState('');
    const [domains, setDomains] = useState<string[]>([]);
    const [remember, setRemember] = useState(true);
    const [domainShow, setDomainShow] = useState(false);

    const { formatMessage } = useIntl();

    const onfocus = () => {
        setErrorMessage('');
    }

    /**
     * 自动登录状态更改
     * @param e
     */
    const onCheckChange = (e: { target: { checked: boolean | ((prevState: boolean) => boolean); }; }) => {
        setRemember(e.target.checked);
    };

    const closeList = () => {
        setDomainShow(false);
    };

    const setDomain = (domain: string) => {
        form.setFieldsValue({ domain });
        setDomainShow(false)
    };

    const showDomainList = (event: any) => {
        setDomainShow(true);
        event.stopPropagation();
    };

    /**
     * 登录成功，页面跳转
     * 默认跳转home页
     */
    const loginSuccess = (values: LooseObject) => {
        console.log('login', loginSuccess);
        const userConfig = {
            tokenInfo: {
                ...values.tokenInfo
            },
            domain: values.domain,
            autoLogin: values.autoLogin ?? true,
            uploadCall: values.uploadCall ?? true,
            notification: values.notification ?? true,
            autoCreate: values.autoCreate ?? false,
            autoCreateConfig: values.autoCreateConfig ?? AUTO_CREATE_CONFIG_DEF,
            uploadCallConfig: values.uploadCallConfig ?? UPLOAD_CALL_CONFIG_DEF,
            notificationConfig: values.notificationConfig ?? NOTIFICATION_CONFIG_DEF,
        }
        saveUserConfig(userConfig)
        history.replace({ pathname: '/home' });
    }

    /**
     * 获取用户信息
     */
    const getUserInfo = (values: LooseObject) => {
        getUser().then(res => {
            if (res?.error) {
                setErrorMessage(res?.error);
            }
            res?.Id && loginSuccess(values);
        })
    }

    /**
     * login
     * 获取token
     * 保存用户配置
     * 获取用户信息
     * @param values 用户信息
     */
    const toLogin = (values: LooseObject) => {
        console.log('login', values);
        const domain = checkServerAddress(values.domain);
        sessionStorage.setItem(SESSION_STORAGE_KEY.domain, domain)
        sessionStorage.setItem(SESSION_STORAGE_KEY.rememberMe, remember ? 'true' : 'false')
        login();
    }

    const getTokenByCode = (tokenInfo: LooseObject) => {
        const params = {
            code: tokenInfo.code,
            client_id: DEVELOP_USER_CONFIG.client_id,
            client_secret: DEVELOP_USER_CONFIG.client_secret,
            redirect_uri: LOGIN_CONFIG.redirect_uri,
            grant_type: 'authorization_code',
        }
        return getTokenByCodeRequest(params).then((res: LooseObject) => {
            console.log('token', res);
            if (res?.code === REQUEST_CODE.connectError) {
                setErrorMessage('error.network');
                return;
            }
            if (res?.error === 'invalid_grant') {
                setErrorMessage("error.userInfo");
                return;
            }
            if (!res || res?.status || res?.error) {
                setErrorMessage('error.userInfo');
                return;
            }
            if (res.access_token) {
                sessionStorage.setItem(SESSION_STORAGE_KEY.tokenInfo, JSON.stringify(res))
            }
        })
    }

    const getCode = () => {
        const tokenInfo = setToken();
        console.log('token', tokenInfo);
        if (tokenInfo.code) {
            getTokenByCode(tokenInfo).then(() => {
                getUserConfig(true)
            })
            return
        }
        if (get(tokenInfo, 'error')) {
            setErrorMessage('error.message');
            return;
        }
        getUserConfig();
    };

    const getUserConfig = (isLogin?: boolean) => {
        // @ts-ignore
        pluginSDK.userConfig.getUserConfig(function ({ errorCode, data }) {
            console.log(errorCode, data);
            if (errorCode === 0 && data) {
                const userInfo = JSON.parse(data);
                console.log(userInfo);
                userConfig.current = userInfo;

                const sessionDomain = sessionStorage.getItem(SESSION_STORAGE_KEY.domain);
                let domain = userInfo.domain || [DEFAULT_DOMAIN];
                if (typeof domain === 'string') {
                    domain = [domain];
                }
                if (sessionDomain) {
                    domain.unshift(sessionDomain);
                    domain = [...new Set(domain)];
                }
                else {
                    sessionStorage.setItem(SESSION_STORAGE_KEY.domain, domain[0]);
                }
                setDomains(domain);

                const loginParams: any = {
                    domain: domain[0],
                };
                form.setFieldsValue(loginParams);

                const rememberMe = sessionStorage.getItem(SESSION_STORAGE_KEY.rememberMe);
                const autoLogin = rememberMe !== 'false';
                setRemember(rememberMe !== 'false')

                // 已登录的与预装配置进行对比
                let sameConfig = true;

                // 有预装配置 走预装配置
                const preParamObjectStr = sessionStorage.getItem('preParamObject');
                if (preParamObjectStr) {
                    const preParamObject = JSON.parse(sessionStorage.getItem('preParamObject') || '');
                    if (preParamObject) {
                        const formParams: any = {};
                        Object.keys(preParamObject).forEach((item) => {
                            Object.keys(userInfo.tokenInfo).forEach((element) => {
                                if (item.toLowerCase() === element.toLowerCase()) {
                                    formParams[element] = preParamObject[item];
                                    if (!sameConfig) {
                                        return;
                                    }
                                    sameConfig = preParamObject[item] === userInfo.tokenInfo[element];
                                }
                            });
                        });
                        form.setFieldsValue({ ...formParams });
                    }
                }

                const sessionTokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');

                const tokenInfo = sessionTokenInfo.access_token ? sessionTokenInfo : userInfo.tokenInfo;
                sessionStorage.setItem(SESSION_STORAGE_KEY.tokenInfo, JSON.stringify(tokenInfo));
                if (isLogin || (sameConfig && userInfo.autoLogin)) {
                    const params = {
                        ...userInfo,
                        tokenInfo,
                        domain,
                        autoLogin,
                    }
                    getUserInfo(params)
                    return;
                }
            }
            else {
                // 有预装配置 走预装配置
                const preParamObjectStr = sessionStorage.getItem('preParamObject');

                let domain = [DEFAULT_DOMAIN]
                const sessionDomain = sessionStorage.getItem(SESSION_STORAGE_KEY.domain) || '';
                if (sessionDomain) {
                    domain.unshift(sessionDomain);
                    domain = [...new Set(domain)];
                }
                if (preParamObjectStr) {
                    const preParamObject = JSON.parse(preParamObjectStr);
                    const userInfo: any = { domain: '' }
                    if (preParamObject) {
                        Object.keys(preParamObject).forEach(item => {
                            Object.keys(userInfo).forEach(element => {
                                if (item.toLowerCase() === element.toLowerCase()) {
                                    userInfo[element] = preParamObject[item]
                                    if (element.toLowerCase() === 'domain') {
                                        domain.unshift(preParamObject[item])
                                    }
                                }
                            })
                        })
                        form.setFieldsValue(userInfo)
                    }
                }
                const tokenInfo = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY.tokenInfo) || '{}');
                setDomains(domain);

                const rememberMe = sessionStorage.getItem(SESSION_STORAGE_KEY.rememberMe);
                const autoLogin = rememberMe !== 'false';
                setRemember(autoLogin);
                if (isLogin) {
                    getUserInfo({ tokenInfo, domain, autoLogin });
                }
            }
        })
    }

    /**
     * 1.获取已保存的用户配置，填充表单
     * 2.获取版本信息
     * 3.自动登录
     */
    useEffect(() => {
        getVersionList().then(() => {
            getCode();
        });
    }, []);

    return (<>
        {errorMessage && <div className={styles.errorDiv}>
            <div className={styles.errorMessage}>{formatMessage({ id: errorMessage })}</div>
        </div>}
        <div className={styles.homePage} onClick={closeList}>
            <Form
                className={styles.form}
                form={form}
                layout="vertical"
                onFinish={toLogin}
                onFocus={onfocus}
            >
                <div className={styles.formContent}>
                    <div className={styles.clientId}>
                        <Form.Item
                            name="domain"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input Server Address.',
                                },
                                {
                                    type: 'url',
                                    message: 'Please input correct Server Address.',
                                }
                            ]}
                        >
                            <Input placeholder={"Server Address"}
                                prefix={<Image src={ServerIcon} preview={false} />}
                                suffix={<Image
                                    src={DownIcon}
                                    className={styles.downIcon}
                                    preview={false}
                                    onClick={showDomainList}
                                />}
                            />
                        </Form.Item>
                        <div
                            className={styles.clientIdList}
                            hidden={!domainShow || domains.length <= 0}
                        >
                            <div className={styles.clientIdListContent}>
                                {domains.map((item: string) => (
                                    <div
                                        key={item}
                                        onClick={() => setDomain(item)}
                                        className={styles.clientIdItem}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    {/* <Form.Item
                        name="password"
                        rules={[{
                            required: true, message: formatMessage({ id: 'login.password.error' })
                        }]}
                    >
                        <Input.Password placeholder={formatMessage({ id: 'login.password' })}
                            prefix={<Image src={LockIcon} preview={false} />}
                            iconRender={visible => (visible ? <Image src={OpenIcon} preview={false} /> :
                                <Image src={CloseIcon} preview={false} />)}
                        />
                    </Form.Item>
                    <Form.Item
                        name="securityCode"
                    >
                        <Input.Password placeholder={formatMessage({ id: 'login.securityCode' })}
                            prefix={<Image src={CodeIcon} preview={false} />}
                            iconRender={visible => (visible ? <Image src={OpenIcon} preview={false} /> :
                                <Image src={CloseIcon} preview={false} />)}
                        />
                    </Form.Item> */}
                </div>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loginLoading}>
                        {formatMessage({ id: 'login.submit' })}
                    </Button>
                </Form.Item>
                <div className={styles.remember}>
                    <Checkbox checked={remember} onChange={onCheckChange}>
                        {formatMessage({ id: 'login.remember' })}
                    </Checkbox>
                </div>
            </Form >
        </div >
        <div className={styles.footer}>
            <div>
                <Footer url="https://documentation.grandstream.com/knowledge-base/wave-crm-add-ins/#overview"
                    message={formatMessage({ id: 'login.user.guide' })} style={{ textAlign: "right" }} />｜
                <Footer url='https://help.salesforce.com/s/articleView?id=000326486&type=1'
                    message={formatMessage({ id: 'login.learn.package' })} style={{ textAlign: "left" }} />
            </div>
        </div>
    </>);
};

export default connect(
    ({ loading }: { loading: Loading }) => ({
        loginLoading: loading.effects['login/getVersionList']
            || loading.effects['login/getToken']
            || loading.effects['global/getUser']
            || loading.effects['global/saveUserConfig']
            || loading.effects['login/getTokenByCode']
            || loading.effects['login/login'],
    }),
    (dispatch: Dispatch) => ({
        getVersionList: () => dispatch({
            type: 'global/getVersionList',
        }),
        getToken: (payload: LooseObject) => dispatch({
            type: 'login/getToken', payload,
        }),
        login: () => dispatch({
            type: 'login/login',
        }),
        getUser: () => dispatch({
            type: 'global/getUser',
        }),
        saveUserConfig: (payload: LooseObject) => dispatch({
            type: 'global/saveUserConfig', payload,
        }),
        getTokenByCodeRequest: (payload: LooseObject) => dispatch({
            type: 'login/getTokenByCode', payload,
        })
    })
)(IndexPage);
