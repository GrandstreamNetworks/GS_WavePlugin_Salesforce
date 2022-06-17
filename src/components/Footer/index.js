import React from 'react';
import styles from './index.less'

const IndexPage = ({ url, message, style }) => {
    return (
        <span className={styles.footer} style={style}>
            <a href={url} target="_blank">{message}</a>
        </span >
    )
}

export default IndexPage;