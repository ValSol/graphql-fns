// flow turned off
/* eslint-disable jsx-a11y/anchor-has-content */

import React from 'react';
import clsx from 'clsx';
import { withRouter } from 'next/router';
import NextLink from 'next/link';
import MuiLink from '@material-ui/core/Link';

type Props = { as: string, href: string, prefetch: boolean };

const NextComposed = React.forwardRef(function NextComposed(props: Props, ref) {
  const { as, href, prefetch, ...other } = props;

  return (
    <NextLink href={href} prefetch={prefetch} as={as}>
      <a ref={ref} {...other} />
    </NextLink>
  );
});

type Props2 = {
  activeClassName: string, // eslint-disable-line react/require-default-props
  as: string,
  className: string,
  href: string,
  innerRef: Function | Object,
  naked: boolean,
  onClick: Function,
  prefetch: boolean,
  router: {
    pathname: string,
  },
};

// A styled version of the Next.js Link component:
// https://nextjs.org/docs/#with-link
function Link(props: Props2) {
  const { activeClassName, router, className: classNameProps, innerRef, naked, ...other } = props;
  const { href } = props;
  const className = clsx(classNameProps, {
    [activeClassName]: router.pathname === href && activeClassName,
  });

  if (naked) {
    return <NextComposed className={className} ref={innerRef} {...other} />;
  }

  return <MuiLink component={NextComposed} className={className} ref={innerRef} {...other} />;
}

Link.defaultProps = {
  activeClassName: 'active', // eslint-disable-line react/default-props-match-prop-types
};

const RouterLink = withRouter(Link);

// eslint-disable-next-line react/no-multi-comp
export default React.forwardRef((props, ref) => <RouterLink {...props} innerRef={ref} />);
// TODO turn on flowjs
// export default React.forwardRef<Props2, RouterLink>((props, ref) => (
//   <RouterLink {...props} innerRef={ref} />
// ));
