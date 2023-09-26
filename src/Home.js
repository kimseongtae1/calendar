// Home.js
import React from 'react';
import { Link } from 'react-router-dom'; // react-router-dom의 Link를 불러옵니다.

function Home() {
  return (
    <div className="Home">
      <h1>Welcome to My App</h1>
      <p>This is the home screen.</p>

      {/* App.js로 이동하는 링크를 추가합니다. */}
      <Link to="/app">Go to App</Link>
    </div>)
}

export default Home;
