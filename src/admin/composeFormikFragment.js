// @flow

import React from 'react';
import { Field, FieldArray } from 'formik';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import { TextField as FormikTextField } from 'formik-material-ui';
import { get as objectGet } from 'lodash/object';
import pluralize from 'pluralize';

import type { ThingConfig, FlatFormikFields } from '../flowTypes';

import composeFlatFormikFields from './composeFlatFormikFields';
import composeFormikFieldArrayChild from './composeFormikFieldArrayChild';
import composeInitialValues from './composeInitialValues';

const composeFields = (flatFormikFields: FlatFormikFields, prefix?: string, prefix2?: string) =>
  flatFormikFields.map(({ array, config, child, name }, i) => {
    const name2 = prefix2 ? `${prefix2} ‣ ${name}` : name;
    const path = prefix ? `${prefix}.${name}` : name;
    if (child) {
      return array ? (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <FieldArray name={path}>
            {args => {
              const {
                form: { isSubmitting, values },
                push,
                remove,
              } = args;

              const itemName = pluralize.singular(name);
              const name3 = prefix2 ? `${prefix2} ‣ ${itemName}` : itemName;

              return (
                <div>
                  <div>
                    {objectGet(values, path) &&
                      objectGet(values, path).map((item, j) => (
                        // eslint-disable-next-line react/no-array-index-key
                        <Card key={j} style={{ marginBottom: 8 }}>
                          <CardHeader title={`${name3} #${j + 1}`} />
                          <CardContent>
                            {composeFields(child, `${path}[${j}]`, `${name3} #${j + 1}`)}
                          </CardContent>
                          <CardActions>
                            <Button
                              edge="end"
                              aria-label={`Delete ${itemName}`}
                              onClick={() => remove(j)}
                            >
                              <DeleteIcon />
                              {`${itemName} #${j + 1}`}
                            </Button>
                          </CardActions>
                        </Card>
                      ))}
                  </div>
                  <Button
                    disabled={isSubmitting}
                    onClick={() => {
                      if (config) push(composeInitialValues(config));
                    }}
                    variant="contained"
                  >
                    <AddIcon />
                    {name3}
                  </Button>
                </div>
              );
            }}
          </FieldArray>
        </div>
      ) : (
        // eslint-disable-next-line react/no-array-index-key
        <Card key={i}>
          <CardHeader title={name2} />
          <CardContent>{composeFields(child, path, name2)}</CardContent>
        </Card>
      );
    }

    if (array) {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <div key={i}>
          <FieldArray name={path}>{composeFormikFieldArrayChild(prefix2)}</FieldArray>
        </div>
      );
    }

    return (
      // eslint-disable-next-line react/no-array-index-key
      <div key={i}>
        <Field
          component={FormikTextField}
          fullWidth
          label={name2}
          margin="normal"
          name={path}
          variant="outlined"
        />
      </div>
    );
  });

const composeFormikFragment = (thingConfig: ThingConfig): Object => {
  const flatFormikFields = composeFlatFormikFields(thingConfig);

  return <div>{composeFields(flatFormikFields)}</div>;
};

export default composeFormikFragment;
