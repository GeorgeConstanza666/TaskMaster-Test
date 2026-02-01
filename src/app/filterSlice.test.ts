import filterReducer, {
  setStatusFilter,
  setPriorityFilter,
  setSearchQuery,
  setSortBy,
  resetFilters
} from './filterSlice';

describe('filter reducer', () => {
  const initialState = {
    status: 'all' as const,
    priority: 'all' as const,
    searchQuery: '',
    sortBy: 'createdAt' as const,
  };

  it('should handle initial state', () => {
    expect(filterReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setStatusFilter', () => {
    const actual = filterReducer(initialState, setStatusFilter('completed'));
    expect(actual.status).toEqual('completed');
  });

  it('should handle setPriorityFilter', () => {
    const actual = filterReducer(initialState, setPriorityFilter('high'));
    expect(actual.priority).toEqual('high');
  });

  it('should handle setSearchQuery', () => {
    const actual = filterReducer(initialState, setSearchQuery('milk'));
    expect(actual.searchQuery).toEqual('milk');
  });

  it('should handle setSortBy', () => {
    const actual = filterReducer(initialState, setSortBy('deadline'));
    expect(actual.sortBy).toEqual('deadline');
  });

  it('should handle resetFilters', () => {
    const dirtyState = {
      status: 'completed',
      priority: 'high',
      searchQuery: 'test',
      sortBy: 'deadline',
    };
    
    const actual = filterReducer(dirtyState as any, resetFilters());
    expect(actual).toEqual(initialState);
  });
});