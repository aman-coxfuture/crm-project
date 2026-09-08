import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Filter,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export default function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  filterOptions = [], // [{ label: 'Class', key: 'class', options: ['All', '10', '9'] }]
  pageSize = 8,
  actions,
  title,
  subtitle,
  emptyMessage = 'No records found',
  onRowClick,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'All' ? '' : value,
    }));
    setCurrentPage(1);
  };

  // Filter and search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search matching
      const matchesSearch =
        !searchTerm ||
        (searchKeys.length > 0
          ? searchKeys.some((k) =>
              String(item[k] || '')
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            )
          : Object.values(item).some((v) =>
              String(v || '')
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            ));

      if (!matchesSearch) return false;

      // Dropdown filters
      for (const [filterKey, filterVal] of Object.entries(filters)) {
        if (filterVal && String(item[filterKey]) !== String(filterVal)) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, searchKeys, filters]);

  // Sort
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      const comp = aVal < bVal ? -1 : 1;
      return sortConfig.direction === 'asc' ? comp : -comp;
    });
  }, [filteredData, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const exportCSV = () => {
    if (data.length === 0) return;
    const headers = columns.map((c) => `"${c.header}"`).join(',');
    const rows = sortedData.map((item) =>
      columns.map((c) => `"${item[c.accessor] || ''}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title || 'export'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Table Toolbar */}
      <div
        style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
        }}
      >
        <div>
          {title && (
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {subtitle}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-tertiary)',
              }}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="form-input"
              style={{ paddingLeft: '36px', paddingRight: '12px', height: '38px', fontSize: '0.825rem' }}
            />
          </div>

          {/* Dynamic Filters */}
          {filterOptions.map((opt) => (
            <div key={opt.key} style={{ minWidth: '130px' }}>
              <select
                className="form-select"
                style={{ height: '38px', fontSize: '0.825rem' }}
                value={filters[opt.key] || 'All'}
                onChange={(e) => handleFilterChange(opt.key, e.target.value)}
              >
                <option value="All">{opt.label}: All</option>
                {opt.options.map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Export Action */}
          <button
            className="btn btn-secondary btn-sm"
            style={{ height: '38px' }}
            onClick={exportCSV}
            title="Export CSV"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          {/* Action button passed in */}
          {actions}
        </div>
      </div>

      {/* Table Element */}
      <div className="table-container" style={{ border: 'none', borderRadius: '0' }}>
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.accessor || col.header}
                  style={{
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    ...col.style,
                  }}
                  onClick={() => col.sortable && handleSort(col.accessor)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span style={{ color: 'var(--text-tertiary)' }}>
                        {sortConfig.key === col.accessor ? (
                          sortConfig.direction === 'asc' ? (
                            <ArrowUp size={13} color="var(--primary)" />
                          ) : (
                            <ArrowDown size={13} color="var(--primary)" />
                          )
                        ) : (
                          <ArrowUpDown size={13} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-tertiary)' }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        padding: '14px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      <Filter size={24} />
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{emptyMessage}</div>
                    <p style={{ fontSize: '0.8rem' }}>Try clearing filters or search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  onClick={() => onRowClick?.(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <td key={col.accessor || col.header} style={col.cellStyle}>
                      {col.render
                        ? col.render(row[col.accessor], row)
                        : col.isStatus
                        ? <StatusBadge status={row[col.accessor]} />
                        : row[col.accessor] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div
        style={{
          padding: '14px 22px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          backgroundColor: 'var(--bg-tertiary)',
          fontSize: '0.825rem',
          color: 'var(--text-secondary)',
        }}
      >
        <div>
          Showing {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ padding: '4px 10px' }}
          >
            <ChevronLeft size={14} />
            <span>Prev</span>
          </button>

          <span style={{ padding: '0 8px', fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            style={{ padding: '4px 10px' }}
          >
            <span>Next</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
