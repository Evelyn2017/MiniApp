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

const QQMapWX = require('../../libs/qqmap-wx-jssdk1/qqmap-wx-jssdk.js')
const UNPROMPTED = 0
const UNAUTHROIZED = 1
const AUTHORIZED = 2

const UNPROMOPTED_TIPS = '点击获取当前位置'
const UNAUTHORIZED_TIPS = '点击开启位置权限'
const AUTHORIZED_TIPS = ''

// page info
Page({
  data: {
    nowTemp: '',
    nowWeather: "",
    nowWeatherBackground: '',
    forecast:[],
    todayTemp:"",
    todayDate:"",
    city:"广州市",
    locationAuthType: UNPROMPTED,
    locationTipsText: UNPROMOPTED_TIPS
  },

  onLoad() {
    this.qqmapsdk = new QQMapWX({
      key: 'TLXBZ-7NLW6-4NTSA-ECRJQ-VPOCE-GHBFI'
    })
    this.getNow()
  },

  onPullDownRefresh(){
    this.getNow(()=>{
      wx.stopPullDownRefresh()
    })
  },

  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data:{
        city: this.data.city
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
      url: '/pages/list/list?city=' + this.data.city,
    })
  },
  
  // get location
  onTapLocation(){
    if(this.data.locationAuthType === UNAUTHROIZED)
      wx.openSetting({
        success : res => {
          let auth = res.authSetting['scope.userLocation']
          if(auth) {
            this.getLocation()
          }
        }
      })
    else
    this.getLocation()
  },

  getLocation(){
    wx.getLocation({
      success: res =>{
        this.setData({
          locationAuthType: AUTHORIZED,
          locationTipsText: AUTHORIZED_TIPS
        })
        this.qqmapsdk.reverseGeocoder({
          location:{
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            this.setData({
              city: city,
              locationTipsText: ""
            })
            this.getNow()
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType : UNAUTHROIZED,
          locationTipsText: UNAUTHORIZED_TIPS
        })
      }
    }) 
  }
})