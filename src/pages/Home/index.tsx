import { ConfigBlock, ConnectError, ConnectState, CRMFooter } from '@/components';
import { getUrlByContact } from "@/utils/utils";
import { useIntl } from "umi";
import styles from "./index.less";

const HomePage = () => {

    const { formatMessage } = useIntl();

    return (
        <>
            <ConnectError />
            <div className={styles.homePage}>
                <ConnectState />
                <ConfigBlock />
            </div>
            <CRMFooter url={getUrlByContact({}, true)} message={formatMessage({ id: 'home.toCRM' })} />
        </>
    );
};

export default HomePage;
