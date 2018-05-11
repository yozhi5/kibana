import React from 'react';
import PropTypes from 'prop-types';
import { EuiFormRow, EuiAccordion, EuiFormLabel } from '@elastic/eui';
import { Tooltip } from '../tooltip';
// This is what is being generated by render() from the Arg class. It is called in FunctionForm

export const ArgLabel = props => {
  const { argId, className, label, help, expandable, children, simpleArg, initialIsOpen } = props;

  return (
    <div className={`canvas__arg--header${className && ` ${className}`}`}>
      {expandable ? (
        <EuiAccordion
          id={`accordian-${argId}`}
          buttonContent={
            <Tooltip text={help} placement="left">
              <EuiFormLabel className="canvas__arg--label">{label}</EuiFormLabel>
            </Tooltip>
          }
          extraAction={simpleArg}
          initialIsOpen={initialIsOpen}
        >
          {children}
        </EuiAccordion>
      ) : (
        simpleArg && (
          <EuiFormRow
            label={
              <Tooltip text={help} placement="left">
                <span className="canvas__arg--label">{label}</span>
              </Tooltip>
            }
          >
            {simpleArg}
          </EuiFormRow>
        )
      )}
    </div>
  );
};

ArgLabel.propTypes = {
  argId: PropTypes.string,
  label: PropTypes.string,
  help: PropTypes.string,
  expandable: PropTypes.bool,
  initialIsOpen: PropTypes.bool,
  simpleArg: PropTypes.object,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.element]).isRequired,
  className: PropTypes.string,
};
