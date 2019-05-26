// @flow

import React from 'react';
import { Form, Formik } from 'formik';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';

import composeFormikFragment from '../composeFormikFragment';
import composeInitialValues from '../composeInitialValues';
import createValidationSchema from '../createValidationSchema';

import type { ThingConfig } from '../../flowTypes';

type Props = { thingConfig: ThingConfig };

const FormikForm = (props: Props) => {
  const {
    thingConfig,
    thingConfig: { name },
  } = props;
  const initialValues = composeInitialValues(thingConfig);
  const validationSchema = createValidationSchema(thingConfig);
  const formikFragment = composeFormikFragment(thingConfig);

  return (
    <Container>
      <h1>{`Create ${name}`}</h1>
      <Formik
        initialValues={initialValues}
        onSubmit={(values, actions) => {
          setTimeout(() => {
            alert(JSON.stringify(values, null, 2));
            actions.setSubmitting(false);
          }, 500);
        }}
        validationSchema={validationSchema}
      >
        <Form>
          {formikFragment}
          <Button>Create</Button>
        </Form>
      </Formik>
    </Container>
  );
};

export default FormikForm;
