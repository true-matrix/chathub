import LOAD_GIF from "../assets/images/giff-logo.gif";

const Loader = () => {
  return (
    <div id="loaderbackground">
      <div
        id="loaderlogocontainer"
        style={{ backgroundColor: 'transparent' }}
      >
        <div>
          <img
            src={LOAD_GIF}
            alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        {/* <div className="loader" style={{ left: '0.5vh', top: '0', height: '0.5vh', width: '0', animation: 'slide1 1s linear forwards infinite' }}></div>
        <div className="loader" style={{ right: '0', top: '0.5vh', width: '0.5vh', height: '0', animation: 'slide2 1s linear forwards infinite', animationDelay: '0.5s' }}></div>
        <div className="loader" style={{ right: '0.5vh', bottom: '0', height: '0.5vh', width: '0', animation: 'slide3 1s linear forwards infinite' }}></div>
        <div className="loader" style={{ left: '0', bottom: '0.5vh', width: '0.5vh', height: '0', animation: 'slide4 1s linear forwards infinite', animationDelay: '0.5s' }}></div> */}
      </div>
    </div>
  );
};

export default Loader;
