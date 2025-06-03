import React from 'react';
import styled from 'styled-components';

const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
`;

const Label = styled.label`
  font-size: 1.1rem;
  color: white;
  margin-bottom: 10px;
  font-weight: 500;
`;

const Select = styled.select`
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 25px;
  border: none;
  background-color: white;
  color: #4c51bf;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(76, 81, 191, 0.3);
  }

  option {
    padding: 10px;
  }
`;

function CategorySelector({ categories, selectedCategory, onCategoryChange }) {
  return (
    <SelectorContainer>
      <Label htmlFor="category-select">Оберіть категорію:</Label>
      <Select
        id="category-select"
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value="all">Всі категорії</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </option>
        ))}
      </Select>
    </SelectorContainer>
  );
}

export default CategorySelector;