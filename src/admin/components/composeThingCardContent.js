// @flow

import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Chip from '@material-ui/core/Chip';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import arrangeFormFields from '../arrangeFormFields';
import composeFieldsObject from '../composeFieldsObject';

type EmbeddedProps = { children: Object };

const Embedded = ({ children }: EmbeddedProps) => <div style={{ paddingLeft: 16 }}>{children}</div>;

const composeThingCardContent = (
  thingConfig: ThingConfig,
  generalConfig: GeneralConfig,
): Object => {
  const { form } = thingConfig;
  const { enums } = generalConfig;

  const formFields = form || arrangeFormFields(thingConfig);
  const fieldsObject = composeFieldsObject(thingConfig);

  return (
    <React.Fragment>
      {formFields.map(({ name }) => {
        const { config, enumName, kind, oppositeName } = fieldsObject[name];

        const attributes = Object.keys(fieldsObject[name])
          .filter(attr => {
            if (['config', 'enumName', 'kind', 'name', 'oppositeName'].includes(attr)) return false;
            return !!fieldsObject[name][attr];
          })
          .join(', ');

        const secondary = attributes
          ? `${kind.slice(0, -6)} | ${attributes}`
          : `${kind.slice(0, -6)}`;

        const listItemTextProps = {
          primary: name,
          secondary,
        };

        if (kind === 'enumFields') {
          const enums2 = enums || []; // to prevent flowjs error
          const purelyEnum = enums2.find(({ name: enumName2 }) => enumName === enumName2);
          const enums3 = purelyEnum ? purelyEnum.enum : []; // to prevent flowjs error
          return (
            <div key={name}>
              <ListItem>
                <ListItemText {...listItemTextProps} />
              </ListItem>
              <Embedded>
                {enums3.map(label => (
                  <span key={label}>
                    <Chip label={label} />{' '}
                  </span>
                ))}
              </Embedded>
            </div>
          );
        }

        if (kind === 'embeddedFields') {
          return (
            <div key={name}>
              <ListItem>
                <ListItemText {...listItemTextProps} />
              </ListItem>
              <Embedded>{composeThingCardContent(config, generalConfig)}</Embedded>
            </div>
          );
        }

        if (kind === 'relationalFields') {
          return (
            <div key={name}>
              <ListItem>
                <ListItemText {...listItemTextProps} />
              </ListItem>
              <Embedded>
                <Embedded>
                  <Card>
                    <CardHeader title={config.name} />
                  </Card>
                </Embedded>
              </Embedded>
            </div>
          );
        }

        if (kind === 'duplexFields') {
          return (
            <div key={name}>
              <ListItem>
                <ListItemText {...listItemTextProps} />
              </ListItem>
              <Embedded>
                <Embedded>
                  <Card>
                    <CardHeader title={config.name} subheader={oppositeName} />
                  </Card>
                </Embedded>
              </Embedded>
            </div>
          );
        }
        return (
          <ListItem key={name}>
            <ListItemText {...listItemTextProps} />
          </ListItem>
        );
      })}
    </React.Fragment>
  );
};

export default composeThingCardContent;
