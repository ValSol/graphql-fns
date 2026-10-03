import createCopyEntityOptionsInputType from './createCopyEntityOptionsInputType';
import createDeleteEntityWithChildrenOptionsInputType from './createDeleteEntityWithChildrenOptionsInputType';
import createEntityWhereKeyToSourceInputType from './createEntityWhereKeyToSourceInputType';
import createEntityCreateInputType, {
  createEntityCreateChildInputType,
  createEntityCreateOrPushChildrenInputType,
} from './createEntityCreateInputType';
import createEntityDistinctValuesOptionsInputType from './createEntityDistinctValuesOptionsInputType';
import createEntityNearInputType from './createEntityNearInputType';
import createEntityRestrictedWhereAndTargetInputType from './createEntityRestrictedWhereAndTargetInputType';
import createEntityRestrictedWhereInputType from './createEntityRestrictedWhereInputType';
import createEntitySortInputType from './createEntitySortInputType';
import createEntityTextNamesEnumType from './createEntityTextNamesEnumType';
import createEntityUpdateInputType from './createEntityUpdateInputType';
import createEntityWhereAndSearchInputType from './createEntityWhereAndSearchInputType';
import createEntityWhereByUniqueInputType from './createEntityWhereByUniqueInputType';
import createEntityWhereCompoundOneAndDataInputType from './createEntityWhereCompoundOneAndDataInputType';
import createEntityWhereCompoundOneInputType from './createEntityWhereCompoundOneInputType';
import createEntityWhereInputType, {
  createEntityWhereWithoutBooleanOperationsInputType,
} from './createEntityWhereInputType';
import createEntityWhereOneAndDataInputType from './createEntityWhereOneAndDataInputType';
import createEntityWhereOneInputType from './createEntityWhereOneInputType';
import createEntityWherePayloadInputType from './createEntityWherePayloadInputType';
import createEntityWhichUpdatedInputType from './createEntityWhichUpdatedInputType';
import createPaginationInputType from './createPaginationInputType';

// creators of the inputs of an entity that custom actions can use (see "fillInputDicForCustom"), ...
// ... creators of the "Thru" inputs of required duplex fields are added by "composeCreateThruFieldInputCreators"
const inputs = [
  createCopyEntityOptionsInputType,
  createDeleteEntityWithChildrenOptionsInputType,
  createEntityWhereKeyToSourceInputType,
  createEntityCreateInputType,
  createEntityCreateChildInputType,
  createEntityCreateOrPushChildrenInputType,
  createEntityDistinctValuesOptionsInputType,
  createEntityNearInputType,
  createEntityRestrictedWhereAndTargetInputType,
  createEntityRestrictedWhereInputType,
  createEntitySortInputType,
  createEntityTextNamesEnumType,
  createEntityUpdateInputType,
  createEntityWhereAndSearchInputType,
  createEntityWhereByUniqueInputType,
  createEntityWhereCompoundOneAndDataInputType,
  createEntityWhereCompoundOneInputType,
  createEntityWhereInputType,
  createEntityWhereWithoutBooleanOperationsInputType,
  createEntityWhereOneAndDataInputType,
  createEntityWhereOneInputType,
  createEntityWherePayloadInputType,
  createEntityWhichUpdatedInputType,
  createPaginationInputType,
];

export default inputs;
