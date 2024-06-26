const AccessDenied = () => {
  return (
    <div
      className="access-denied"
      style={{
        backgroundImage: `url(https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEh3v0Ys1encYN2Cu6D5ZwLA-SFEHCgaqdITzpKXEEXs8dqv9wzeABSDAHehIKb3I3PV6JFJ55qL8U9XlK6s01nt9VVrtiR8acXbU1DzZIwlaq9ykK76_Tr-MTyLcX7B6HiuTiYn9cF16EEOQqgA9fRscvBJEyfAquXXzxPcQ8dy_uSFruWusC6mIQL6jykt/w640-h302/2024-06-21%2021_14_24-Settings.png)`,
      }}
    >
      <div className="ad-overlay">
        <div className="ad-message">
          <div className="ad-symbol">🚫</div>
          <div className="ad-text">
            <h1>Access Restricted</h1>
            <p>Please Contact Supreme Alpha</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
