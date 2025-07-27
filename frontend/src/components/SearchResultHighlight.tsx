import React from 'react';
import { Typography, Box } from '@mui/material';

interface SearchResultHighlightProps {
  text: string;
  searchQuery: string;
  maxLength?: number;
}

export const SearchResultHighlight: React.FC<SearchResultHighlightProps> = ({
  text,
  searchQuery,
  maxLength = 150
}) => {
  if (!searchQuery.trim()) {
    return (
      <Typography variant="body2" color="text.secondary">
        {text.length > maxLength ? `${text.substring(0, maxLength)}...` : text}
      </Typography>
    );
  }

  // Create highlighted version of text
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => {
      if (part.toLowerCase() === query.toLowerCase()) {
        return (
          <Box
            key={index}
            component="span"
            sx={{
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              padding: '0 2px',
              borderRadius: '2px',
              fontSize: 'inherit'
            }}
          >
            {part}
          </Box>
        );
      }
      return part;
    });
  };

  // Create snippet around the match
  const createSnippet = (text: string, query: string, maxLength: number) => {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1 || text.length <= maxLength) {
      return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    }

    // Calculate snippet boundaries
    const start = Math.max(0, index - Math.floor((maxLength - query.length) / 2));
    const end = Math.min(text.length, start + maxLength);
    
    let snippet = text.substring(start, end);
    
    // Add ellipsis if needed
    if (start > 0) snippet = '...' + snippet;
    if (end < text.length) snippet = snippet + '...';

    return snippet;
  };

  const snippet = createSnippet(text, searchQuery, maxLength);

  return (
    <Typography variant="body2" color="text.secondary">
      {highlightText(snippet, searchQuery)}
    </Typography>
  );
};