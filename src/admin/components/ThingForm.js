// @flow

import React from 'react';
import { Form, Formik } from 'formik';
import pluralize from 'pluralize';
import Router from 'next/router';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import NoSsr from '@material-ui/core/NoSsr';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';

import gql from 'graphql-tag';
import { Mutation, Query } from 'react-apollo';

import type { RouterQuery, ThingConfig } from '../../flowTypes';

import composeFormikFragment from '../composeFormikFragment';
import composeInitialValues from '../composeInitialValues';
import createValidationSchema from '../createValidationSchema';

import composeQuery from '../../client/queries/composeQuery';
import composeMutation from '../../client/mutations/composeMutation';
import Link from './Link';

type Props = { thingConfig: ThingConfig, router: { pathname: string, query: RouterQuery } };

const ThingForm = (props: Props) => {
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
  const thingMutation = id
    ? gql(composeMutation('updateThing', thingConfig, { exclude }))
    : gql(composeMutation('createThing', thingConfig, { include: { id: null } }));

  const formikFragment = composeFormikFragment(thingConfig);

  const whereOne = { id };
  const header = `${id ? 'Update' : 'Create'} ${name}`;
  return (
    <Container>
      <h1>{header}</h1>
      <Breadcrumbs aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <Link href={pathname}>All Things</Link>
        <Link href={`${pathname}?thing=${name}`}>{`All ${pluralize(name)}`}</Link>
        <Typography color="textPrimary">{header}</Typography>
      </Breadcrumbs>

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

            if (id && (!data || !data[name])) {
              Router.push({ pathname, query: {} });
              return null;
            }

            let currentInitialValues;
            return (
              <Mutation mutation={thingMutation} key={id}>
                {(mutateThing, { error: submitError }) => {
                  return (
                    <Formik
                      initialValues={
                        data
                          ? composeInitialValues(thingConfig, data[name])
                          : composeInitialValues(thingConfig)
                      }
                      onSubmit={(values, actions) => {
                        const variables = data
                          ? { whereOne, data: { ...values, __typename: undefined } }
                          : { data: { ...values, __typename: undefined } };
                        mutateThing({ variables })
                          .then(result => {
                            if (result) {
                              const { data: resultData } = result;
                              if (resultData) {
                                if (data) {
                                  // if update
                                  currentInitialValues = resultData[`update${name}`];
                                  actions.resetForm(currentInitialValues);
                                  actions.setSubmitting(false);
                                } else {
                                  // if create
                                  const { id: newId } = resultData[`create${name}`];
                                  Router.push({ pathname, query: { id: newId, thing: name } });
                                }
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
                              disabled={(!dirty && !!data) || isError || isSubmitting}
                              type="submit"
                              variant="outlined"
                            >
                              {`${data ? 'Update' : 'Create'} ${name}`}
                            </Button>{' '}
                            <Button
                              color="secondary"
                              disabled={!dirty || isSubmitting}
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
                            <Button
                              onClick={() => Router.push({ pathname, query: { thing: name } })}
                              variant="outlined"
                            >
                              {`${name} List`}
                            </Button>
                            {submitError && (
                              <Snackbar
                                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                                open={!!submitError}
                                ContentProps={{
                                  'aria-describedby': 'message-id',
                                }}
                                message={<span id="message-id">{submitError.message}</span>}
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
          }}
        </Query>
      </NoSsr>
    </Container>
  );
};

export default ThingForm;
