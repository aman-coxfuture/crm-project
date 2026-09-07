import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, Plus, ArrowUpDown, ChevronDown } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import Pagination from './Pagination';
import EmptyState from '../common/EmptyState';

export default function DataTable({
  columns = [],
  data = [],
  searchPlaceholder = 'Search records...',
  searchKeys = [],
  filters = [], // [{ key: 'status', label: 'Status', options: ['Active', 'Inactive'] }]
  onAdd,
  addLabel = 'Add New',
  onExport,
  exportLabel = 'Export',
  pageSize = 8,
  title,
  subtitle,
  actions,
  emptyTitle,
  emptyDescription,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterValues, setFilterValues] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleFilterChange = (filterKey, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [filterKey]: value,
    }));
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const keysToSearch = searchKeys.length > 0 ? searchKeys : Object.keys(item);
        const matchesSearch = keysToSearch.some((k) => {
          const val = item[k];
          return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
        });
        if (!matchesSearch) return false;
      }

      // Filter matching
      for (const [filterKey, filterVal] of Object.entries(filterValues)) {
        if (filterVal && item[filterKey] !== filterVal) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchQuery, searchKeys, filterValues]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleExportCSV = () => {
    if (onExport) {
      onExport(sortedData);
      return;
    }
    // Default CSV export
    const headers = columns.map((c) => c.label).join(',');
    const rows = sortedData.map((row) =>
      columns.map((c) => `"${String(row[c.key] || '').replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title ? title.toLowerCase().replace(/\s+/g, '_') : 'export'}_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header bar */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          {title && <h2 className="card-title" style={{ fontSize: '16px', fontWeight: 600 }}>{title}</h2>}
          {subtitle && <p className="text-xs text-muted" style={{ marginTop: '2px' }}>{subtitle}</p>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onExport !== false && (
            <Button variant="secondary" size="sm" icon={Download} onClick={handleExportCSV}>
              {exportLabel}
            </Button>
          )}
          {onAdd && (
            <Button variant="primary" size="sm" icon={Plus} onClick={onAdd}>
              {addLabel}
            </Button>
          )}
          {actions}
        </div>
      </div>

      {/* Filter / Search toolbar */}
      <div
        style={{
          padding: '12px 20px',
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ flex: '1', minWidth: '220px', maxWidth: '360px' }}>
          <div className="input-with-icon">
            <Search size={15} />
            <input
              type="text"
              className="form-input"
              style={{ padding: '6px 12px 6px 32px', fontSize: '13px', backgroundColor: '#ffffff' }}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {filters.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {filters.map((f) => (
              <div key={f.key} style={{ minWidth: '140px' }}>
                <select
                  className="form-select"
                  style={{ padding: '6px 10px', fontSize: '12.5px', backgroundColor: '#ffffff' }}
                  value={filterValues[f.key] || ''}
                  onChange={(e) => handleFilterChange(f.key, e.target.value)}
                >
                  <option value="">All {f.label}</option>
                  {f.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table content */}
      <div className="table-responsive" style={{ border: 'none', borderRadius: 0 }}>
        {paginatedData.length === 0 ? (
          <div style={{ padding: '24px' }}>
            <EmptyState
              title={emptyTitle || 'No records found'}
              description={
                emptyDescription ||
                (searchQuery || Object.values(filterValues).some(Boolean)
                  ? 'No results match your active search and filter settings.'
                  : 'Get started by creating your first entry.')
              }
              actionLabel={onAdd ? addLabel : undefined}
              onAction={onAdd}
              actionIcon={Plus}
            />
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      cursor: col.sortable !== false ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{col.label}</span>
                      {col.sortable !== false && (
                        <ArrowUpDown
                          size={12}
                          style={{
                            opacity: sortConfig.key === col.key ? 1 : 0.4,
                            color: sortConfig.key === col.key ? '#111827' : 'inherit',
                          }}
                        />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr key={row.id || index}>
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.render ? col.render(row, index) : row[col.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {filteredData.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={filteredData.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
