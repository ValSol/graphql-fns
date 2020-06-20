// @flow

import React from 'react';
import { Form, Formik } from 'formik';
import pluralize from 'pluralize';
import Router, { useRouter } from 'next/router';

import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import NoSsr from '@material-ui/core/NoSsr';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import SkipNext from '@material-ui/icons/SkipNext';
import SkipPrevious from '@material-ui/icons/SkipPrevious';

import gql from 'graphql-tag';
import { Mutation, Query } from '@apollo/react-components';

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import coerceDataToGql from '../../utils/coerceDataToGql';
import coerceDataFromGql from '../../utils/coerceDataFromGql';
import composeFormikFragment from './composeFormikFragment';
import composeInitialValues from './composeInitialValues';
import createValidationSchema from './createValidationSchema';
import getNeighbors from './getNeighbors';

import GeneralConfigContext from '../GeneralConfigContext';
import { ThingListContext } from '../ThingListContext';
import composeQuery from '../../client/queries/composeQuery';
import composeMutation from '../../client/mutations/composeMutation';
import Link from '../Link';

const useStyles = makeStyles(() => ({
  formControl: { marginRight: '1em' },
  inputLabel: { position: 'static', marginBottom: '-1em' },
}));

type Props = {
  thingConfig: ThingConfig,
};

