/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */


import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { debounce } from 'lodash';

import {
  EuiTitle,
  EuiFieldText,
  EuiDescribedFormGroup,
  EuiFormRow,
} from '@elastic/eui';

import { i18nValidationErrorMessages } from '../services/input_validation';

/**
 * State transitions: fields update
 */
export const updateFields = (newValues) => ({ fields }) => ({
  fields: {
    ...fields,
    ...newValues,
  },
});

const parseError = (err) => {
  if (!err) {
    return null;
  }

  const [error] = err.details; // Use the first error in the details array (error.details[0])
  const { type, context } = error;
  const message = i18nValidationErrorMessages[type](context);
  return { message };
};

export class FormEntryRow extends PureComponent {
  static propTypes = {
    onValueUpdate: PropTypes.func.isRequired,
    onErrorUpdate: PropTypes.func.isRequired,
    field: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    error: PropTypes.object,
    schema: PropTypes.object.isRequired,
    disabled: PropTypes.bool,
    areErrorsVisible: PropTypes.bool.isRequired,
  };

  componentDidMount() {
    this.validateField(this.props.value);
    this.validateField = debounce(this.validateField.bind(this), 300);
  }

  onFieldChange = (value) => {
    const { field, onValueUpdate } = this.props;

    onValueUpdate({ [field]: value });

    this.validateField(value);
  }

  validateField = (value) => {
    const { field, schema: { validator, label }, onErrorUpdate } = this.props;
    const result = validator.label(label).validate(value);
    const error = parseError(result.error);

    onErrorUpdate({ [field]: error });
  }

  render() {
    const { field, value, error, schema, disabled, areErrorsVisible } = this.props;

    const hasError = !!error;
    const isInvalid = hasError && (error.alwaysVisible || areErrorsVisible);

    return (
      <EuiDescribedFormGroup
        title={(
          <EuiTitle size="s">
            <h4>{schema.label}</h4>
          </EuiTitle>
        )}
        description={schema.description}
        fullWidth
        key={field}
      >
        <EuiFormRow
          label={schema.label}
          helpText={schema.helpText}
          error={error && error.message}
          isInvalid={isInvalid}
          fullWidth
        >
          <EuiFieldText
            isInvalid={isInvalid}
            value={value}
            onChange={e => this.onFieldChange(e.target.value)}
            disabled={disabled === true}
            fullWidth
          />
        </EuiFormRow>
      </EuiDescribedFormGroup>
    );
  }
}
