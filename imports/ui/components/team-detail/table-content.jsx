import React, { Component } from 'react';
import {Table, Column, Cell} from 'fixed-data-table';
import { Icon, Popover, Form, Input, Select, Modal, Button, Row, Col } from 'antd';
import update from 'react-addons-update';
import ReactDataGrid from 'react-data-grid';
import { Editors, Toolbar, Formatters, DraggableHeader, Draggable, Data } from 'react-data-grid-addons';
import faker from 'faker';

const { AutoComplete: AutoCompleteEditor, DropDownEditor } = Editors;
const { ImageFormatter } = Formatters;
const { DraggableContainer } = DraggableHeader;
const { RowActionsCell, DropTargetRowContainer, Container  } = Draggable;
const { Selectors } = Data;
const RowRenderer = DropTargetRowContainer(ReactDataGrid.Row);
const FormItem = Form.Item;


faker.locale = 'en_GB';

export default class ResizeExample extends Component {
  constructor(props) {
    super(props);
    const counties = [
      { id: 0, title: 'Bedfordshire'},
      { id: 1, title: 'Berkshire'},
      { id: 2, title: 'Buckinghamshire'},
      { id: 3, title: 'Cambridgeshire'},
      { id: 4, title: 'Cheshire'},
      { id: 5, title: 'Cornwall'},
      { id: 6, title: 'Cumbria, (Cumberland)'},
      { id: 7, title: 'Derbyshire'},
      { id: 8, title: 'Devon'},
      { id: 9, title: 'Dorset'},
      { id: 10, title: 'Durham'},
      { id: 11, title: 'Essex'},
      { id: 12, title: 'Gloucestershire'},
      { id: 13, title: 'Hampshire'},
      { id: 14, title: 'Hertfordshire'},
      { id: 15, title: 'Huntingdonshire'},
      { id: 16, title: 'Kent'},
      { id: 17, title: 'Lancashire'},
      { id: 18, title: 'Leicestershire'},
      { id: 19, title: 'Lincolnshire'},
      { id: 20, title: 'Middlesex'},
      { id: 21, title: 'Norfolk'},
      { id: 22, title: 'Northamptonshire'},
      { id: 23, title: 'Northumberland'},
      { id: 24, title: 'Nottinghamshire'},
      { id: 25, title: 'Northamptonshire'},
      { id: 26, title: 'Oxfordshire'},
      { id: 27, title: 'Northamptonshire'},
      { id: 28, title: 'Rutland'},
      { id: 29, title: 'Shropshire'},
      { id: 30, title: 'Somerset'},
      { id: 31, title: 'Staffordshire'},
      { id: 32, title: 'Suffolk'},
      { id: 33, title: 'Surrey'},
      { id: 34, title: 'Sussex'},
      { id: 35, title: 'Warwickshire'},
      { id: 36, title: 'Westmoreland'},
      { id: 37, title: 'Wiltshire'},
      { id: 38, title: 'Worcestershire'},
      { id: 39, title: 'Yorkshire'}
    ];
    const titles = ['Dr.', 'Mr.', 'Mrs.', 'Miss', 'Ms.'];

    this.state = {
      rows: this.createRows(5),
      selectedIds: [1, 2],
      columns : [
        {
          key: 'id',
          width: 1,
          name: 'ID',
          hidden: true
        },
        {
          key: 'name',
          name: 'Name',
          editable: true,
          width: 200,
          resizable: true,
          draggable: true
        },
        {
          key: 'notes',
          name: 'Notes',
          editor: <AutoCompleteEditor options={counties}/>,
          width: 200,
          resizable: true,
          draggable: true,
        },
        {
          key: 'attachments',
          name: 'Attachments',
          editor: <DropDownEditor options={titles}/>,
          width: 200,
          resizable: true,
          draggable: true,
          events: {
            onDoubleClick: function() {
              console.log('The user double clicked on title column');
            }
          }
        },
        {
          key: 'add',
          name: <Icon  type="plus"/>,
          width: 100,
          hidden: true
        }
      ]
    }
  }

  createRows(numberOfRows) {
    let rows = [];
    for (let i = 0; i < numberOfRows; i++) {
      rows[i] = this.createFakeRowObjectData(i);
    }
    return rows;
  }

