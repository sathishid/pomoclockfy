import React, { useState, useRef, useEffect } from 'react';
import './TagInput.css';

/**
 * Tag Input Component
 * 
 * Features:
 * - Type to search existing tags or create new ones
 * - Chiplet display of selected tags
 * - Remove tags with delete button
 * - Autocomplete suggestions
 * 
 * Props:
 * - value: array of tag strings
 * - onChange: (tags: string[]) => void
 * - placeholder: string (optional)
 * - existingTags: array of all available tags (optional)
 */
const TagInput = ({ 
  value = [], 
  onChange, 
  placeholder = 'Add tags...',
  existingTags = []
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }

    const lowerInput = inputValue.toLowerCase();
    const filtered = existingTags.filter(tag => 
      tag.toLowerCase().includes(lowerInput) && 
      !value.includes(tag)
    );
    
    // Add option to create new tag if it doesn't exist
    if (!existingTags.includes(inputValue) && inputValue.trim() !== '') {
      filtered.unshift(inputValue);
    }
    
    setSuggestions(filtered);
    setShowSuggestions(true);
  }, [inputValue, existingTags, value]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddTag = (tag) => {
    if (tag.trim() && !value.includes(tag)) {
      const newTags = [...value, tag.trim()];
      onChange(newTags);
      setInputValue('');
      setSuggestions([]);
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      // Remove last tag when backspace is pressed with empty input
      const newTags = value.slice(0, -1);
      onChange(newTags);
    }
  };

  return (
    <div className="tag-input-container">
      <div className="tag-input-field">
        <div className="tags-display">
          {value.map(tag => (
            <span key={tag} className="tag-chip">
              {tag}
              <button
                type="button"
                className="tag-remove"
                onClick={() => handleRemoveTag(tag)}
                title="Remove tag"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={value.length === 0 ? placeholder : ''}
          className="tag-input"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div ref={suggestionsRef} className="tag-suggestions">
          {suggestions.map((tag, idx) => (
            <div
              key={idx}
              className={`tag-suggestion ${tag === inputValue ? 'new-tag' : ''}`}
              onClick={() => handleAddTag(tag)}
            >
              {tag === inputValue ? (
                <>
                  <span className="tag-icon">+</span>
                  <span>Create new: <strong>{tag}</strong></span>
                </>
              ) : (
                tag
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagInput;
