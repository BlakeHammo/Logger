import { useState, useMemo } from 'react';
import type { LogEntry, Category } from '../types';

export function useFilters(logs: LogEntry[]) {
  const [filterTitle,      setFilterTitle]      = useState('');
  const [filterCategories, setFilterCategories] = useState<Category[]>([]);
  const [filterRatingMin,  setFilterRatingMin]  = useState<number>(1);
  const [filterRatingMax,  setFilterRatingMax]  = useState<number>(5);
  const [filterDateFrom,   setFilterDateFrom]   = useState('');
  const [filterDateTo,     setFilterDateTo]     = useState('');

  // All four predicates AND-ed. An empty/default value means no restriction.
  const filteredLogs = useMemo(() => {
    const dateRangeValid = !filterDateFrom || !filterDateTo || filterDateFrom <= filterDateTo;

    return logs.filter(log => {
      if (filterTitle.trim() &&
          !log.title.toLowerCase().includes(filterTitle.trim().toLowerCase())) return false;
      if (filterCategories.length > 0 && !filterCategories.includes(log.category)) return false;
      if (log.rating < filterRatingMin || log.rating > filterRatingMax) return false;
      const logDay = log.date.slice(0, 10);
      if (dateRangeValid && filterDateFrom && logDay < filterDateFrom) return false;
      if (dateRangeValid && filterDateTo   && logDay > filterDateTo)   return false;
      return true;
    });
  }, [logs, filterTitle, filterCategories, filterRatingMin, filterRatingMax, filterDateFrom, filterDateTo]);

  // Set for O(1) membership checks in PhaserGame.
  const visibleLogIds = useMemo(
    () => new Set(filteredLogs.map(l => l.id)),
    [filteredLogs]
  );

  const isFilterActive = useMemo(() =>
    filterTitle.trim() !== '' ||
    filterCategories.length > 0 ||
    filterRatingMin !== 1 ||
    filterRatingMax !== 5 ||
    filterDateFrom !== '' ||
    filterDateTo !== ''
  , [filterTitle, filterCategories, filterRatingMin, filterRatingMax, filterDateFrom, filterDateTo]);

  // groupedLogs is a filter concern: it derives from filteredLogs so the
  // Entries list narrows automatically whenever any filter changes.
  const groupedLogs = useMemo(() => {
    const grouped: Record<string, Record<string, LogEntry[]>> = {};
    const sorted = [...filteredLogs].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    sorted.forEach(log => {
      const date = new Date(log.date);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const dayKey    = date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });

      if (!grouped[monthYear]) grouped[monthYear] = {};
      if (!grouped[monthYear][dayKey]) grouped[monthYear][dayKey] = [];
      grouped[monthYear][dayKey].push(log);
    });

    return grouped;
  }, [filteredLogs]);

  const toggleCategoryFilter = (cat: Category) =>
    setFilterCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );

  const clearFilters = () => {
    setFilterTitle('');
    setFilterCategories([]);
    setFilterRatingMin(1);
    setFilterRatingMax(5);
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  // Targeted clear used when jumping to a calendar date — only removes date
  // filters that would hide the destination day; other filters are preserved.
  const clearDateFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  return {
    // Raw state — needed by the filter bar UI
    filterTitle,      setFilterTitle,
    filterCategories, toggleCategoryFilter,
    filterRatingMin,  setFilterRatingMin,
    filterRatingMax,  setFilterRatingMax,
    filterDateFrom,   setFilterDateFrom,
    filterDateTo,     setFilterDateTo,
    // Derived
    filteredLogs,
    visibleLogIds,
    isFilterActive,
    groupedLogs,
    // Actions
    clearFilters,
    clearDateFilters,
  };
}
