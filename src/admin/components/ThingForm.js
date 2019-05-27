// @flow

import React from 'react';
import { Form, Formik } from 'formik';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import NoSsr from '@material-ui/core/NoSsr';
import Snackbar from '@material-ui/core/Snackbar';
import Router, { withRouter } from 'next/router';
import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';

import type { ThingConfig } from '../../flowTypes';

import composeFormikFragment from '../composeFormikFragment';
import composeInitialValues from '../composeInitialValues';
import createValidationSchema from '../createValidationSchema';

import composeQuery from '../../client/queries/composeQuery';
import composeMutation from '../../client/mutations/composeMutation';

type Props = { thingConfig: ThingConfig };
type ProvidedProps = { router: { pathname: string, query: { id: string } } };

const FormikForm = (props: Props & ProvidedProps) => {
  const {
    thingConfig,
    thingConfig: { name },
    router: {
      query: { id },
      pathname,
    },
  } = props;

  const exclude = {
    id: null,
    createdAt: null,
    updatedAt: null,
  };
  const thingQuery = gql(composeQuery('thing', thingConfig, { exclude }));
  const updateThingMutation = gql(composeMutation('updateThing', thingConfig, { exclude }));
  const createThingMutation = gql(
    composeMutation('createThing', thingConfig, { include: { id: null } }),
  );

  const initialValues = composeInitialValues(thingConfig);
  const formikFragment = composeFormikFragment(thingConfig);

  const whereOne = { id };

  return (
    <Container>
      <h1>{`Update ${name}`}</h1>
      <NoSsr>
        <Query query={thingQuery} skip={!id} variables={{ whereOne }}>
          {({ client: apolloClient, data, error: thingQueryError, loading }) => {
            if (loading) return 'Loading...';
            if (thingQueryError)
              return (
                <Snackbar
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  open={!!thingQueryError}
                  ContentProps={{
                    'aria-describedby': 'message-id',
                  }}
                  message={<span id="message-id">{thingQueryError.message}</span>}
                />
              );
            if (data) {
              let currentInitialValues;
              return (
                <Mutation mutation={updateThingMutation} key={id}>
                  {(updateThing, { error: submitUpdateError }) => {
                    return (
                      <Formik
                        initialValues={(initialValues, data[name])}
                        onSubmit={(values, actions) => {
                          updateThing({
                            variables: {
                              whereOne,
                              data: { ...values, __typename: undefined },
                            },
                          })
                            .then(result => {
                              if (result) {
                                const { data: updatedData } = result;
                                if (updatedData) {
                                  currentInitialValues = updatedData[`update${name}`];
                                  actions.resetForm(currentInitialValues);
                                  actions.setSubmitting(false);
                                }
                              }
                            })
                            .catch(() => actions.setSubmitting(false));
                        }}
                        validationSchema={createValidationSchema(thingConfig, apolloClient, id)}
                      >
                        {formikProps => {
                          const { dirty, errors, isSubmitting, resetForm } = formikProps;
                          const isError = !!Object.keys(errors).length;
                          return (
                            <Form>
                              {formikFragment}
                              <Button
                                color="primary"
                                disabled={!dirty || isError || isSubmitting}
                                type="submit"
                                variant="outlined"
                              >
                                Update Person
                              </Button>{' '}
                              <Button
                                color="secondary"
                                disabled={!dirty || isError || isSubmitting}
                                onClick={() => {
                                  if (currentInitialValues) {
                                    resetForm(currentInitialValues);
                                  } else {
                                    resetForm();
                                  }
                                }}
                                variant="outlined"
                              >
                                Reset
                              </Button>{' '}
                              <Button variant="outlined">Cancel</Button>
                              {submitUpdateError && (
                                <Snackbar
                                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                  open={!!submitUpdateError}
                                  ContentProps={{
                                    'aria-describedby': 'message-id',
                                  }}
                                  message={<span id="message-id">{submitUpdateError.message}</span>}
                                />
                              )}
                            </Form>
                          );
                        }}
                      </Formik>
                    );
                  }}
                </Mutation>
              );
            }
            return null;
          }}
        </Query>
        {!id && (
          <Mutation mutation={createThingMutation}>
            {(createThing, { client: apolloClient, error: submitCreateError }) => {
              return (
                <Formik
                  initialValues={initialValues}
                  enableReinitialize
                  onSubmit={(values, actions) => {
                    createThing({
                      variables: {
                        whereOne,
                        data: { ...values, __typename: undefined },
                      },
                    })
                      .then(result => {
                        if (result) {
                          const { data: createdData } = result;
                          if (createdData) {
                            const { id: newId } = createdData[`create${name}`];
                            Router.push({ pathname, query: { id: newId } });
                          }
                        }
                      })
                      .catch(() => actions.setSubmitting(false));
                  }}
                  validationSchema={createValidationSchema(thingConfig, apolloClient)}
                >
                  {formikProps => {
                    const { dirty, errors, isSubmitting, resetForm } = formikProps;
                    const isError = !!Object.keys(errors).length;
                    return (
                      <Form>
                        {formikFragment}
                        <Button
                          color="primary"
                          disabled={!dirty || isError || isSubmitting}
                          type="submit"
                          variant="outlined"
                        >
                          {`Create ${name}`}
                        </Button>{' '}
                        <Button
                          color="secondary"
                          disabled={!dirty || isError || isSubmitting}
                          onClick={() => resetForm()}
                          variant="outlined"
                        >
                          Reset
                        </Button>{' '}
                        <Button variant="outlined">Cancel</Button>
                        {submitCreateError && (
                          <Snackbar
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                            open={!!submitCreateError}
                            ContentProps={{
                              'aria-describedby': 'message-id',
                            }}
                            message={<span id="message-id">{submitCreateError.message}</span>}
                          />
                        )}
                      </Form>
                    );
                  }}
                </Formik>
              );
            }}
          </Mutation>
        )}
      </NoSsr>
    </Container>
  );
};

export default withRouter(FormikForm);
