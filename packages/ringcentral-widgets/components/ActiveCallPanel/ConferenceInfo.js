import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './styles.scss';
import dynamicsFont from '../../assets/DynamicsFont/DynamicsFont.scss';
import i18n from './i18n';

export default function ConferenceInfo({
  displayedProfiles,
  remains,
  onClick,
}) {
  return (
    <a
      className={styles.conferenceCallInfoContainer}
      onClick={(e) => { e.preventDefault(); onClick(); }}
    >
      <div className={styles.avatarContainer}>
        {displayedProfiles.map(
          ({ avatarUrl, toUserName }, idx) => (
            <div
              key={`${toUserName}_${idx}`}
              className={styles.avatar}
              style={avatarUrl ? { backgroundImage: avatarUrl } : { backgroundColor: '#fff' }}>
              {avatarUrl ? null : <i className={classnames(dynamicsFont.portrait, styles.icon)} /> }
            </div>
        ))}
        {
          remains ? (
            <div className={classnames(styles.avatar, styles.remains)}>{`+${remains}`}</div>
          ) : null
        }
      </div>
      <p className={styles.info}>
        {i18n.getString('conferenceCall')}
      </p>
    </a>
  );
}

ConferenceInfo.propTypes = {
  displayedProfiles: PropTypes.arrayOf({
    avatarUrl: PropTypes.string,
    toUserName: PropTypes.string,
  }).isRequired,
  remains: PropTypes.number,
  onClick: PropTypes.func
};

ConferenceInfo.defaultProps = {
  remains: 0,
  onClick: i => i,
};
