/**
 * Weather Cast - 스마트 글로벌 날씨 서비스 (PC & 모바일 반응형 대시보드)
 * Open-Meteo 공개 API (100% 무료, No API Key) + Nominatim 지오코딩 연동
 */

// DOM Elements
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const clearBtn = document.getElementById('clearBtn');
const geoBtn = document.getElementById('geoBtn');
const quickCitiesContainer = document.getElementById('quickCities');
const loading = document.getElementById('loading');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const weatherContent = document.getElementById('weatherContent');

// Hero Card Elements
const cityNameEl = document.getElementById('cityName');
const countryNameEl = document.getElementById('countryName');
const currentTimeEl = document.getElementById('currentTime');
const weatherEmojiEl = document.getElementById('weatherEmoji');
const weatherIconEl = document.getElementById('weatherIcon');
const weatherDescEl = document.getElementById('weatherDesc');
const currentTempEl = document.getElementById('currentTemp');
const todayMinTempEl = document.getElementById('todayMinTemp');
const todayMaxTempEl = document.getElementById('todayMaxTemp');
const apparentTempEl = document.getElementById('apparentTemp');
const artSceneEl = document.getElementById('artScene');
const artCaptionTextEl = document.getElementById('artCaptionText');

// Detail Metrics Elements
const humidityEl = document.getElementById('humidity');
const humidityDescEl = document.getElementById('humidityDesc');
const windSpeedEl = document.getElementById('windSpeed');
const windDescEl = document.getElementById('windDesc');
const cloudCoverEl = document.getElementById('cloudCover');
const cloudDescEl = document.getElementById('cloudDesc');
const precipitationEl = document.getElementById('precipitation');
const precipDescEl = document.getElementById('precipDesc');
const uvIndexEl = document.getElementById('uvIndex');
const uvDescEl = document.getElementById('uvDesc');
const sunriseTimeEl = document.getElementById('sunriseTime');
const sunsetTimeEl = document.getElementById('sunsetTime');

// Lists & Theme Elements
const hourlyListEl = document.getElementById('hourlyList');
const forecastListEl = document.getElementById('forecastList');
const themeButtonsContainer = document.getElementById('themeButtons');

/**
 * 캔버스 기반 풀스크린 동적 날씨 효과 (Weather Effects Engine)
 * 맑음, 흐림, 비, 눈 상태에 맞춰 자연스럽고 환상적인 파티클 애니메이션을 렌더링합니다.
 */
