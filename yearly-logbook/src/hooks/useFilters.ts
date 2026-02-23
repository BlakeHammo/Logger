import { useState, useMemo } from 'react';
import type { LogEntry, Category } from '../types';

type SoloFilter = 'all' | 'solo' | 'social';
type DurationUnit = 'hours' | 'days' | 'weeks';

const toHours = (value: number, unit: DurationUnit): number => {
  if (unit === 'days')  return value * 24;
  if (unit === 'weeks') return value * 168;
  return value;
};

export function useFilters(logs: LogEntry[]) {
  // --- Existing filters ---
  const [filterTitle,      setFilterTitle]      = useState('');
  const [filterCategories, setFilterCategories] = useState<Category[]>([]);
  const [filterRatingMin,  setFilterRatingMin]  = useState<number>(1);
  const [filterRatingMax,  setFilterRatingMax]  = useState<number>(5);
  const [filterDateFrom,   setFilterDateFrom]   = useState('');
  const [filterDateTo,     setFilterDateTo]     = useState('');

  // --- New filters ---
  const [filterMoodMin,        setFilterMoodMin]        = useState<number>(1);
  const [filterMoodMax,        setFilterMoodMax]        = useState<number>(5);
  const [filterSolo,           setFilterSolo]           = useState<SoloFilter>('all');
  const [filterDurationMin,    setFilterDurationMin]    = useState('');
  const [filterDurationMinUnit,setFilterDurationMinUnit]= useState<DurationUnit>('hours');

  // All predicates AND-ed. Default/empty value = no restriction on that axis.
  // For mood/solo/duration: entries that never filled in the field are not
  // penalised — they only get filtered out if they DO have the field and fail.
  const filteredLogs = useMemo(() => {
    const dateRangeValid = !filterDateFrom || !filterDateTo || filterDateFrom <= filterDateTo;
    const minHours = filterDurationMin ? toHours(Number(filterDurationMin), filterDurationMinUnit) : null;

    return logs.filter(log => {
      // Title
      if (filterTitle.trim() &&
          !log.title.toLowerCase().includes(filterTitle.trim().toLowerCase())) return false;

      // Category
      if (filterCategories.length > 0 && !filterCategories.includes(log.category)) return false;

      // Rating (always present)
      if (log.rating < filterRatingMin || log.rating > filterRatingMax) return false;

      // Mood (optional field — only filter if log has it)
      if (log.mood !== undefined) {
        if (log.mood < filterMoodMin || log.mood > filterMoodMax) return false;
      }

      // Solo/social (optional field — only filter if log has it)
      if (filterSolo !== 'all' && log.solo !== undefined) {
        if (filterSolo === 'solo'   && !log.solo) return false;
        if (filterSolo === 'social' &&  log.solo) return false;
      }

      // Duration min (optional field — only filter if log has it)
      if (minHours !== null && log.duration !== undefined && log.durationUnit) {
        if (toHours(log.duration, log.durationUnit) < minHours) return false;
      }

      // Date range
      const logDay = log.date.slice(0, 10);
      if (dateRangeValid && filterDateFrom && logDay < filterDateFrom) return false;
      if (dateRangeValid && filterDateTo   && logDay > filterDateTo)   return false;

      return true;
    });
  }, [
    logs,
    filterTitle, filterCategories,
    filterRatingMin, filterRatingMax,
    filterMoodMin, filterMoodMax,
    filterSolo,
    filterDurationMin, filterDurationMinUnit,
    filterDateFrom, filterDateTo,
  ]);

  // Set for O(1) membership checks in PhaserGame.
  const visibleLogIds = useMemo(
    () => new Set(filteredLogs.map(l => l.id)),
    [filteredLogs]
  );

  const isFilterActive = useMemo(() =>
    filterTitle.trim() !== '' ||
    filterCategories.length > 0 ||
    filterRatingMin !== 1 || filterRatingMax !== 5 ||
    filterMoodMin  !== 1 || filterMoodMax  !== 5 ||
    filterSolo !== 'all' ||
    filterDurationMin !== '' ||
    filterDateFrom !== '' || filterDateTo !== ''
  , [
    filterTitle, filterCategories,
    filterRatingMin, filterRatingMax,
    filterMoodMin, filterMoodMax,
    filterSolo, filterDurationMin,
    filterDateFrom, filterDateTo,
  ]);

  // groupedLogs derives from filteredLogs so Entries narrows automatically.
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
    setFilterRatingMin(1);  setFilterRatingMax(5);
    setFilterMoodMin(1);    setFilterMoodMax(5);
    setFilterSolo('all');
    setFilterDurationMin(''); setFilterDurationMinUnit('hours');
    setFilterDateFrom('');  setFilterDateTo('');
  };

  // Targeted clear used when jumping to a calendar date.
  const clearDateFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  return {
    // Raw state
    filterTitle,      setFilterTitle,
    filterCategories, toggleCategoryFilter,
    filterRatingMin,  setFilterRatingMin,
    filterRatingMax,  setFilterRatingMax,
    filterMoodMin,    setFilterMoodMin,
    filterMoodMax,    setFilterMoodMax,
    filterSolo,       setFilterSolo,
    filterDurationMin,    setFilterDurationMin,
    filterDurationMinUnit,setFilterDurationMinUnit,
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
