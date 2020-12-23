// @flow
/* eslint-disable jsx-a11y/anchor-has-content */

import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import MuiLink from '@material-ui/core/Link';

type Props = {
  as?: string, // eslint-disable-line react/require-default-props
  href: string,
  prefetch?: boolean, // eslint-disable-line react/require-default-props
};

// $FlowFixMe
const NextComposed = React.forwardRef((props: Props, ref) => {
  const { as, href, prefetch, ...other } = props;

  return (
    <NextLink href={href} prefetch={prefetch} as={as}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <a {...other} ref={ref} />
    </NextLink>
  );
});

type Props2 = {
  activeClassName: string, // eslint-disable-line react/require-default-props
  as: string,
  className?: string,
  href: string,
  innerRef: Function | Object,
  naked?: boolean,
  onClick?: Function,
  prefetch: boolean,
};

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
function Link(props: Props2) {
  const router = useRouter();
  const { activeClassName, className: classNameProps, innerRef, naked, ...other } = props;
  const { href } = props;
  const className = clsx(classNameProps, {
    [activeClassName]: router.pathname === href && activeClassName,
  });

  if (naked) {
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <NextComposed {...other} className={className} ref={innerRef} />;
  }

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <MuiLink {...other} component={NextComposed} className={className} ref={innerRef} />;
}

Link.defaultProps = {
  activeClassName: 'active', // eslint-disable-line react/default-props-match-prop-types
  className: '',
  naked: false,
  onClick: null,
};

// $FlowFixMe
export default React.forwardRef<Props, HTMLAnchorElement>((props, ref) => (
  // $FlowFixMe
  <Link innerRef={ref} {...props} /> // eslint-disable-line  react/jsx-props-no-spreading
));