const WeatherEffects = {
  canvas: null,
  ctx: null,
  width: 0,
  height: 0,
  mode: 'weather-sunny',
  particles: [],
  animId: null,

  init() {
    this.canvas = document.getElementById('weatherFxCanvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.createParticles();
    this.loop();
  },

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.createParticles();
  },

  setMode(newMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;
    this.createParticles();
  },

  createParticles() {
    this.particles = [];
    const count = this.mode === 'weather-rainy' ? 90 :
                  this.mode === 'weather-snowy' ? 70 :
                  this.mode === 'weather-sunny' ? 30 : 15;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.spawnParticle(true));
    }
  },

  spawnParticle(randomY = false) {
    const w = this.width;
    const h = this.height;

    if (this.mode === 'weather-rainy') {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -20,
        len: 15 + Math.random() * 20,
        speed: 12 + Math.random() * 8,
        width: 1.2 + Math.random() * 1.5,
        alpha: 0.3 + Math.random() * 0.4
      };
    } else if (this.mode === 'weather-snowy') {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -15,
        radius: 1.8 + Math.random() * 3.5,
        speed: 1 + Math.random() * 1.8,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: 0.02 + Math.random() * 0.03,
        swingWidth: 1.5 + Math.random() * 2,
        alpha: 0.4 + Math.random() * 0.5
      };
    } else if (this.mode === 'weather-sunny') {
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : h + 10,
        radius: 2 + Math.random() * 4,
        speed: 0.4 + Math.random() * 0.8,
        alpha: 0.15 + Math.random() * 0.35,
        color: Math.random() > 0.4 ? '255, 209, 102' : '255, 255, 255'
      };
    } else { // cloudy
      return {
        x: Math.random() * (w + 200) - 100,
        y: Math.random() * (h * 0.8),
        radius: 60 + Math.random() * 90,
        speed: 0.2 + Math.random() * 0.4,
        alpha: 0.04 + Math.random() * 0.08
      };
    }
  },

  loop() {
    this.update();
    this.draw();
    this.animId = requestAnimationFrame(() => this.loop());
  },

  update() {
    const w = this.width;
    const h = this.height;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (this.mode === 'weather-rainy') {
        p.y += p.speed;
        p.x -= 2; // 바람에 약간 사선으로 내림
        if (p.y > h || p.x < 0) {
          this.particles[i] = this.spawnParticle(false);
        }
      } else if (this.mode === 'weather-snowy') {
        p.y += p.speed;
        p.swing += p.swingSpeed;
        p.x += Math.sin(p.swing) * p.swingWidth;
        if (p.y > h) {
          this.particles[i] = this.spawnParticle(false);
        }
      } else if (this.mode === 'weather-sunny') {
        p.y -= p.speed;
        if (p.y < -20) {
          this.particles[i] = this.spawnParticle(false);
        }
      } else { // cloudy
        p.x += p.speed;
        if (p.x - p.radius > w) {
          p.x = -p.radius * 2;
        }
      }
    }
  },

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (this.mode === 'weather-rainy') {
        this.ctx.strokeStyle = `rgba(144, 224, 239, ${p.alpha})`;
        this.ctx.lineWidth = p.width;
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        this.ctx.lineTo(p.x - 4, p.y + p.len);
        this.ctx.stroke();
      } else if (this.mode === 'weather-snowy') {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (this.mode === 'weather-sunny') {
        this.ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      } else { // cloudy
        const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `rgba(255, 255, 255, ${p.alpha})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }
};

/**
 * 자주 찾는 주요 도시 한글-영문 및 기본 좌표
 */
const POPULAR_CITIES = {
  '서울': { name: '서울특별시', country: '대한민국', lat: 37.5665, lon: 126.9780 },
  '부산': { name: '부산광역시', country: '대한민국', lat: 35.1796, lon: 129.0756 },
  '대구': { name: '대구광역시', country: '대한민국', lat: 35.8714, lon: 128.6014 },
  '인천': { name: '인천광역시', country: '대한민국', lat: 37.4563, lon: 126.7052 },
  '광주': { name: '광주광역시', country: '대한민국', lat: 35.1595, lon: 126.8526 },
  '대전': { name: '대전광역시', country: '대한민국', lat: 36.3504, lon: 127.3845 },
  '울산': { name: '울산광역시', country: '대한민국', lat: 35.5384, lon: 129.3114 },
  '세종': { name: '세종특별자치시', country: '대한민국', lat: 36.4800, lon: 127.2890 },
  '수원': { name: '수원시', country: '대한민국', lat: 37.2636, lon: 127.0286 },
  '제주': { name: '제주특별자치도', country: '대한민국', lat: 33.4996, lon: 126.5312 },
  '제주도': { name: '제주특별자치도', country: '대한민국', lat: 33.4996, lon: 126.5312 },
  '강릉': { name: '강릉시', country: '대한민국', lat: 37.7519, lon: 128.8761 },
  '춘천': { name: '춘천시', country: '대한민국', lat: 37.8813, lon: 127.7298 },
  '전주': { name: '전주시', country: '대한민국', lat: 35.8242, lon: 127.1480 },
  '청주': { name: '청주시', country: '대한민국', lat: 36.6424, lon: 127.4890 },
  '포항': { name: '포항시', country: '대한민국', lat: 36.0190, lon: 129.3435 },
  '창원': { name: '창원시', country: '대한민국', lat: 35.2280, lon: 128.6811 },
  '여수': { name: '여수시', country: '대한민국', lat: 34.7604, lon: 127.6622 },
  '경주': { name: '경주시', country: '대한민국', lat: 35.8562, lon: 129.2247 },
  '속초': { name: '속초시', country: '대한민국', lat: 38.2070, lon: 128.5918 },
  '도쿄': { name: '도쿄', country: '일본', lat: 35.6895, lon: 139.6917 },
  '오사카': { name: '오사카', country: '일본', lat: 34.6937, lon: 135.5023 },
  '후쿠오카': { name: '후쿠오카', country: '일본', lat: 33.5904, lon: 130.4017 },
  '베이징': { name: '베이징', country: '중국', lat: 39.9042, lon: 116.4074 },
  '상하이': { name: '상하이', country: '중국', lat: 31.2304, lon: 121.4737 },
  '홍콩': { name: '홍콩', country: '홍콩', lat: 22.3193, lon: 114.1694 },
  '방콕': { name: '방콕', country: '태국', lat: 13.7563, lon: 100.5018 },
  '싱가포르': { name: '싱가포르', country: '싱가포르', lat: 1.3521, lon: 103.8198 },
  '뉴욕': { name: '뉴욕', country: '미국', lat: 40.7128, lon: -74.0060 },
  '로스앤젤레스': { name: '로스앤젤레스', country: '미국', lat: 34.0522, lon: -118.2437 },
  '샌프란시스코': { name: '샌프란시스코', country: '미국', lat: 37.7749, lon: -122.4194 },
  '런던': { name: '런던', country: '영국', lat: 51.5074, lon: -0.1278 },
  '파리': { name: '파리', country: '프랑스', lat: 48.8566, lon: 2.3522 },
  '베를린': { name: '베를린', country: '독일', lat: 52.5200, lon: 13.4050 },
  '로마': { name: '로마', country: '이탈리아', lat: 41.9028, lon: 12.4964 },
  '시드니': { name: '시드니', country: '호주', lat: -33.8688, lon: 151.2093 }
};

/**
 * WMO 기상 코드 상세 매핑 (Open-Meteo 표준)
 */
function getWeatherInfo(wmoCode, isDay = 1) {
  const codes = {
    0: {
      desc: isDay ? '맑음' : '맑은 밤',
      emoji: isDay ? '☀️' : '🌙',
      icon: isDay ? 'fa-sun' : 'fa-moon',
      theme: isDay ? 'weather-sunny' : 'weather-night'
    },
    1: {
      desc: '대체로 맑음',
      emoji: isDay ? '🌤️' : '🌙',
      icon: isDay ? 'fa-cloud-sun' : 'fa-cloud-moon',
      theme: isDay ? 'weather-sunny' : 'weather-night'
    },
    2: {
      desc: '구름 조금',
      emoji: isDay ? '⛅' : '☁️',
      icon: isDay ? 'fa-cloud-sun' : 'fa-cloud-moon',
      theme: 'weather-cloudy'
    },
    3: {
      desc: '흐림',
      emoji: '☁️',
      icon: 'fa-cloud',
      theme: 'weather-cloudy'
    },
    45: {
      desc: '안개',
      emoji: '🌫️',
      icon: 'fa-smog',
      theme: 'weather-cloudy'
    },
    48: {
      desc: '서리 안개',
      emoji: '🌫️',
      icon: 'fa-smog',
      theme: 'weather-cloudy'
    },
    51: {
      desc: '약한 이슬비',
      emoji: '🌦️',
      icon: 'fa-cloud-rain',
      theme: 'weather-rainy'
    },
    53: {
      desc: '보통 이슬비',
      emoji: '🌦️',
      icon: 'fa-cloud-rain',
      theme: 'weather-rainy'
    },
    55: {
      desc: '강한 이슬비',
      emoji: '🌧️',
      icon: 'fa-cloud-showers-heavy',
      theme: 'weather-rainy'
    },
    56: {
      desc: '어는 약한 이슬비',
      emoji: '🌨️',
      icon: 'fa-snowflake',
      theme: 'weather-snowy'
    },
    57: {
      desc: '어는 강한 이슬비',
      emoji: '🌨️',
      icon: 'fa-snowflake',
      theme: 'weather-snowy'
    },
    61: {
      desc: '약한 비',
      emoji: '🌦️',
      icon: 'fa-cloud-rain',
      theme: 'weather-rainy'
    },
    63: {
      desc: '비',
      emoji: '🌧️',
      icon: 'fa-cloud-showers-heavy',
      theme: 'weather-rainy'
    },
    65: {
      desc: '강한 비',
      emoji: '🌧️',
      icon: 'fa-cloud-showers-heavy',
      theme: 'weather-rainy'
    },
    66: {
      desc: '약한 어는 비',
      emoji: '🧊',
      icon: 'fa-icicles',
      theme: 'weather-rainy'
    },
    67: {
      desc: '강한 어는 비',
      emoji: '🧊',
      icon: 'fa-icicles',
      theme: 'weather-rainy'
    },
    71: {
      desc: '약한 눈',
      emoji: '🌨️',
      icon: 'fa-snowflake',
      theme: 'weather-snowy'
    },
    73: {
      desc: '눈',
      emoji: '❄️',
      icon: 'fa-snowflake',
      theme: 'weather-snowy'
    },
    75: {
      desc: '폭설',
      emoji: '❄️',
      icon: 'fa-snowflake',
      theme: 'weather-snowy'
    },
    77: {
      desc: '싸락눈',
      emoji: '🌨️',
      icon: 'fa-snowflake',
      theme: 'weather-snowy'
    },
    80: {
      desc: '약한 소나기',
      emoji: '🌦️',
      icon: 'fa-cloud-sun-rain',
      theme: 'weather-rainy'
    },
    81: {
      desc: '소나기',
      emoji: '🌧️',
      icon: 'fa-cloud-showers-heavy',
      theme: 'weather-rainy'
    },
    82: {
      desc: '격렬한 소나기',
      emoji: '⛈️',
      icon: 'fa-cloud-showers-heavy',
      theme: 'weather-rainy'
    },
    85: {
      desc: '약한 눈보라',
      emoji: '🌨️',
      icon: 'fa-snowflake',
      theme: 'weather-snowy'
    },
    86: {
      desc: '강한 눈보라',
      emoji: '❄️',
      icon: 'fa-snowflake',
      theme: 'weather-snowy'
    },
    95: {
      desc: '뇌우',
      emoji: '⛈️',
      icon: 'fa-bolt',
      theme: 'weather-rainy'
    },
    96: {
      desc: '우박 동반 뇌우',
      emoji: '⛈️',
      icon: 'fa-cloud-bolt',
      theme: 'weather-rainy'
    },
    99: {
      desc: '강한 우박 동반 뇌우',
      emoji: '⛈️',
      icon: 'fa-cloud-bolt',
      theme: 'weather-rainy'
    }
  };

  return codes[wmoCode] || {
    desc: '정보 없음',
    emoji: '☁️',
    icon: 'fa-cloud',
    theme: 'weather-cloudy'
  };
}

// 요일 계산
function getDayName(dateString) {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const date = new Date(dateString);
  const today = new Date();
  
  if (date.toDateString() === today.toDateString()) {
    return '오늘';
  }
  return `${days[date.getDay()]}요일`;
}

// UI 피드백 헬퍼
function showLoading() {
  loading.classList.remove('hidden');
  errorState.classList.add('hidden');
  weatherContent.classList.add('hidden');
}

function showError(msg) {
  loading.classList.add('hidden');
  errorState.classList.remove('hidden');
  errorMessage.textContent = msg;
  weatherContent.classList.add('hidden');
}

function showWeather() {
  loading.classList.add('hidden');
  errorState.classList.add('hidden');
  weatherContent.classList.remove('hidden');
}

const ART_CAPTIONS = {
  'weather-sunny': '따사로운 햇살이 온화하게 감싸는 청명한 날',
  'weather-night': '별빛이 맑게 쏟아지는 고요하고 평온한 밤',
  'weather-cloudy': '부드러운 구름이 머물며 여유로운 바람이 부는 날',
  'weather-rainy': '차분한 빗소리가 메마른 대지를 촉촉하게 적시는 시간',
  'weather-snowy': '하얀 눈꽃송이가 소리 없이 내려앉는 낭만적인 겨울'
};

function updateThemeBackground(themeClass) {
  document.body.className = '';
  document.body.classList.add(themeClass);

  // 파티클 효과 연동 (맑음, 흐림, 비, 눈)
  WeatherEffects.setMode(themeClass);

  // 감성 날씨 일러스트 배너 씬 & 감성 캡션 갱신
  if (artSceneEl) {
    const sceneClass = themeClass.replace('weather-', 'scene-');
    artSceneEl.className = `art-scene ${sceneClass}`;
  }
  if (artCaptionTextEl && ART_CAPTIONS[themeClass]) {
    artCaptionTextEl.textContent = ART_CAPTIONS[themeClass];
  }

  // 테마 미리보기 버튼 active 동기화
  if (themeButtonsContainer) {
    const btns = themeButtonsContainer.querySelectorAll('.theme-btn');
    btns.forEach(btn => {
      if (btn.dataset.theme === themeClass) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}

/**
 * 지명 검색 (3단계 스마트 탐색)
 */
async function findLocation(query) {
  const cleanQuery = query.trim();

  // 1. 인기 도시 사전 매칭
  if (POPULAR_CITIES[cleanQuery]) {
    const item = POPULAR_CITIES[cleanQuery];
    return {
      name: item.name,
      country: item.country,
      latitude: item.lat,
      longitude: item.lon
    };
  }

  // 2. OpenStreetMap Nominatim 지오코딩 (동, 구, 군, 한글 지명)
  try {
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQuery)}&format=json&limit=1&accept-language=ko`;
    const nomRes = await fetch(nomUrl, { headers: { 'Accept': 'application/json' } });
    if (nomRes.ok) {
      const nomData = await nomRes.json();
      if (nomData && nomData.length > 0) {
        const item = nomData[0];
        const parts = item.display_name.split(',').map(s => s.trim());
        return {
          name: parts[0] || cleanQuery,
          country: parts[parts.length - 1] || '대한민국',
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon)
        };
      }
    }
  } catch (e) {
    console.warn('Nominatim fallback 진행', e);
  }

  // 3. Open-Meteo Geocoding
  try {
    const omUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=1&language=ko&format=json`;
    const omRes = await fetch(omUrl);
    if (omRes.ok) {
      const omData = await omRes.json();
      if (omData.results && omData.results.length > 0) {
        const r = omData.results[0];
        return {
          name: r.name,
          country: [r.admin1, r.country].filter(Boolean).join(', ') || '대한민국',
          latitude: r.latitude,
          longitude: r.longitude
        };
      }
    }
  } catch (e) {
    console.warn('Open-Meteo 지오코딩 실패', e);
  }

  throw new Error(`'${cleanQuery}' 위치를 찾을 수 없습니다. 도시 이름을 다시 확인해 주세요.`);
}

/**
 * Open-Meteo 상세 기상 API 호출 (현재 + 시간별 24시간 + 주간 예보 + 일출/일몰 + 자외선)
 */
async function fetchWeather(latitude, longitude) {
  const currentParams = [
    'temperature_2m',
    'relative_humidity_2m',
    'apparent_temperature',
    'is_day',
    'precipitation',
    'weather_code',
    'cloud_cover',
    'wind_speed_10m'
  ].join(',');

  const hourlyParams = [
    'temperature_2m',
    'weather_code',
    'precipitation_probability',
    'is_day'
  ].join(',');

  const dailyParams = [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_probability_max',
    'sunrise',
    'sunset',
    'uv_index_max'
  ].join(',');

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=${currentParams}&hourly=${hourlyParams}&daily=${dailyParams}&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('날씨 데이터를 가져오는 중 서버 오류가 발생했습니다.');
  return await res.json();
}

/**
 * 기상 지표별 상태 텍스트 판정
 */
function getMetricStatus(current, daily) {
  // 습도 판정
  let humText = '적정 습도 (쾌적)';
  const h = current.relative_humidity_2m;
  if (h < 30) humText = '매우 건조';
  else if (h < 40) humText = '다소 건조';
  else if (h > 75) humText = '습하고 눅눅함';
  else if (h > 60) humText = '다소 다습';

  // 바람 판정
  let windText = '산들바람 (쾌적)';
  const w = current.wind_speed_10m;
  if (w < 5) windText = '고요한 바람';
  else if (w < 15) windText = '산들바람';
  else if (w < 25) windText = '다소 강한 바람';
  else windText = '매우 강한 바람 (주의)';

  // 구름 판정
  let cloudText = '구름 없음 (쾌청)';
  const c = current.cloud_cover;
  if (c < 20) cloudText = '맑고 푸른 하늘';
  else if (c < 50) cloudText = '구름 약간';
  else if (c < 80) cloudText = '구름 많은 편';
  else cloudText = '하늘 전체 흐림';

  // 강수 판정
  let pText = '비 소식 없음';
  const p = current.precipitation;
  if (p > 5) pText = '강한 비/눈 내림';
  else if (p > 0.5) pText = '약한 비/눈 진행 중';

  // 자외선 지수 판정
  const uv = daily && daily.uv_index_max ? daily.uv_index_max[0] : 0;
  let uvText = '낮음 (안전)';
  if (uv >= 8) uvText = '매우 높음 (차단제 필수)';
  else if (uv >= 6) uvText = '높음 (모자, 선글라스)';
  else if (uv >= 3) uvText = '보통 (자외선 유의)';

  return { humText, windText, cloudText, pText, uvText, uvVal: uv ? uv.toFixed(1) : '-' };
}

/**
 * 시간 포맷 변환 (ISO -> HH:MM)
 */
function formatHour(isoString) {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 대시보드 화면 전체 렌더링
 */
function renderWeather(locInfo, weatherData) {
  const current = weatherData.current;
  const hourly = weatherData.hourly;
  const daily = weatherData.daily;
  const weatherInfo = getWeatherInfo(current.weather_code, current.is_day);

  // 1. 위치 및 시간 메타
  cityNameEl.textContent = locInfo.name || '알 수 없는 위치';
  countryNameEl.textContent = locInfo.country || '대한민국';

  const now = new Date();
  currentTimeEl.textContent = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

  // 2. Hero Card 기온 및 날씨
  weatherEmojiEl.textContent = weatherInfo.emoji;
  weatherIconEl.className = `fa-solid ${weatherInfo.icon} hero-fa-icon`;
  weatherDescEl.innerHTML = `<span class="desc-emoji">${weatherInfo.emoji}</span> <span>${weatherInfo.desc}</span>`;
  currentTempEl.textContent = Math.round(current.temperature_2m);
  apparentTempEl.textContent = `${Math.round(current.apparent_temperature)}°`;

  if (daily && daily.temperature_2m_max && daily.temperature_2m_max.length > 0) {
    todayMaxTempEl.textContent = `${Math.round(daily.temperature_2m_max[0])}°`;
    todayMinTempEl.textContent = `${Math.round(daily.temperature_2m_min[0])}°`;
  }

  // 3. 상세 기상 지표 (6개 그리드)
  const status = getMetricStatus(current, daily);
  humidityEl.textContent = `${current.relative_humidity_2m}%`;
  humidityDescEl.textContent = status.humText;

  windSpeedEl.innerHTML = `${Math.round(current.wind_speed_10m)} <small>km/h</small>`;
  windDescEl.textContent = status.windText;

  cloudCoverEl.textContent = `${current.cloud_cover}%`;
  cloudDescEl.textContent = status.cloudText;

  precipitationEl.innerHTML = `${current.precipitation} <small>mm</small>`;
  precipDescEl.textContent = status.pText;

  uvIndexEl.textContent = status.uvVal;
  uvDescEl.textContent = status.uvText;

  if (daily && daily.sunrise && daily.sunrise[0]) {
    sunriseTimeEl.textContent = formatHour(daily.sunrise[0]);
    sunsetTimeEl.textContent = formatHour(daily.sunset[0]);
  }

  // 4. 테마 배경 전환
  updateThemeBackground(weatherInfo.theme);

  // 5. 24시간 시간별 예보 렌더링
  renderHourly(hourly);

  // 6. 주간 7일 예보 렌더링
  renderForecast(daily);

  showWeather();
}

/**
 * 24시간 시간별 가로 스크롤 예보 렌더링
 */
function renderHourly(hourly) {
  hourlyListEl.innerHTML = '';
  if (!hourly || !hourly.time) return;

  const now = new Date();
  const currentIsoHour = now.toISOString().slice(0, 13); // 현재 시간대 비교용

  // 현재 시간과 가장 가까운 인덱스 찾기
  let startIndex = 0;
  for (let i = 0; i < hourly.time.length; i++) {
    if (new Date(hourly.time[i]) >= now) {
      startIndex = Math.max(0, i - 1);
      break;
    }
  }

  // 향후 24시간 추출
  const endIndex = Math.min(hourly.time.length, startIndex + 24);

  for (let i = startIndex; i < endIndex; i++) {
    const timeStr = hourly.time[i];
    const dateObj = new Date(timeStr);
    const hourNum = dateObj.getHours();
    const isNow = i === startIndex;
    const label = isNow ? '지금' : `${hourNum}시`;

    const code = hourly.weather_code[i];
    const isDay = hourly.is_day ? hourly.is_day[i] : (hourNum >= 6 && hourNum < 18 ? 1 : 0);
    const wInfo = getWeatherInfo(code, isDay);
    const temp = Math.round(hourly.temperature_2m[i]);
    const pop = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

    const item = document.createElement('div');
    item.className = `hourly-item ${isNow ? 'now' : ''}`;

    item.innerHTML = `
      <span class="hourly-time">${label}</span>
      <span class="hourly-emoji">${wInfo.emoji}</span>
      <span class="hourly-temp">${temp}°</span>
      <span class="hourly-pop">${pop > 10 ? `<i class="fa-solid fa-umbrella"></i> ${pop}%` : ''}</span>
    `;

    hourlyListEl.appendChild(item);
  }
}

/**
 * 7일 주간 예보 렌더링 (애플 날씨 스타일 기온 게이지 바 탑재)
 */
function renderForecast(daily) {
  forecastListEl.innerHTML = '';
  if (!daily || !daily.time) return;

  const count = Math.min(daily.time.length, 7);

  // 주간 전체 최저/최고 기온 산출 (게이지 바 비율 계산용)
  let weekMin = 100;
  let weekMax = -100;
  for (let i = 0; i < count; i++) {
    if (daily.temperature_2m_min[i] < weekMin) weekMin = daily.temperature_2m_min[i];
    if (daily.temperature_2m_max[i] > weekMax) weekMax = daily.temperature_2m_max[i];
  }
  const totalRange = Math.max(1, weekMax - weekMin);

  for (let i = 0; i < count; i++) {
    const dayName = getDayName(daily.time[i]);
    const wCode = daily.weather_code[i];
    const wInfo = getWeatherInfo(wCode, 1);
    const maxT = Math.round(daily.temperature_2m_max[i]);
    const minT = Math.round(daily.temperature_2m_min[i]);
    const pop = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : null;

    // 기온 바 게이지 퍼센티지 계산
    const leftPercent = Math.max(0, Math.min(100, ((minT - weekMin) / totalRange) * 100));
    const rightPercent = Math.max(0, Math.min(100, ((weekMax - maxT) / totalRange) * 100));
    const widthPercent = Math.max(10, 100 - leftPercent - rightPercent);

    const row = document.createElement('div');
    row.className = 'forecast-row';

    row.innerHTML = `
      <span class="row-day">${dayName}</span>
      <div class="row-condition">
        <span class="row-emoji">${wInfo.emoji}</span>
        <span class="row-desc">${wInfo.desc}</span>
      </div>
      <span class="row-pop">
        ${pop !== null && pop > 10 ? `<i class="fa-solid fa-umbrella"></i> ${pop}%` : ''}
      </span>
      <div class="temp-gauge-wrapper">
        <span class="temp-min">${minT}°</span>
        <div class="temp-bar-bg">
          <div class="temp-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
        </div>
        <span class="temp-max">${maxT}°</span>
      </div>
    `;

    forecastListEl.appendChild(row);
  }
}

/**
 * 도시 날씨 로드 통합 실행
 */
async function loadCityWeather(query, displayLabel = null) {
  showLoading();
  try {
    const loc = await findLocation(query);
    if (displayLabel) {
      loc.name = displayLabel;
    }
    const weather = await fetchWeather(loc.latitude, loc.longitude);
    renderWeather(loc, weather);
  } catch (err) {
    showError(err.message || '날씨 정보를 불러오는 중 오류가 발생했습니다.');
  }
}

/**
 * 브라우저 Geolocation GPS 기반 내 위치 조회
 */
function loadCurrentLocationWeather() {
  if (!navigator.geolocation) {
    showError('이 브라우저에서는 위치 정보(Geolocation)를 지원하지 않습니다.');
    return;
  }

  showLoading();

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;

      try {
        const weather = await fetchWeather(lat, lon);
        
        let locName = '현재 내 위치';
        let country = '대한민국';

        try {
          const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=ko`);
          if (revRes.ok) {
            const revData = await revRes.json();
            locName = revData.city || revData.locality || revData.principalSubdivision || '현재 위치';
            country = revData.countryName || '대한민국';
          }
        } catch (e) {
          console.warn('역지오코딩 실패', e);
        }

        renderWeather({
          name: locName,
          country: country
        }, weather);

        document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      } catch (err) {
        showError('위치 정보를 기반으로 날씨를 조회하는데 실패했습니다.');
      }
    },
    (err) => {
      let msg = '위치 접근 권한이 거부되었거나 위치를 가져올 수 없습니다.';
      if (err.code === err.PERMISSION_DENIED) {
        msg = '브라우저의 위치 권한 허용이 필요합니다. 상단 도시 검색창을 이용해 검색해 보세요.';
      }
      showError(msg);
    },
    { timeout: 10000, enableHighAccuracy: true }
  );
}

