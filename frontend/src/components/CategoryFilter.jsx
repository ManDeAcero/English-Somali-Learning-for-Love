import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CATEGORIES } from '../data/mock';

const CategoryFilter = ({ selectedCategories, onCategoryToggle, onClearAll }) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Filter by category:</span>
        
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            
            return (
              <Button
                key={category.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onCategoryToggle(category.id)}
                className={`transition-all duration-200 ${
                  isSelected 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                    : 'hover:bg-primary/5'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </Button>
            );
          })}
        </div>
        
        {selectedCategories.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear All
          </Button>
        )}
      </div>
      
      {selectedCategories.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Active filters:</span>
          {selectedCategories.map((categoryId) => {
            const category = CATEGORIES.find(c => c.id === categoryId);
            return (
              <Badge key={categoryId} variant="secondary" className="text-xs">
                {category?.icon} {category?.name}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryFilter;