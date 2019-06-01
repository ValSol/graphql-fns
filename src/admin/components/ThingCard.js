// @flow

import React from 'react';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import Tooltip from '@material-ui/core/Tooltip';
import NoSsr from '@material-ui/core/NoSsr';
import ViewListIcon from '@material-ui/icons/ViewList';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import composeQuery from '../../client/queries/composeQuery';
import composeThingCardContent from './composeThingCardContent';

type Props = { config: ThingConfig, generalConfig: GeneralConfig };

const ThingCard = (props: Props) => {
  const {
    config,
    config: { name },
    generalConfig,
  } = props;

  const thingCountQuery = gql(composeQuery('thingCount', config));

  const cardContent = composeThingCardContent(config, generalConfig);

  return (
    <Card>
      {
        <NoSsr>
          <Query query={thingCountQuery}>
            {({ data, error: thingCountQueryError, loading }) => {
              if (loading) return 'Loading...';

              if (thingCountQueryError) return <CardHeader title={name} />;

              if (!data) return null;
              const count = data[`${name}Count`];
              return <CardHeader title={name} subheader={`items: ${count}`} />;
            }}
          </Query>
        </NoSsr>
      }
      <CardContent>{cardContent}</CardContent>
      <CardActions>
        <Tooltip title="Example List">
          <IconButton aria-label="Example List">
            <ViewListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Create Example Item">
          <IconButton aria-label="Create Example Item">
            <InsertDriveFileIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default ThingCard;
