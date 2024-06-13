const Loader = () => {
  return (
    <div id="loaderbackground">
      <div
        id="loaderlogocontainer"
        style={{ backgroundColor: 'transparent' }}
      >
        <div id="pelogo">
          <img
            src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjPGIbqtNtn1yzk1w1cGmCgFstHk-l2NvevRgw7J7kD3uOT4sjPpn-0CVb5gPGy47z3wtZWY4M5InE_n1zBlBE_PnkDXBydBhU8RCzwijKQYiSGGB1ZJ5umDWXCd4l9TpeiQcsJW2IjwXiOoQxg2M-FhknAF-RmkCOdqJgywWOLw62wSNSCzT1W6cAiZQ0n/s1600/multiwolf100.png" // Replace with your image URL
            alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="loader" style={{ left: '0.5vh', top: '0', height: '0.5vh', width: '0', animation: 'slide1 1s linear forwards infinite' }}></div>
        <div className="loader" style={{ right: '0', top: '0.5vh', width: '0.5vh', height: '0', animation: 'slide2 1s linear forwards infinite', animationDelay: '0.5s' }}></div>
        <div className="loader" style={{ right: '0.5vh', bottom: '0', height: '0.5vh', width: '0', animation: 'slide3 1s linear forwards infinite' }}></div>
        <div className="loader" style={{ left: '0', bottom: '0.5vh', width: '0.5vh', height: '0', animation: 'slide4 1s linear forwards infinite', animationDelay: '0.5s' }}></div>
      </div>
    </div>
  );
};

export default Loader;
