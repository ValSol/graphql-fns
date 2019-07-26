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
    return <NextComposed className={className} ref={innerRef} {...other} />;
  }

  return <MuiLink component={NextComposed} className={className} ref={innerRef} {...other} />;
}

Link.defaultProps = {
  activeClassName: 'active', // eslint-disable-line react/default-props-match-prop-types
  className: '',
  naked: false,
  onClick: null,
};

// eslint-disable-next-line react/no-multi-comp
export default React.forwardRef<Props, 'a'>((props, ref) => <Link {...props} innerRef={ref} />);
