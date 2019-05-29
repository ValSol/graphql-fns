// @flow

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => {
  const align = theme.direction === 'rtl' ? 'right' : 'left';

  return {
    /* Styles applied to the root element. */
    root: {
      borderRadius: theme.shape.borderRadius,
      borderStyle: 'solid',
      borderWidth: 1,
      marginBottom: theme.spacing(1),
      // Match the Input Label
      transition: theme.transitions.create([`padding-${align}`, 'border-color', 'border-width'], {
        duration: theme.transitions.duration.shorter,
        easing: theme.transitions.easing.easeOut,
      }),
    },
    /* Styles applied to the legend element. */
    legend: {
      textAlign: 'left',
      padding: 8,
      lineHeight: '11px',
      transition: theme.transitions.create('width', {
        duration: theme.transitions.duration.shorter,
        easing: theme.transitions.easing.easeOut,
      }),
    },
  };
});

type Props = {
  children: Object,
  label: string,
};

const Outline = ({ children, label }: Props) => {
  const classes = useStyles();

  return (
    <fieldset aria-hidden className={classes.root}>
      <legend className={classes.legend}>
        {/* Use the nominal use case of the legend, avoid rendering artefacts. */}
        {/* eslint-disable-next-line react/no-danger */}
        <span dangerouslySetInnerHTML={{ __html: '&#8203;' }} />
        {label}
      </legend>
      {children}
    </fieldset>
  );
};

export default Outline;
