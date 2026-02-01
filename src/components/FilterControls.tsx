import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';
import { useDispatch, useSelector } from 'react-redux'; 
import { setStatusFilter, setPriorityFilter, setSearchQuery, setSortBy, selectFilter } from '../app/filterSlice';
import { colors, spacing, borderRadius } from '../theme';
import { TaskPriority } from '../types';

export const FilterControls = () => {
  const dispatch = useDispatch();
  const { status, priority, searchQuery, sortBy } = useSelector(selectFilter);

  const FilterChip = ({ 
    label, 
    isActive, 
    onPress 
  }: { label: string, isActive: boolean, onPress: () => void }) => (
    <TouchableOpacity
      style={[styles.chip, isActive && styles.chipActive]}
      onPress={onPress}
    >
      <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Search size={20} color={colors.text.secondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search tasks..."
          value={searchQuery}
          onChangeText={(text) => dispatch(setSearchQuery(text))}
          placeholderTextColor={colors.text.secondary}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={{ paddingRight: 20, alignItems: 'center' }}>
        <Text style={styles.sectionLabel}>Status:</Text>
        <FilterChip 
          label="All" 
          isActive={status === 'all'} 
          onPress={() => dispatch(setStatusFilter('all'))} 
        />
        <FilterChip 
          label="Pending" 
          isActive={status === 'pending'} 
          onPress={() => dispatch(setStatusFilter('pending'))} 
        />
        <FilterChip 
          label="Done" 
          isActive={status === 'completed'} 
          onPress={() => dispatch(setStatusFilter('completed'))} 
        />

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>Priority:</Text>
        <FilterChip 
          label="All" 
          isActive={priority === 'all'} 
          onPress={() => dispatch(setPriorityFilter('all'))} 
        />
        {(['high', 'medium', 'low'] as TaskPriority[]).map(p => (
           <FilterChip 
           key={p}
           label={p.charAt(0).toUpperCase() + p.slice(1)} 
           isActive={priority === p} 
           onPress={() => dispatch(setPriorityFilter(p))} 
         />
        ))}

         <View style={styles.divider} />
         
         <Text style={styles.sectionLabel}>Sort:</Text>
         <FilterChip 
          label="Newest" 
          isActive={sortBy === 'createdAt'} 
          onPress={() => dispatch(setSortBy('createdAt'))} 
        />
         <FilterChip 
          label="Deadline" 
          isActive={sortBy === 'deadline'} 
          onPress={() => dispatch(setSortBy('deadline'))} 
        />

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    paddingBottom: spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2, 
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    margin: spacing.m,
    borderRadius: borderRadius.m,
    paddingHorizontal: spacing.s,
  },
  searchIcon: {
    marginRight: spacing.s,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: colors.text.primary,
  },
  chipsScroll: {
    paddingHorizontal: spacing.m,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text.secondary,
    alignSelf: 'center',
    marginRight: spacing.s,
    marginLeft: spacing.xs,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.round,
    backgroundColor: colors.background,
    marginRight: spacing.s,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: colors.primary + '20', 
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginRight: spacing.s,
  },
});