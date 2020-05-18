// @flow
/* eslint-env jest */

import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import Chip from '@material-ui/core/Chip';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import composeThingCardContent from './composeThingCardContent';

type EmbeddedProps = { children: Object };

const Embedded = ({ children }: EmbeddedProps) => <div style={{ paddingLeft: 16 }}>{children}</div>;

describe('composeThingCardContent', () => {
  test('should compose fields for the not embedded fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'firstName',
          required: true,
        },
        {
          name: 'secondName',
          index: true,
          required: true,
        },
        {
          name: 'emails',
          array: true,
          index: true,
          required: true,
        },
        {
          name: 'comment',
        },
      ],
    };

    const expectedResult = (
      <>
        {[
          <ListItem key="firstName">
            <ListItemText primary="firstName" secondary="text | required" />
          </ListItem>,
          <ListItem key="secondName">
            <ListItemText primary="secondName" secondary="text | index, required" />
          </ListItem>,
          <ListItem key="emails">
            <ListItemText primary="emails" secondary="text | array, index, required" />
          </ListItem>,
          <ListItem key="comment">
            <ListItemText primary="comment" secondary="text" />
          </ListItem>,
        ]}
      </>
    );

    const generalConfig: GeneralConfig = { thingConfigs: { Example: thingConfig } };
    const result = composeThingCardContent(thingConfig, generalConfig);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should compose embedded fields', () => {
    const embedded3Config = {
      name: 'Embedded3',
      embedded: true,
      textFields: [
        {
          name: 'textField3',
        },
      ],
    };

    const embedded2Config = {
      name: 'Embedded2',
      embedded: true,
      textFields: [
        {
          name: 'textField2',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded3',
          config: embedded3Config,
          array: true,
        },
      ],
    };

    const embedded1Config = {
      name: 'Embedded1',
      embedded: true,
      textFields: [
        {
          name: 'textField1',
        },
      ],
      embeddedFields: [
        {
          name: 'embedded2',
          config: embedded2Config,
        },
      ],
    };

    const thingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
        {
          name: 'arrayTextFields',
          array: true,
          required: true,
        },
      ],
      embeddedFields: [
        {
          name: 'embedded1',
          config: embedded1Config,
        },
      ],
    };

    const expectedResult = (
      <>
        {[
          <ListItem key="textField">
            <ListItemText primary="textField" secondary="text" />
          </ListItem>,
          <ListItem key="arrayTextFields">
            <ListItemText primary="arrayTextFields" secondary="text | array, required" />
          </ListItem>,
          <div key="embedded1">
            <ListItem>
              <ListItemText primary="embedded1" secondary="embedded" />
            </ListItem>
            <Embedded>
              <>
                {[
                  <ListItem key="textField1">
                    <ListItemText primary="textField1" secondary="text" />
                  </ListItem>,
                  <div key="embedded2">
                    <ListItem>
                      <ListItemText primary="embedded2" secondary="embedded" />
                    </ListItem>
                    <Embedded>
                      <>
                        {[
                          <ListItem key="textField2">
                            <ListItemText primary="textField2" secondary="text" />
                          </ListItem>,
                          <div key="embedded3">
                            <ListItem>
                              <ListItemText primary="embedded3" secondary="embedded | array" />
                            </ListItem>
                            <Embedded>
                              <>
                                {[
                                  <ListItem key="textField3">
                                    <ListItemText primary="textField3" secondary="text" />
                                  </ListItem>,
                                ]}
                              </>
                            </Embedded>
                          </div>,
                        ]}
                      </>
                    </Embedded>
                  </div>,
                ]}
              </>
            </Embedded>
          </div>,
        ]}
      </>
    );

    const generalConfig: GeneralConfig = { thingConfigs: { Example: thingConfig } };
    const result = composeThingCardContent(thingConfig, generalConfig);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should compose relational and duples fields', () => {
    const thingConfig: ThingConfig = {};
    Object.assign(thingConfig, {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      duplexFields: [
        {
          name: 'duplexField',
          config: thingConfig,
          oppositeName: 'duplexField',
          index: true,
        },
      ],
      relationalFields: [
        {
          name: 'relationalField',
          config: thingConfig,
          index: true,
        },
      ],
    });
    const expectedResult = (
      <>
        {[
          <ListItem key="textField">
            <ListItemText primary="textField" secondary="text" />
          </ListItem>,
          <div key="duplexField">
            <ListItem>
              <ListItemText primary="duplexField" secondary="duplex | index" />
            </ListItem>
            <Embedded>
              <Embedded>
                <Card>
                  <CardHeader title="Example" subheader="duplexField" />
                </Card>
              </Embedded>
            </Embedded>
          </div>,
          <div key="relationalField">
            <ListItem>
              <ListItemText primary="relationalField" secondary="relational | index" />
            </ListItem>
            <Embedded>
              <Embedded>
                <Card>
                  <CardHeader title="Example" />
                </Card>
              </Embedded>
            </Embedded>
          </div>,
        ]}
      </>
    );

    const generalConfig: GeneralConfig = { thingConfigs: { Example: thingConfig } };
    const result = composeThingCardContent(thingConfig, generalConfig);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });

  test('should compose enum fields', () => {
    const thingConfig: ThingConfig = {
      name: 'Example',
      textFields: [
        {
          name: 'textField',
        },
      ],
      enumFields: [
        {
          name: 'enumField',
          enumName: 'weekDays',
          array: true,
        },
      ],
    };

    const expectedResult = (
      <>
        {[
          <div key="enumField">
            <ListItem>
              <ListItemText primary="enumField" secondary="enum | array" />
            </ListItem>
            <Embedded>
              {[
                <span key="Sunday">
                  <Chip label="Sunday" />{' '}
                </span>,
                <span key="Monday">
                  <Chip label="Monday" />{' '}
                </span>,
                <span key="Tuesday">
                  <Chip label="Tuesday" />{' '}
                </span>,
                <span key="Wednesday">
                  <Chip label="Wednesday" />{' '}
                </span>,
                <span key="Thursday">
                  <Chip label="Thursday" />{' '}
                </span>,
                <span key="Friday">
                  <Chip label="Friday" />{' '}
                </span>,
                <span key="Saturday">
                  <Chip label="Saturday" />{' '}
                </span>,
              ]}
            </Embedded>
          </div>,
          <ListItem key="textField">
            <ListItemText primary="textField" secondary="text" />
          </ListItem>,
        ]}
      </>
    );

    const enums = [
      {
        name: 'weekDays',
        enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
    ];
    const generalConfig: GeneralConfig = { thingConfigs: { Example: thingConfig }, enums };
    const result = composeThingCardContent(thingConfig, generalConfig);

    const result2 = JSON.parse(JSON.stringify(result));
    const expectedResult2 = JSON.parse(JSON.stringify(expectedResult));

    expect(result2).toEqual(expectedResult2);
  });
});
