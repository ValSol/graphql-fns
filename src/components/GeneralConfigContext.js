// @flow

import * as React from 'react';

import type { GeneralConfig } from '../flowTypes';

const GeneralConfigContext: Object = React.createContext<GeneralConfig>({});

export default GeneralConfigContext;
