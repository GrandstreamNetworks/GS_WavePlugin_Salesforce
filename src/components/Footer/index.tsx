import React from 'react';
import styles from './index.less'

interface IndexProps {
    url: string
    message: string
    style: LooseObject
}

const IndexPage: React.FC<IndexProps> = ({ url, message, style }) => {
    return (
        <span className={styles.footer} style={style}>
            <a href={url} target="_blank">{message}</a>
        </span >
    )
}

export default IndexPage;