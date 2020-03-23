// @flow

import React from 'react';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
import TableCell from '@material-ui/core/TableCell';
import WindowScroller from 'react-virtualized/dist/commonjs/WindowScroller';
import Table, { Column } from 'react-virtualized/dist/commonjs/Table';

import Router from 'next/router';

import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';

import type { RouterQuery, ThingConfig } from '../flowTypes';

type Props = {
  columns: Array<Object>,
  headerHeight: number, // eslint-disable-line react/require-default-props
  onRowClick: Function,
  router: { pathname: string, query: RouterQuery },
  rowHeight: number, // eslint-disable-line react/require-default-props
  thingConfig: ThingConfig,
  width: number,
};

type ProvidedProps = {
  classes: Object,
};

const styles = (theme) => ({
  flexContainer: {
    display: 'flex',
    alignItems: 'center',
    boxSizing: 'border-box',
  },
  tableRow: {
    cursor: 'pointer',
  },
  tableRowHover: {
    '&:hover': {
      border: `1px solid ${theme.palette.primary.main}`,
    },
  },
  tableCell: {
    flex: 1,
  },
  noClick: {
    cursor: 'initial',
  },
});

class VirtualizedTable extends React.PureComponent<Props & ProvidedProps> {
  static defaultProps = {
    headerHeight: 48,
    rowHeight: 48,
  };

  getRowClassName = ({ index }) => {
    const { classes } = this.props;

    return clsx(classes.tableRow, classes.flexContainer, {
      [classes.tableRowHover]: index !== -1, // && onRowClick != null,
    });
  };

  cellRenderer = ({ cellData, columnIndex, rowData, rowIndex }) => {
    const {
      columns,
      classes,
      rowHeight,
      onRowClick,
      router: { pathname },
      thingConfig: { name },
    } = this.props;
    if (!columnIndex) {
      return (
        <Tooltip title={`Update ${name}`}>
          <IconButton
            aria-label={`Update ${name}`}
            onClick={() => Router.push({ pathname, query: { thing: name, id: rowData.id } })}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      );
    }

    if (columnIndex === columns.length - 1) {
      return (
        <Tooltip title={`Delete ${name}`}>
          <IconButton
            aria-label={`Delete ${name}`}
            onClick={() => Router.push(`${pathname}?thing=${name}&id=${rowData.id}&delete`)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      );
    }

    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, {
          [classes.noClick]: onRowClick == null,
        })}
        variant="body"
        style={{ height: rowHeight }}
        align={(columnIndex != null && columns[columnIndex].numeric) || false ? 'right' : 'left'}
      >
        {columnIndex > 1 ? cellData : rowIndex + 1}
      </TableCell>
    );
  };

  headerRenderer = ({ label, columnIndex }) => {
    const { headerHeight, columns, classes } = this.props;

    return (
      <TableCell
        component="div"
        className={clsx(classes.tableCell, classes.flexContainer, classes.noClick)}
        variant="head"
        style={{ height: headerHeight }}
        align={columns[columnIndex].numeric || false ? 'right' : 'left'}
      >
        <span>{label}</span>
      </TableCell>
    );
  };

  render() {
    const { classes, columns, width, ...tableProps } = this.props;
    return (
      <WindowScroller>
        {({ height, isScrolling, onChildScroll, scrollTop }) => {
          return (
            <Table
              // eslint-disable-next-line react/jsx-props-no-spreading
              {...tableProps}
              autoHeight
              height={height}
              isScrolling={isScrolling}
              onScroll={onChildScroll}
              scrollTop={scrollTop}
              width={width}
              rowClassName={this.getRowClassName}
            >
              {columns.map(({ dataKey, ...other }, index) => {
                return (
                  <Column
                    key={dataKey}
                    headerRenderer={(headerProps) =>
                      this.headerRenderer({
                        ...headerProps,
                        columnIndex: index,
                      })
                    }
                    className={classes.flexContainer}
                    cellRenderer={this.cellRenderer}
                    dataKey={dataKey}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...other}
                  />
                );
              })}
            </Table>
          );
        }}
      </WindowScroller>
    );
  }
}

export default withStyles(styles)(VirtualizedTable);