// 이벤트 리스너 등록
searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const query = cityInput.value.trim();
  if (!query) return;

  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  loadCityWeather(query);
});

cityInput.addEventListener('input', () => {
  if (cityInput.value.length > 0) {
    clearBtn.classList.add('visible');
  } else {
    clearBtn.classList.remove('visible');
  }
});

clearBtn.addEventListener('click', () => {
  cityInput.value = '';
  clearBtn.classList.remove('visible');
  cityInput.focus();
});

geoBtn.addEventListener('click', () => {
  loadCurrentLocationWeather();
});

quickCitiesContainer.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;

  document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');

  const cityQuery = chip.dataset.city;
  const cityName = chip.dataset.name;
  cityInput.value = '';
  clearBtn.classList.remove('visible');
  loadCityWeather(cityQuery, cityName);
});

// 날씨 분위기 미리보기 (사용자 직접 체험 버튼)
if (themeButtonsContainer) {
  themeButtonsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.theme-btn');
    if (!btn) return;

    const theme = btn.dataset.theme;
    updateThemeBackground(theme);

    // 데모용 메인 비주얼 반응
    const themeVisualDemo = {
      'weather-sunny': { emoji: '☀️', icon: 'fa-sun', desc: '맑음' },
      'weather-cloudy': { emoji: '☁️', icon: 'fa-cloud', desc: '흐림' },
      'weather-rainy': { emoji: '🌧️', icon: 'fa-cloud-showers-heavy', desc: '비' },
      'weather-snowy': { emoji: '❄️', icon: 'fa-snowflake', desc: '눈' }
    };

    if (themeVisualDemo[theme]) {
      const demo = themeVisualDemo[theme];
      weatherEmojiEl.textContent = demo.emoji;
      weatherIconEl.className = `fa-solid ${demo.icon} hero-fa-icon`;
      weatherDescEl.innerHTML = `<span class="desc-emoji">${demo.emoji}</span> <span>${demo.desc}</span>`;
    }
  });
}

// 초기화: 파티클 엔진 초기화 및 서울 날씨 로드
document.addEventListener('DOMContentLoaded', () => {
  WeatherEffects.init();
  loadCityWeather('서울', '서울');
});
