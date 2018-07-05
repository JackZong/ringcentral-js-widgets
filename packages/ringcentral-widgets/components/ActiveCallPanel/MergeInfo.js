import React from 'react';
import PropTypes from 'prop-types';
import Style from './styles.scss';
import classnames from 'classnames';
import DefaultAvatar from '../../assets/images/DefaultAvatar.svg';
function MergeInfo ({ calls, timeCounter }) {
  return (
    <div className={Style.mergeInfo}>
      {
        calls.map((item, index) => {
          const itemclass = classnames({
            [Style.merge_item]: true,
            [Style.merge_active]: item.telephonyStatus !== 'OnHold'
          })
          const avatarclass = classnames({
            [Style.merge_avatar]: true,
            [Style.merge_avatar_active]: item.telephonyStatus !== 'OnHold'
          })
          const nameclass = classnames({
            [Style.merge_name]: true,
            [Style.merge_name_active]: item.telephonyStatus !== 'OnHold'
          })
          const statusclass = classnames({
            [Style.merge_status]: true,
            [Style.merge_status_active]: item.telephonyStatus !== 'OnHold'
          })
          return (
            <div className={itemclass} key={index}>
              <div className={avatarclass}>
                {item.toMatches.length ? item.toMatches[0].profileImageUrl ? <img src={item.toMatches[0].profileImageUrl} className={Style.avatar_img}/> : <DefaultAvatar className={Style.avatar_name}/> : <DefaultAvatar className={Style.avatar_name}/>}
                </div>
              <div className={nameclass}>{item.toName}</div>
              <div className={statusclass}>{item.telephonyStatus !== 'OnHold' ? timeCounter : item.telephonyStatus}</div>
            </div>
          )
        })
      }
    </div>
  )
}
MergeInfo.defaultProps = {
  calls: [],
  timeCounter: null
}
MergeInfo.propTypes = {
  calls: PropTypes.array,
  timeCounter: PropTypes.element
}
export default MergeInfo;
