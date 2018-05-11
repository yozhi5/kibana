import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderComponent } from 'recompose';
import { ErrorBoundary } from '../enhance/error_boundary';
import { ArgSimpleForm } from './arg_simple_form';
import { ArgTemplateForm } from './arg_template_form';
import { SimpleFailure } from './simple_failure';
import { AdvancedFailure } from './advanced_failure';
import { ArgLabel } from './arg_label';
import { PendingArgValue } from './pending_arg_value';
import './arg_form.less';

const branches = [
  // rendered argType args should be resolved, but are not
  branch(({ argTypeInstance, resolvedArgValue }) => {
    const { argType } = argTypeInstance;

    // arg does not need to be resolved, no need to branch
    if (!argType.resolveArgValue) return false;

    // arg needs to be resolved, render pending if the value is not defined
    return typeof resolvedArgValue === 'undefined';
  }, renderComponent(PendingArgValue)),
];

// This is what is being generated by render() from the Arg class. It is called in FunctionForm
const ArgFormComponent = props => {
  const {
    argId,
    argTypeInstance,
    templateProps,
    valueMissing,
    label,
    setLabel,
    onValueRemove,
    workpad,
    renderError,
    setRenderError,
    resolvedArgValue,
  } = props;

  return (
    <ErrorBoundary>
      {({ error, resetErrorState }) => {
        const { template, simpleTemplate } = argTypeInstance.argType;
        const hasError = Boolean(error) || renderError;

        const argumentProps = {
          ...templateProps,
          resolvedArgValue,
          defaultValue: argTypeInstance.default,

          renderError: () => {
            // TODO: don't do this
            // It's an ugly hack to avoid React's render cycle and ensure the error happens on the next tick
            // This is important; Otherwise we end up updating state in the middle of a render cycle
            Promise.resolve().then(() => {
              // Provide templates with a renderError method, and wrap the error in a known error type
              // to stop Kibana's window.error from being called
              // see window_error_handler.js for details,
              setRenderError(true);
            });
          },
          error: hasError,
          setLabel,
          resetErrorState: () => {
            resetErrorState();
            setRenderError(false);
          },
          label,
          workpad,
        };

        const expandableLabel = Boolean(hasError || template);

        const simpleArg = (
          <ArgSimpleForm
            required={argTypeInstance.required}
            valueMissing={valueMissing}
            onRemove={onValueRemove}
          >
            <ArgTemplateForm
              template={simpleTemplate}
              errorTemplate={SimpleFailure}
              error={hasError}
              argumentProps={argumentProps}
            />
          </ArgSimpleForm>
        );

        const extendedArg = (
          <div className="canvas__arg--controls">
            <ArgTemplateForm
              template={template}
              errorTemplate={AdvancedFailure}
              error={hasError}
              argumentProps={argumentProps}
            />
          </div>
        );

        return (
          <div className="canvas__arg">
            <ArgLabel
              className="resolved"
              argId={argId}
              label={label}
              help={argTypeInstance.help}
              expandable={expandableLabel}
              simpleArg={simpleArg}
              initialIsOpen={!simpleTemplate}
            >
              {extendedArg}
            </ArgLabel>
          </div>
        );
      }}
    </ErrorBoundary>
  );
};

ArgFormComponent.propTypes = {
  argId: PropTypes.string.isRequired,
  workpad: PropTypes.object.isRequired,
  argTypeInstance: PropTypes.shape({
    argType: PropTypes.object.isRequired,
    help: PropTypes.string.isRequired,
    required: PropTypes.bool,
    default: PropTypes.any,
  }).isRequired,
  templateProps: PropTypes.object,
  valueMissing: PropTypes.bool,
  label: PropTypes.string,
  setLabel: PropTypes.func.isRequired,
  expand: PropTypes.bool,
  setExpand: PropTypes.func,
  onValueRemove: PropTypes.func,
  renderError: PropTypes.bool.isRequired,
  setRenderError: PropTypes.func.isRequired,
  resolvedArgValue: PropTypes.any,
};

export const ArgForm = compose(...branches)(ArgFormComponent);