  createFakeRowObjectData(index) {
    return {
      id: index+1,
      name: faker.name.firstName(),
      notes: faker.address.county(),
      attachments: faker.image.avatar(),
    };
  }

  getRowAt(index) {
    if (index < 0 || index > this.getSize()) {
      return undefined;
    }

    return this.state.rows[index];
  }

  getSize() {
    return this.state.rows.length;
  }


  handleGridRowsUpdated({ fromRow, toRow, updated }) {
    let rows = this.state.rows.slice();

    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = rows[i];
      let updatedRow = update(rowToUpdate, {$merge: updated});
      rows[i] = updatedRow;
    }

    this.setState({ rows });
  }

  onHeaderDrop(source, target) {
    const stateCopy = Object.assign({}, this.state);
    const columnSourceIndex = this.state.columns.findIndex(
      i => i.key === source
    );
    const columnTargetIndex = this.state.columns.findIndex(
      i => i.key === target
    );

    stateCopy.columns.splice(
      columnTargetIndex,
      0,
      stateCopy.columns.splice(columnSourceIndex, 1)[0]
    );

    const emptyColumns = Object.assign({},this.state, { columns: [] });
    this.setState(
      emptyColumns
    );

    const reorderedColumns = Object.assign({},this.state, { columns: stateCopy.columns });
    this.setState(
      reorderedColumns
    );
  }

  //const draggable row
  rowGetter(i) {
    return this.state.rows[i];
  }

  isDraggedRowSelected(selectedRows, rowDragSource) {
    if (selectedRows && selectedRows.length > 0) {
      let key = 'id';
      return selectedRows.filter(r => r[key] === rowDragSource.data[key]).length > 0;
    }
    return false;
  }

  reorderRows(e) {
    let selectedRows = Selectors.getSelectedRowsByKey({rowKey: 'id', selectedKeys: this.state.selectedIds, rows: this.state.rows});
    let draggedRows = this.isDraggedRowSelected(selectedRows, e.rowSource) ? selectedRows : [e.rowSource.data];
    let undraggedRows = this.state.rows.filter(function(r) {
      return draggedRows.indexOf(r) === -1;
    });
    let args = [e.rowTarget.idx, 0].concat(draggedRows);
    Array.prototype.splice.apply(undraggedRows, args);
    this.setState({rows: undraggedRows});
  }

  onRowsSelected(rows) {
    this.setState({selectedIds: this.state.selectedIds.concat(rows.map(r => r.row['id']))});
  }

  onRowsDeselected(rows) {
    let rowIds = rows.map(r =>  r.row['id']);
    this.setState({selectedIds: this.state.selectedIds.filter(i => rowIds.indexOf(i) === -1 )});
  }

  onRowExpandToggle(args) {
    let expandedRows = Object.assign({}, this.state.expandedRows);
    expandedRows[args.columnGroupName] = Object.assign({}, expandedRows[args.columnGroupName]);
    expandedRows[args.columnGroupName][args.name] = { isExpanded: args.shouldExpand };
    this.setState({expandedRows: expandedRows});
  }

  render() {
    return (
      <DraggableContainer
        onHeaderDrop={this.onHeaderDrop.bind(this)}>
        <ReactDataGrid
          ref={ node => this.grid = node }
          enableCellSelect={true}
          enableDragAndDrop={true}
          columns={this.state.columns}
          rowGetter={this.getRowAt.bind(this)}
          rowsCount={this.getSize()}
          onGridRowsUpdated={this.handleGridRowsUpdated.bind(this)}
          onRowExpandToggle={this.onRowExpandToggle.bind(this)}
          enableRowSelect={true}
          rowHeight={35}
          minHeight={600}
          rowScrollTimeout={200}
          rowActionsCell={RowActionsCell}
          rowRenderer={<RowRenderer onRowDrop={this.reorderRows.bind(this)}/>}
          rowSelection={{
            showCheckbox: true,
            enableShiftSelect:  true,
            onRowsSelected: this.onRowsSelected.bind(this),
            onRowsDeselected: this.onRowsDeselected.bind(this),
            selectBy: {
              keys: {rowKey: 'id', values: this.state.selectedIds}
            }
          }}
        />
      </DraggableContainer>
    );
  }
}
