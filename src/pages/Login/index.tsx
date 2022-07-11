import React, { useEffect, useState } from 'react';
import { connect, Dispatch, history, Loading, useIntl, ConnectProps } from 'umi';
import { Button, Checkbox, Form, Image, Input } from 'antd';
import { REQUEST_CODE } from '@/constant';
import { Footer } from '@/components';
import UserIcon from '../../asset/login/account-line.svg';
import LockIcon from '../../asset/login/lock-line.svg';
import CodeIcon from '../../asset/login/code-line.svg';
import OpenIcon from '../../asset/login/password-open.svg';
import CloseIcon from '../../asset/login/password-close.svg';
import styles from './index.less';

interface LoginProps extends ConnectProps {
    getToken: (obj: LooseObject) => Promise<any>
    getVersionList: () => Promise<any>
    saveUserConfig: (obj: LooseObject) => void
    save: (obj: LooseObject) => void
    getUser: () => Promise<any>
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
    getToken,
    getVersionList,
    saveUserConfig,
    save,
    getUser,
    loginLoading = false,
}) => {
    const [form] = Form.useForm();
    const [errorMessage, setErrorMessage] = useState('');
    const [remember, setRemember] = useState(true);
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

    /**
     * 登录成功，页面跳转
     * 默认跳转home页
     */
    const loginSuccess = () => {
        history.replace({ pathname: '/home' });
    }

    /**
     * 获取用户信息
     */
    const getUserInfo = () => {
        getUser().then(res => {
            if (res?.error) {
                setErrorMessage(res?.error);
            }
            res?.Id && loginSuccess();
        })
    }

    /**
     * login
     * 获取token
     * 保存用户配置
     * 获取用户信息
     * @param values 用户信息
     */
    const login = (values: LooseObject) => {
        const { username, password, securityCode = '' } = values;
        const params = {
            username, password, securityCode,
        };
        getToken(params).then(tokenInfo => {
            if (tokenInfo?.code === REQUEST_CODE.connectError) {
                setErrorMessage('error.network');
                return;
            }
            if (tokenInfo?.error === 'invalid_grant') {
                setErrorMessage("error.userInfo");
                return;
            }
            if (!tokenInfo || tokenInfo?.status || tokenInfo?.error) {
                setErrorMessage('error.userInfo');
                return;
            }
            const userConfig = {
                tokenInfo: {
                    username,
                    password: remember ? values.password : undefined,
                    securityCode: remember ? values.securityCode : undefined,
                },
                autoLogin: remember,
                uploadCall: values.uploadCall ?? true,
                showConfig: values.showConfig ?? {
                    first: 'Name',
                    second: 'Phone',
                    third: 'None',
                    forth: 'None',
                    fifth: 'None',
                },
            }
            save(userConfig);
            saveUserConfig(userConfig)
            getUserInfo();
        });
    };

    /**
     * 1.获取已保存的用户配置，填充表单
     * 2.获取版本信息
     * 3.自动登录
     */
    useEffect(() => {
        getVersionList().then(() => {
            // @ts-ignore
            pluginSDK.userConfig.getUserConfig(function ({ errorCode, data }) {
                console.log(errorCode, data);
                if (errorCode === 0 && data) {
                    const userConfig = JSON.parse(data);
                    console.log(userConfig);
                    form.setFieldsValue(userConfig.tokenInfo);
                    if (userConfig.autoLogin) {
                        login({ ...userConfig.tokenInfo, ...userConfig });
                    }
                }
            })
        });
    }, []);

    return (<>
        {errorMessage && <div className={styles.errorDiv}>
            <div className={styles.errorMessage}>{formatMessage({ id: errorMessage })}</div>
        </div>}
        <div className={styles.homePage}>
            <Form
                className={styles.form}
                form={form}
                layout="vertical"
                onFinish={login}
                onFocus={onfocus}
            >
                <div className={styles.formContent}>
                    <Form.Item
                        name="username"
                        rules={[{
                            required: true, message: formatMessage({ id: 'login.name.error' })
                        }]}
                    >
                        <Input placeholder={formatMessage({ id: 'login.name' })}
                            prefix={<Image src={UserIcon} preview={false} />} />
                    </Form.Item>
                    <Form.Item
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
                    </Form.Item>
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
            </Form>
        </div>
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
        loginLoading: loading.effects['login/getVersionList'] || loading.effects['login/getToken'] || loading.effects['global/getUser'],
    }),
    (dispatch: Dispatch) => ({
        getVersionList: () => dispatch({
            type: 'global/getVersionList',
        }),
        getToken: (payload: LooseObject) => dispatch({
            type: 'login/getToken', payload,
        }),
        getUser: () => dispatch({
            type: 'global/getUser',
        }),
        saveUserConfig: (payload: LooseObject) => dispatch({
            type: 'global/saveUserConfig', payload,
        }),
        save: (payload: LooseObject) => dispatch({
            type: 'global/save',
            payload
        })
    })
)(IndexPage);
