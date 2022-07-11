import React from 'react';
import { Button } from 'antd';
import { ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { connect, GlobalModelState, useIntl } from 'umi';
import { REQUEST_CODE } from '@/constant';
import styles from './index.less'

interface IndexProps {
    connectState: string
    save: (obj: LooseObject) => void
    getVersionList: () => void
}

const IndexPage: React.FC<IndexProps> = ({ connectState, save, getVersionList }) => {
    const { formatMessage } = useIntl();

    const reConnect = () => {
        save({
            connectState: REQUEST_CODE.reConnect
        });
        getVersionList();
    };

    return (
        <div className={styles.errorPage}>
            <div className={styles.connectException} hidden={connectState !== REQUEST_CODE.connectError}>
                <ExclamationCircleFilled style={{ fontSize: '15px', color: '#F54E4E' }} />
                <span className={styles.connectSpan}>{formatMessage({ id: 'home.connection.exception' })}</span>
                <Button className={styles.connectButton}
                    onClick={reConnect}>{formatMessage({ id: 'home.reConnect.btn' })}</Button>
            </div>
            <div className={styles.reConnect} hidden={connectState !== REQUEST_CODE.reConnect}>
                <LoadingOutlined />
                <span className={styles.connectSpan}>{formatMessage({ id: 'home.reConnect' })}</span>
            </div>
        </div>
    )
}

export default connect(
    ({ global }: { global: GlobalModelState }) => ({
        connectState: global.connectState,
    }),
    (dispatch) => ({
        getVersionList: () =>
            dispatch({
                type: 'global/getVersionList',
            }),
        save: (payload: LooseObject) =>
            dispatch({
                type: 'global/save',
                payload,
            })
    })
)(IndexPage);