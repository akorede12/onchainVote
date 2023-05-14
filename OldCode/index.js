import React, { useState, useEffect } from 'react';

const IndexPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(error => setError(error));
  }, []);

  if (error) {
    return <div>An error occurred: {error.message}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Data from https://rpc-mumbai.matic.today</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default IndexPage;
