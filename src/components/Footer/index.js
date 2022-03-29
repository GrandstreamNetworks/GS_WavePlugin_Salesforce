import React from 'react';
import styles from './index.less'

const IndexPage = ({ url, message, style }) => {
    return (
        <div className={styles.footer} style={style}>
            <a href={url} target="_blank">{message}</a>
        </div >
    )
}

export default IndexPage;