import { LocalStorage } from '../utils';

const AccessDenied = () => {
  const handleButtonClick = () => {
    LocalStorage.clear();
  };

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
            <h1>Account Disabled</h1>
            <p>Please contact your account admin</p>
          </div>
        </div>
        <a
          href="/"
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
          onClick={handleButtonClick}
        >
          Go to Login
        </a>
      </div>
    </div>
  );
};

export default AccessDenied;
