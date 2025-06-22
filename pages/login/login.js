const config = require('../../config');
const app = getApp();

Page({
  data: {},

  onLoad: function() {
    // 检查是否已经登录
    const token = wx.getStorageSync('token');
    if (token) {
      // 已登录，直接跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }
  },

  // 微信登录
  handleWxLogin: function() {
    console.log('点击微信登录按钮');
    wx.showLoading({
      title: '登录中...',
    });

    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: (userRes) => {
        console.log('获取用户信息成功:', userRes);
        const { encryptedData, iv, rawData, signature } = userRes;
        
        wx.login({
          success: (res) => {
            console.log('wx.login 成功:', res);
            if (res.code) {
              wx.request({
                url: `${config.baseUrl}/user/login`,
                header: {
                  "Content-Type": "application/json"
                },
                method: 'POST',
                data: {
                  code: res.code,
                  encryptedData,
                  iv,
                  signature
                },
                success: (resp) => {
                  console.log('请求后端成功，返回数据:', resp.data);
                  if (resp.data.data && resp.data.data.token) {
                    // 保存token
                    wx.setStorageSync('token', resp.data.data.token);
                    wx.hideLoading();
                    
                    // 登录成功后跳转到首页
                    wx.reLaunch({
                      url: '/pages/index/index'
                    });
                  } else {
                    wx.hideLoading();
                    wx.showToast({
                      title: '登录失败',
                      icon: 'none'
                    });
                    console.error('后端返回数据格式不正确:', resp.data);
                  }
                },
                fail: (err) => {
                  wx.hideLoading();
                  wx.showToast({
                    title: '登录失败',
                    icon: 'none'
                  });
                  console.error('请求后端失败:', err);
                }
              });
            }
          },
          fail: (err) => {
            wx.hideLoading();
            wx.showToast({
              title: '登录失败',
              icon: 'none'
            });
            console.error('wx.login 失败:', err);
          }
        });
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('获取用户信息失败:', err);
      }
    });
  }
}); 