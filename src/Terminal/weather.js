// 解密函数
function decodeAPIKey(key) {
    return key.split('').map((char, index) => {
      return String.fromCharCode(char.charCodeAt(0) - index);
    }).join('');
}
  
const Key = "04f87:?l;l?><qp@IuIxDFJzJLKQW";
// weather text to emoji
export function weatherTextToEmoji(text) {
    const lowerCaseText = text.toLowerCase();
    if (lowerCaseText.includes('rain')) {
      return '🌧️';
    } else if (lowerCaseText.includes('cloud')) {
      return '☁️';
    } else if (lowerCaseText.includes('clear')) {
      return '☀️';
    } else if (lowerCaseText.includes('snow')) {
      return '❄️';
    } else if (lowerCaseText.includes('thunderstorm')) {
      return '⛈️';
    } else if (lowerCaseText.includes('drizzle')) {
      return '🌦️';
    } else if (lowerCaseText.includes('mist')) {
      return '🌫️';
    }
    return '';
}

// Tips for weather
export function weatherTips(text) {
    const lowerCaseText = text.toLowerCase();
    if (lowerCaseText.includes('rain')) {
      return 'Remember to bring an umbrella when you go out.';
    } else if (lowerCaseText.includes('cloud')) {
      return 'It is a good day to go out for a walk.';
    } else if (lowerCaseText.includes('clear')) {
      return 'It is a good day to go out for a walk.';
    } else if (lowerCaseText.includes('snow')) {
      return 'Remember to wear warm clothes when you go out.';
    } else if (lowerCaseText.includes('thunderstorm')) {
      return 'Remember to stay indoors and avoid going out.';
    } else if (lowerCaseText.includes('drizzle')) {
      return 'Remember to bring an umbrella when you go out.';
    } else if (lowerCaseText.includes('mist')) {
      return 'Remember to drive carefully when you go out.';
    }
    return '';
}

// 解析天气数据并生成英文描述
function parseWeatherData(data) {
    const location = data.name;
    const temperature = data.main.temp;
    const feels_like = data.main.feels_like;
    const humidity = data.main.humidity;
    const weather = data.weather[0].main;
    const description = data.weather[0].description;

    const englishDescriptionList = [
        `- The weather in ${location} is currently ${weather.toLowerCase()} with a temperature of ${temperature} °C.`,
        `- The temperature feels like ${feels_like} °C, humidity is ${humidity}%.`,
        `- ${description}. ${weatherTextToEmoji(weather)}`,`- ${weatherTips(weather)}`
    ];

    return  englishDescriptionList;
}
  
// 获取用户位置并获取天气信息
export async function getWeather(callBack) {
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (position) => {
        const { latitude, longitude } = position.coords;
        const APIKey = decodeAPIKey(Key);
        const weatherAPIUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${APIKey}`;

        fetch(weatherAPIUrl)
            .then(response => response.json())
            .then(data => {
                const weatherData = parseWeatherData(data);
                console.log(weatherData);
                if (callBack) {
                    callBack(weatherData);
                }

                // 表明函数执行结束

            })
            .catch(error => console.error('Error fetching weather data:', error));
        },
        (error) => {
        console.error('Error getting user location:', error.message);
        }
    );
    } else {
    console.error('Geolocation is not supported by your browser.');
    }
}