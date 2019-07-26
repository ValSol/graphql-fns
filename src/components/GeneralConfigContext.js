// @flow

import * as React from 'react';

import type { GeneralConfig } from '../flowTypes';

const GeneralConfigContext = React.createContext<GeneralConfig>({});

export default GeneralConfigContext;
