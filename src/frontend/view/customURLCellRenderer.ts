/**
 * Custom Cell Renderer for AgGrid URL Column Cells.
 *
 * AgGrid, by default, does not support opening links within its cells using keyboard navigation (Tab/Arrow keys/Enter key). This limitation hinders accessibility, particularly for users with disabilities who rely on keyboard navigation.
 *
 * This custom cell renderer addresses the issue by redirecting focus to the anchor (<a>) element within a cell when the cell gains focus. Consequently, when a user navigates to a link cell and presses the Enter key, the link is activated and opened.
 *
 * About cell renderers: https://www.ag-grid.com/javascript-data-grid/component-cell-renderer/
 */

export class URLCellRenderer {
  eGui
  params

  init(params) {
    this.params = params
    this.eGui = document.createElement('div')
    this.eGui.innerHTML = `<a class="govuk-link" key=${this.getUniqueKey()} href="${
      params.value
    }">${params.value}</a>`
    this.registerEventsListeners()
  }

  registerEventsListeners() {
    document.addEventListener('keydown', (event) => {
      if (
        !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(
          event.key
        )
      ) {
        return
      }
      const {
        colDef: { field },
        rowIndex,
      } = this.params
      const focusedCell = this.params.api.getFocusedCell()
      if (
        focusedCell?.column.getColId() === field &&
        focusedCell?.rowIndex === rowIndex
      ) {
        const innerLink = document.querySelector(
          `a[key="${this.getUniqueKey()}"]`
        )
        if (innerLink instanceof HTMLElement) {
          innerLink.focus()
        }
      }
    })
  }

  getUniqueKey = () => {
    return `${this.params.column.getColId()}-${this.params.rowIndex}`
  }

  getGui() {
    return this.eGui
  }

  refresh() {
    return false
  }
}
