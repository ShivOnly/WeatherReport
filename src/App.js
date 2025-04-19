import React, { useState } from "react";
import './App.css';

const WEATHER_API_KEY = "3b2d8810006e6962ceb37f028fcc591e";
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const chatBox = React.useRef(null);

  const addMessage = (text, sender) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(sender === "user" ? "user-message" : "bot-message");
    messageDiv.textContent = text;

    // Prepend the message to the top of the chat box
    chatBox.current.insertBefore(messageDiv, chatBox.current.firstChild);

    // Trigger the fade-in animation
    messageDiv.classList.add('fade-in');

    chatBox.current.scrollTop = chatBox.current.scrollHeight;
  };

  const handleUserInput = (text) => {
    const lowerText = text.toLowerCase();
    const match = lowerText.match(/weather in ([a-zA-Z\s]+)/);
    if (match) {
      const city = match[1].trim();
      fetchWeatherByCity(city);
    } else {
      setTimeout(() => addMessage("I'm just a simple bot! Try typing: 'weather in Beijing' or click the Weather button for your location.", "bot"), 500);
    }
  };

  const fetchWeatherByCity = (city) => {
    addMessage(`📍 Fetching weather for ${city}...`, "bot");
    fetch(`${CORS_PROXY}https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${WEATHER_API_KEY}&units=metric`)
      .then(res => res.json())
      .then(data => {
        if (data.cod !== "200") {
          addMessage(`❌ Error: ${data.message}`, "bot");
          return;
        }
        showWeather(data);
      })
      .catch(err => {
        addMessage("❌ Failed to fetch weather.", "bot");
        console.error(err);
      });
  };

  const showWeather = (data) => {
    const city = data.city.name;
    const weather = data.list[0].weather[0].description;
    const temp = data.list[0].main.temp;
    const humidity = data.list[0].main.humidity;
    const icon = data.list[0].weather[0].icon;
    const currentTime = new Date().toLocaleTimeString();

    const iconURL = `https://openweathermap.org/img/wn/${icon}.png`;

    const weatherCard = `
      <div class="weather-card">
        <img src="${iconURL}" alt="Weather icon">
        <h3><strong>Weather in ${city}</strong></h3>
        <p><strong>${weather.charAt(0).toUpperCase() + weather.slice(1)}</strong></p>
        <p><strong>Temp: ${temp}°C</strong> | <strong>Humidity: ${humidity}%</strong></p>
        <p><em><strong>Current time: ${currentTime}</strong></em></p>
      </div>
    `;

    chatBox.current.innerHTML += weatherCard;

    const forecastHeader = `<h4><strong>3-Day Forecast</strong></h4>`;
    chatBox.current.innerHTML += forecastHeader;

    for (let i = 1; i < 4; i++) {
      const day = data.list[i * 8];
      const dayDate = new Date(day.dt * 1000).toLocaleDateString();
      const dayWeather = day.weather[0].description;
      const dayTemp = day.main.temp;
      const dayHumidity = day.main.humidity;
      const dayIcon = day.weather[0].icon;
      const dayIconURL = `https://openweathermap.org/img/wn/${dayIcon}.png`;

      const forecastCard = `
        <div class="forecast-card">
          <img src="${dayIconURL}" alt="Weather icon">
          <h5><strong>${dayDate}</strong></h5>
          <p><strong>${dayWeather.charAt(0).toUpperCase() + dayWeather.slice(1)}</strong></p>
          <p><strong>Temp: ${dayTemp}°C</strong> | <strong>Humidity: ${dayHumidity}%</strong></p>
        </div>
      `;
      chatBox.current.innerHTML += forecastCard;
    }

    chatBox.current.scrollTop = chatBox.current.scrollHeight;
  };

  const handleSendMessage = () => {
    const text = userInput.trim();
    if (text !== "") {
      addMessage(text, "user");
      handleUserInput(text);
      setUserInput("");
    }
  };

  const handleWeatherButtonClick = () => {
    addMessage("🔍 Getting your current location...", "bot");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherByCoords(latitude, longitude);
        },
        (error) => {
          addMessage("❌ Failed to get location. Please allow location access.", "bot");
        }
      );
    } else {
      addMessage("❌ Geolocation is not supported in your browser.", "bot");
    }
  };

  const fetchWeatherByCoords = (lat, lon) => {
    fetch(`${CORS_PROXY}https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`)
      .then(res => res.json())
      .then(data => {
        if (data.cod !== "200") {
          addMessage(`❌ Error: ${data.message}`, "bot");
          return;
        }
        showWeather(data);
      })
      .catch(err => {
        addMessage("❌ Failed to fetch weather from your location.", "bot");
        console.error(err);
      });
  };

  return (
    <div className="App">
      {/* Sidebar */}
      <div className="side-ribbon">
        <ul className="list-group">
          <li className="list-group-item">Workplace History</li>
          <li className="list-group-item">Plugins</li>
          <li className="list-group-item">Settings</li>
          <li className="list-group-item">Notifications</li>
        </ul>
      </div>

      {/* Top Ribbon */}
      <div className="top-ribbon">
        <div className="brand-logo">
          <h4>WeatherBot</h4>
        </div>
        <div className="user-info">
          <img src="https://pbs.twimg.com/media/FDntoJQXIAAVXXW.jpg" alt="User Avatar" />
          <span>Shiv</span>
        </div>
      </div>

      {/* Chatbot Container */}
      <div className="chat-container" ref={chatBox}>
        <div className="chat-box" id="chat-box"></div>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            id="user-input"
            placeholder="Ask me anything..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            aria-label="User message"
          />
          <button className="weather-btn" id="send-btn" onClick={handleSendMessage}>Send</button>
        </div>
        <button className="weather-btn" id="weather-btn" onClick={handleWeatherButtonClick}>Get Weather</button>
      </div>
    </div>
  );
};

export default App;
