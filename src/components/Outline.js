// @flow

import React from 'react';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
import FormHelperText from '@material-ui/core/FormHelperText';

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
    error: {
      color: theme.palette.error.main,
      borderColor: theme.palette.error.light,
      '&:hover': {
        borderColor: theme.palette.error.main,
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          borderColor,
        },
      },
    },
    /* Styles applied to the legend element. */
    legend: {
      textAlign: 'left',
      transform: 'scale(0.86)',
      transition: theme.transitions.create('width', {
        duration: theme.transitions.duration.shorter,
        easing: theme.transitions.easing.easeOut,
      }),
    },
    legend2: {
      opacity: 0.6,
    },
  };
});

type Props = {
  children: Object,
  label: string,
  error?: boolean,
  message?: string,
  required?: boolean,
};

const Outline = ({ children, error, message, label, required }: Props) => {
  const classes = useStyles();
  return (
    <>
      <fieldset aria-hidden className={clsx(classes.root, { [classes.error]: error })}>
        <legend
          className={clsx(classes.legend, {
            [classes.legend2]: !error,
            [classes.error]: error,
          })}
        >
          {/* Use the nominal use case of the legend, avoid rendering artefacts. */}
          {/* eslint-disable-next-line react/no-danger */}
          <span dangerouslySetInnerHTML={{ __html: '&#8203;' }} />
          {`${label}${required ? ' *' : ''}`}
        </legend>
        {children}
      </fieldset>
      {message ? (
        <FormHelperText error={error} variant="outlined">
          {message}
        </FormHelperText>
      ) : null}
    </>
  );
};

Outline.defaultProps = {
  error: false,
  message: '',
  required: false,
};

export default Outline;
