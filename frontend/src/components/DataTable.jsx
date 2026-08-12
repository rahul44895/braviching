import '../styles/table.css';

// Generic data table: columns = [{ key, header, render?(row) }]. Wrapped in a horizontal-scroll
// container rather than trying to reflow columns on narrow screens (see brainstorm decision).
export function DataTable({
  columns,
  rows,
  keyField = 'id',
  loading,
  emptyMessage = 'No records yet.',
}) {
  return (
    <div className="scroll-x">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                Loading…
              </td>
            </tr>
          )}
          {!loading && rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="data-table__empty">
                {emptyMessage}
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => (
              <tr key={row[keyField]}>
                {columns.map((col) => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
