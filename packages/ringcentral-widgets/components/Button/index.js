import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import styles from './styles.scss';

export default function Button({
  className,
  disabled,
  onClick,
  children,
  tooltip,
  dataSign,
}) {
  return (
    <div
      data-sign={dataSign}
      className={classnames(
        className,
        styles.root,
        disabled && styles.disabled,
      )}
      onClick={disabled ? null : onClick}
      title={tooltip}>
      {children}
    </div>
  );
}
Button.propTypes = {
  className: PropTypes.string,
  tooltip: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node,
  dataSign: PropTypes.string,
};

Button.defaultProps = {
  className: undefined,
  tooltip: '',
  disabled: false,
  onClick: undefined,
  children: undefined,
  dataSign: undefined,
};
