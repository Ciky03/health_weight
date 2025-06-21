// app.js
App({
  //全局方法: 
  common:{
    getTokenFromStorageSync(){
      const token = wx.getStorageSync('token');
      if (!token) {
        console.log('未找到token，用户未登录');
        return;
      }
      return token;
    }
  },
  //全局变量
  globalData: {
    userInfo: null
  },

  onLaunch() {
    // // 展示本地存储能力
    // const logs = wx.getStorageSync('logs') || []
    // logs.unshift(Date.now())
    // wx.setStorageSync('logs', logs)

    // // 登录
    // wx.login({
    //   success: res => {
    //     // 发送 res.code 到后台换取 openId, sessionKey, unionId
    //   }
    // })
    
  }
  
})
