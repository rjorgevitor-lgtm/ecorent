import { useState, useEffect, useCallback } from 'react';
import pb from '@/lib/pocketbaseClient';

export function useItemSearch() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const perPage = 12;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let filter = 'status = "Disponível"';
      
      if (searchQuery) {
        filter += ` && title ~ "${searchQuery}"`;
      }
      
      if (selectedCategory) {
        filter += ` && category = "${selectedCategory}"`;
      }

      const result = await pb.collection('items').getList(currentPage, perPage, {
        filter,
        sort: '-created',
        $autoCancel: false
      });

      setItems(result.items);
      setTotalPages(result.totalPages);
      setTotalItems(result.totalItems);
    } catch (err) {
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, currentPage]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    items,
    loading,
    error,
    searchQuery,
    selectedCategory,
    currentPage,
    totalPages,
    totalItems,
    handleSearch,
    handleCategoryChange,
    handlePageChange,
    refetch: fetchItems
  };
}