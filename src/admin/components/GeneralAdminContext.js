// @flow

import * as React from 'react';

import type { GeneralConfig } from '../../flowTypes';

const GeneralAdminContext = React.createContext<GeneralConfig>({});

export default GeneralAdminContext;
