// @flow

const React = require('react');
const { Field } = require('formik');
const { TextField: FormikTextField } = require('formik-material-ui');
const { get: objectGet } = require('lodash/object');
const pluralize = require('pluralize');

type Props = {
  form: { isSubmitting: boolean, values: Object },
  name: string,
  push: Function,
  remove: Function,
};

const formikFieldArrayChild = (props: Props) => {
  const {
    form: { isSubmitting, values },
    name,
    push,
    remove,
  } = props;

  const itemName = pluralize.singular(name.split('.').slice(-1)[0]);

  return (
    <div>
      <div>
        {objectGet(values, name) &&
          objectGet(values, name).map((item, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i}>
              <Field name={`${name}[${i}]`} label={itemName} component={FormikTextField} />
              <button type="button" onClick={() => remove(i)} disabled={isSubmitting}>
                {`Delete the ${itemName}`}
              </button>
            </div>
          ))}
      </div>
      <button type="button" onClick={() => push('')} disabled={isSubmitting}>
        {`Add a ${itemName}`}
      </button>
    </div>
  );
};

module.exports = formikFieldArrayChild;
