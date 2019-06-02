// @flow

import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import NoSsr from '@material-ui/core/NoSsr';
import Tooltip from '@material-ui/core/Tooltip';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import ViewListIcon from '@material-ui/icons/ViewList';

import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import type { GeneralConfig, ThingConfig } from '../../flowTypes';

import composeQuery from '../../client/queries/composeQuery';
import composeThingCardContent from './composeThingCardContent';

type Props = { config: ThingConfig, generalConfig: GeneralConfig };

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 400,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
}));

const ThingCard = (props: Props) => {
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  function handleExpandClick() {
    setExpanded(!expanded);
  }

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
        <Tooltip title={expanded ? 'Show less' : 'Show more'}>
          <IconButton
            className={clsx(classes.expand, {
              [classes.expandOpen]: expanded,
            })}
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label={expanded ? 'Show less' : 'Show more'}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>{cardContent}</CardContent>
      </Collapse>
    </Card>
  );
};

export default ThingCard;
