import type { EntityConfig, InputCreator } from '../../tsTypes';

import canBeCopyTarget from '../../utils/canBeCopyTarget';
import createEntityUpdateInputType from './createEntityUpdateInputType';
import createEntityWhereCompoundOneInputType from './createEntityWhereCompoundOneInputType';
import createEntityWhereKeyToSourceInputType from './createEntityWhereKeyToSourceInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';

// compose creator of the item of "copyMany…" mutations args: "whereKeyToSource", target...
// ... ("whereTarget" or "whereCompoundTarget") & "data" (only "copyManyXs") are paired in one object...
// ... instead of parallel arrays that have to be equal in length:
// - XCopySourceAndTargetAndDataInput, XCopySourceAndCompoundTargetAndDataInput ("copyManyXs");
// - XCopySourceAndTargetInput, XCopySourceAndCompoundTargetInput ("copyManyXsWithChildren")
const composeCopySourceAndTargetInputCreator = (
  compoundTarget: boolean,
  withData: boolean,
): InputCreator => {
  const inputCreator: InputCreator = (entityConfig) => {
    const { name } = entityConfig;

    const inputName = `${name}CopySourceAnd${compoundTarget ? 'Compound' : ''}Target${
      withData ? 'AndData' : ''
    }Input`;

    if (!createEntityWhereKeyToSourceInputType(entityConfig)[1]) {
      return [inputName, '', {}];
    }

    const fields = [`  whereKeyToSource: ${name}WhereKeyToSourceInput!`];

    const childChain: Record<string, [InputCreator, EntityConfig]> = {
      [`${name}WhereKeyToSourceInput`]: [createEntityWhereKeyToSourceInputType, entityConfig],
    };

    // existing X to copy to can be selected only if X can be copy target
    if (compoundTarget) {
      if (
        !canBeCopyTarget(entityConfig) ||
        !createEntityWhereCompoundOneInputType(entityConfig)[1]
      ) {
        return [inputName, '', {}];
      }

      fields.push(`  whereCompoundTarget: ${name}WhereCompoundOneInput!`);
      childChain[`${name}WhereCompoundOneInput`] = [
        createEntityWhereCompoundOneInputType,
        entityConfig,
      ];
    } else if (canBeCopyTarget(entityConfig)) {
      fields.push(`  whereTarget: ${name}WhereOneInput`);
      childChain[`${name}WhereOneInput`] = [createEntityWhereOneInputType, entityConfig];
    }

    if (withData && createEntityUpdateInputType(entityConfig)[1]) {
      fields.push(`  data: ${name}UpdateInput`);
      childChain[`${name}UpdateInput`] = [createEntityUpdateInputType, entityConfig];
    }

    const inputDefinition = [`input ${inputName} {`, ...fields, '}'].join('\n');

    return [inputName, inputDefinition, childChain];
  };

  return inputCreator;
};

export default composeCopySourceAndTargetInputCreator;
