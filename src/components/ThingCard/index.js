// @flow

import React from 'react';
import clsx from 'clsx';
import pluralize from 'pluralize';
import Router, { useRouter } from 'next/router';

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

import GeneralConfigContext from '../GeneralConfigContext';
import composeQuery from '../../client/queries/composeQuery';
import composeThingCardContent from './composeThingCardContent';

type Props = { config: ThingConfig };

const useStyles = makeStyles((theme) => ({
  card: {
    marginTop: theme.spacing(1),
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
  const generalConfig: GeneralConfig = React.useContext(GeneralConfigContext);
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);
  const { pathname } = useRouter();
  function handleExpandClick() {
    setExpanded(!expanded);
  }

  const {
    config,
    config: { name },
  } = props;

  const thingCountQuery = gql(composeQuery('thingCount', config, generalConfig));

  const cardContent = composeThingCardContent(config, generalConfig);

  return (
    <Card className={classes.card}>
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

      <CardActions>
        <Tooltip title={`All ${pluralize(name)}`}>
          <IconButton
            aria-label={`All ${pluralize(name)}`}
            onClick={() => Router.push(`${pathname}?thing=${name}`)}
          >
            <ViewListIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Create ${name}`}>
          <IconButton
            aria-label={`Create ${name}`}
            onClick={() => Router.push(`${pathname}?thing=${name}&create`)}
          >
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
