import React from 'react';
import styles from './index.less'

interface IndexProps {
    url: string
    message: string
    style: LooseObject
}

const IndexPage: React.FC<IndexProps> = ({ url, message, style }) => {

    const onClick = () => {
        window.open(url)
    }

    return (
        <span className={styles.footer} style={style}>
            <span className={styles.openUrl} onClick={onClick}>{message}</span>
        </span >
    )
}

export default IndexPage;