const ThingForm = (props: Props) => {
  // eslint-disable-next-line no-unused-vars
  const {
    dispatch,
    state: { filtered },
  } = React.useContext(ThingListContext); // will use only when create new item
  const generalConfig: GeneralConfig = React.useContext(GeneralConfigContext);
  const [open, setOpen] = React.useState(false);
  const [scrollButtons, setScrollButtons] = React.useState(null);
  const {
    query: { id, delete: deleteAttr },
    pathname,
  } = useRouter();

  const {
    thingConfig,
    thingConfig: { name },
  } = props;

  const toDelete = deleteAttr === '' || !!deleteAttr;
  React.useEffect(() => dispatch({ type: 'LOAD', config: thingConfig }), [dispatch, thingConfig]);
  React.useEffect(() => {
    const { previous, next, index } = getNeighbors(id, filtered);
    const newScrollButtons =
      (!previous && !next) || toDelete ? null : (
        <div>
          <IconButton
            aria-label="Delete"
            disabled={!previous}
            onClick={
              previous
                ? () => Router.push({ pathname, query: { thing: name, id: previous } })
                : null
            }
          >
            <SkipPrevious />
          </IconButton>
          {` ${index + 1} `}
          <IconButton
            aria-label="Delete"
            disabled={!next}
            onClick={
              next ? () => Router.push({ pathname, query: { thing: name, id: next } }) : null
            }
          >
            <SkipNext />
          </IconButton>
        </div>
      );
    setScrollButtons(newScrollButtons);
  }, [id, filtered, name, pathname, toDelete]);

  const exclude = {
    id: true,
    createdAt: true,
    updatedAt: true,
  };
  const thingQuery = gql(composeQuery('thing', thingConfig, generalConfig, { exclude }));
  const thingMutation = id // eslint-disable-line no-nested-ternary
    ? toDelete
      ? gql(composeMutation('deleteThing', thingConfig, generalConfig, { exclude }))
      : gql(composeMutation('updateThing', thingConfig, generalConfig, { exclude }))
    : gql(composeMutation('createThing', thingConfig, generalConfig, { include: { id: true } }));

  const whereOne = { id };
  // eslint-disable-next-line no-nested-ternary
  const header = `${id ? (toDelete ? 'Delete' : 'Update') : 'Create'} ${name}`;

  const classes = useStyles();

  return (
    <Container>
      <h1>{header}</h1>
      <Breadcrumbs aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <Link href={pathname}>All Things</Link>
        <Link href={`${pathname}?thing=${name}`}>{`${pluralize(name)} (${filtered.length})`}</Link>
        <Typography color="textPrimary">{header}</Typography>
      </Breadcrumbs>

      <NoSsr>
        {scrollButtons}
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
                          ? composeInitialValues(
                              thingConfig,
                              coerceDataFromGql(data[name], thingConfig),
                            )
                          : composeInitialValues(thingConfig)
                      }
                      onSubmit={(values, actions) => {
                        if (toDelete) {
                          dispatch({ type: 'OUTDATE' });
                          setOpen(true);
                          return;
                        }

                        if (data && !currentInitialValues) {
                          currentInitialValues = coerceDataFromGql(data[name], thingConfig);
                        }

                        const variables = data
                          ? {
                              whereOne,
                              data: coerceDataToGql(values, currentInitialValues, thingConfig),
                            }
                          : {
                              data: coerceDataToGql(values, null, thingConfig),
                            };

                        mutateThing({ variables })
                          .then((result) => {
                            if (result) {
                              const { data: resultData } = result;
                              if (resultData) {
                                dispatch({ type: 'OUTDATE' });
                                if (data) {
                                  // if update
                                  currentInitialValues = coerceDataFromGql(
                                    resultData[`update${name}`],
                                    thingConfig,
                                  );
                                  actions.resetForm(currentInitialValues);

                                  apolloClient
                                    .clearStore()
                                    .then(() => actions.setSubmitting(false));
                                } else {
                                  // if create
                                  const { id: newId } = resultData[`create${name}`];
                                  dispatch({ type: 'ADD', value: { id: newId } });
                                  // TODO update store instead of clear store
                                  apolloClient
                                    .clearStore()
                                    .then(() =>
                                      Router.push({ pathname, query: { id: newId, thing: name } }),
                                    );
                                }
                              }
                            }
                          })
                          .catch(() => actions.setSubmitting(false));
                      }}
                      validationSchema={createValidationSchema(
                        thingConfig,
                        generalConfig,
                        apolloClient,
                        id,
                      )}
                    >
                      {(formikProps) => {
                        const { dirty, errors, isSubmitting, resetForm } = formikProps;

                        const isError = !!Object.keys(errors).length;
                        const submitButtonName = `${
                          // eslint-disable-next-line no-nested-ternary
                          data ? (toDelete ? 'Delete' : 'Update') : 'Create'
                        } ${name}`;
                        return (
                          <Form>
                            {composeFormikFragment(
                              formikProps,
                              classes,
                              thingConfig,
                              generalConfig,
                              toDelete,
                            )}
                            <div style={{ marginTop: 16 }}>
                              <Button
                                onClick={() => Router.push({ pathname, query: { thing: name } })}
                                variant="outlined"
                              >
                                Cancel
                              </Button>{' '}
                              {!toDelete && (
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
                                </Button>
                              )}{' '}
                              <Button
                                color="primary"
                                disabled={
                                  !toDelete && ((!dirty && !!data) || isError || isSubmitting)
                                }
                                type="submit"
                                variant="outlined"
                              >
                                {submitButtonName}
                              </Button>
                            </div>
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
                            <Dialog
                              open={open}
                              onClose={() => setOpen(false)}
                              aria-labelledby="alert-dialog-title"
                              aria-describedby="alert-dialog-description"
                            >
                              <DialogTitle id="alert-dialog-title">
                                Are you sure to delete?
                              </DialogTitle>
                              <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                  {`The ${name} will be deleted permanently...`}
                                </DialogContentText>
                              </DialogContent>
                              <DialogActions>
                                <Button onClick={() => setOpen(false)}>Cancel</Button>
                                <Button
                                  onClick={() => {
                                    setOpen(false);
                                    const variables = { whereOne };

                                    mutateThing({ variables }).then((result) => {
                                      if (result) {
                                        const { data: resultData } = result;
                                        if (resultData) {
                                          // TODO update store instead of clear store
                                          apolloClient.clearStore().then(() =>
                                            Router.push({
                                              pathname,
                                              query: { thing: name },
                                            }),
                                          );
                                        }
                                      }
                                    });
                                    // .catch(() => actions.setSubmitting(false));
                                  }}
                                  color="primary"
                                  autoFocus
                                >
                                  Delete
                                </Button>
                              </DialogActions>
                            </Dialog>
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
