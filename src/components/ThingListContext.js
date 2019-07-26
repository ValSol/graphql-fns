// @flow

import * as React from 'react';

type Props = {
  children: React.Node,
};

const ThingListContext = React.createContext<
  [{ error: string, items: Array<Object>, loading: false }, Function],
>([{ error: '', items: [], loading: false }, () => {}]);

const ThingListProvider = (props: Props) => {
  const [state, setState] = React.useState({ error: '', items: [], loading: false });
  const { children } = props;
  return (
    <ThingListContext.Provider value={[state, setState]}>{children}</ThingListContext.Provider>
  );
};

export { ThingListContext, ThingListProvider };
