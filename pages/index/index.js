const weatherMap = {
  'sunny': '晴天',
  'cloudy': '多云',
  'overcast':'阴',
  'lightrain':'小雨',
  'heavyrain':'大雨',
  'snow':'雪'
}
const weatherColorMap = {
  'sunny': "#cdeefd",
  'cloudy': '#deeef6',
  'overcast':'#c6ced2',
  'lightrain':'#bdd5e1',
  'heavyrain':'#c5ccd0',
  'snow':'#aae1fc'
}

// page info
Page({
  data: {
    nowTemp: 14,
    nowWeather: "多云",
    nowWeatherBackground: '',
    forecast:[],
    todayTemp:"",
    todayDate:""
  },

  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },

  onLoad(){
    this.getNow()
  },

  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data:{
        city: " 天津市"
      },
      success: res=> {
        console.log(res)
        let result = res.data.result
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete: ()=>{
        callback && callback()
      } 
    })
  },

  //set now weather
  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    console.log(temp, weather)
    // this.data.nowTemp = temp         禁止
    // this.data.nowWeather = nowWeather
    this.setData({
      nowTemp: temp + "˚",
      nowWeather: weatherMap[weather],
      nowWeatherBackground: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather]
    })

  },

  // set forecast
  setHourlyWeather(result){
    let forecast = result.forecast
    let nowHour = new Date().getHours()
    let hourlyWeather = []
    for (let i = 0; i < 8; i++) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + "时",
        iconPath: '/icons/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '˚'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },
  
  //set today info
  setToday(result){
    let date = new Date()
    this.setData({
      todayTemp: `${result.today.minTemp}˚ - ${result.today.maxTemp}˚`,
      todayDate: `${date.getFullYear()} - ${date.getMonth() + 1} - ${date.getDate()} 今天`
    })
  },
  
  //button 
  onTapDayWeather(){
    // wx.showToast()
    wx.navigateTo({
      url: '/pages/list/list',
    })
  }
  
})