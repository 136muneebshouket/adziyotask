"use client";
import React, { useEffect, useState } from "react";

const Search = () => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  const fetchSearchResults = async () => {
    if (!searchQuery) return;
    let text = searchQuery.trim().toLowerCase();
    setLoading(true);
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${text}?fullText=true`
      );
      const data = await response.json();
      setResults(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSearchResults();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="mx-auto flex flex-col gap-4">
      <h1>type your country name</h1>
      <input
        type="text"
        className="border border-gray-300 rounded p-2"
        onChange={handleSearch}
        placeholder="Search"
      />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {results?.length > 0 ? (
            results?.map((result: any) => (
              <div key={result?.name?.common}> {result?.name?.common || 'No country found'}  , {result?.capital[0] || 'No capital found'}</div>
            ))
          ) : (
            <div>No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
