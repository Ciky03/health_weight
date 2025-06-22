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
    },

    // 检查登录状态
    checkLogin() {
      const token = wx.getStorageSync('token');
      if (!token) {
        wx.reLaunch({
          url: '/pages/login/login'
        });
        return false;
      }
      return true;
    }
  },
  //全局变量
  globalData: {
    userInfo: null,
    calorieTarget: '0',
    weight: '0',
    weekTarget: '0',
    isCheckingLogin: false  // 添加标志位，防止重复检查
  },

  onLaunch() {
    // 检查登录状态
    this.common.checkLogin();
  },

  onShow() {
    // 在onShow中也检查登录状态
    this.common.checkLogin();
  }
})
