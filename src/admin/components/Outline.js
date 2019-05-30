// @flow

import React from 'react';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => {
  const align = theme.direction === 'rtl' ? 'right' : 'left';
  const borderColor =
    theme.palette.type === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)';
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
      '&:hover': {
        borderColor: theme.palette.text.primary,
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          borderColor,
        },
      },
    },
    /* Styles applied to the legend element. */
    legend: {
      opacity: 0.6,
      textAlign: 'left',
      padding: 8,
      lineHeight: '11px',
      transform: 'scale(0.86)',
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
