// index.js
const util = require('../../utils/util.js');
const config = require('../../config');
const app = getApp();

Page({
  data: {
    date: '',
    fireIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOUM1IDEyLjA0IDcuOTQgMTQuODMgMTAuNjEgMTYuMjJDOC44NCAxNi4zNCAxMS4wMiAxNi41MyAxMS4xMyAxNi43NkMxMS42NiAxNy44NyAxMS44MyAxOS40NCAxMiAyMkMxMi4xNyAxOS40NCAxMi4zNCAxNy44NyAxMi44NyAxNi43NkMxMi45OCAxNi41MyAxMy4xNiAxNi4zNCAxMy4zOSAxNi4yMkMxNi4wNiAxNC44MyAxOSAxMi4wNCAxOSAxOUMxOSA1LjEzIDE1Ljg3IDIgMTIgMloiIGZpbGw9IiMwMDAwMDAiLz48L3N2Zz4=',
    cameraIcon: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDE1QzEzLjY1NjkgMTUgMTUgMTMuNjU2OSAxNSAxMkMxNSAxMC4zNDMxIDEzLjY1NjkgOSAxMiA5QzEwLjM0MzEgOSAxMCAxMC4zNDMxIDEwIDEyQzEwIDEzLjY1NjkgMTAuMzQzMSAxNSAxMiAxNVoiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTTIgN1YxN0MyIDE4LjEwNDYgMi44OTU0MyAxOSA0IDE5SDIwQzIxLjEwNDYgMTkgMjIgMTguMTA0NiAyMiAxN1Y3QzIyIDUuODk1NDMgMjEuMTA0NiA1IDIwIDVIMTcuODI4NEMxNy40MjY0IDUgMTcuMDM5OCA0Ljg2MjAxIDE2LjczNzMgNC42MDk5TDE1LjI2MjcgMy4zOTAxQzE0LjU0MjEgMi43NjY4NiAxMy41NjEyIDIuNSAxMi41NTI4IDIuNUgxMS40NDcyQzEwLjQzODggMi41IDkuNDU3ODkgMi43NjY4NiA4LjczNzMgMy4zOTAxTDcuMjYyNyA0LjYwOTlDNi45NjAyNSA0Ljg2MjAxIDYuNTczNjIgNSA2LjE3MTU3IDVINEEyLjg5NTQzIDUgMiA1uODk1NDMgMiA3WiIgZmlsbD0iYmxhY2siLz48L3N2Zz4=',
    calorieTarget: 0, // 添加卡路里目标数据
    totalCalorie: 0,  //今日卡路里
    absorbCalorie:0, //已摄入卡路里百分比
    remainCalorie: 0, //剩余卡路里
    weight: 80.2,  //目前体重
    targetWeight: 70.0, //目标体重
    weightPercent: 0,
    absorbCaloriePercent: 0,
    progressColor: '#f3ae58'
  },

  onLoad: function () {
    // 检查登录状态
    if (!app.common.checkLogin()) return;

    this.setCurrentDate();
    this.timer = setInterval(() => {
      this.setCurrentDate();
    }, 60000);
    
    // 初始化数据
    this.updateFromGlobalData();
    
    // 设置观察者，监听全局变量变化
    this.setupGlobalDataObserver();
    
    this.fetchCalorieTarget(); // 获取卡路里目标
  },

  onShow: function() {
    // 检查登录状态
    if (!app.common.checkLogin()) return;
  },

  // 更新页面数据从全局变量
  updateFromGlobalData: function() {
    const weight = parseFloat(app.globalData.weight) || 0;
    const weekTarget = parseFloat(app.globalData.weekTarget) || 0;
    const targetWeight = weight + weekTarget;
    const calorieTarget = app.globalData.calorieTarget || 0;
    const totalCalorie = app.globalData.totalCalorie || '0';
    const remainCalorie = (calorieTarget - totalCalorie) >= 0 ? (calorieTarget - totalCalorie) : '0';
    
    // 计算卡路里摄入百分比
    const absorbCaloriePercent = calorieTarget > 0 ? ((totalCalorie/calorieTarget)*100) : 0;
    // 确保显示值在0-100之间，并保留两位小数
    const absorbCalorie = Math.min(Math.max(0, absorbCaloriePercent), 100).toFixed(2);

    // 计算体重进度条百分比
    let weightPercent = 0;
    if (weight !== 0 || targetWeight !== 0) {
      weightPercent = Math.min(weight, targetWeight) / Math.max(weight, targetWeight);
      // 转换为百分比格式（保留2位小数）
      weightPercent = (weightPercent * 100).toFixed(2);
    }

    // 根据摄入比例设置进度条颜色
    const progressColor = parseFloat(absorbCaloriePercent) >= 100 ? '#ff4d4f' : '#f3ae58';

    this.setData({
      calorieTarget: calorieTarget,
      weight: weight,
      targetWeight: targetWeight,
      weightPercent: weightPercent,
      totalCalorie: totalCalorie,
      remainCalorie: remainCalorie,
      absorbCalorie: absorbCalorie,
      progressColor: progressColor
    });
  },

  // 设置全局变量观察者
  setupGlobalDataObserver: function() {
    const that = this;
    const originalGlobalData = app.globalData;
    
    // 使用Object.defineProperty为每个需要监听的属性设置getter和setter
    ['calorieTarget', 'weight', 'weekTarget','totalCalorie'].forEach(key => {
      let value = originalGlobalData[key];
      Object.defineProperty(app.globalData, key, {
        get: function() {
          return value;
        },
        set: function(newValue) {
          value = newValue;
          // 当全局变量改变时，更新页面数据
          that.updateFromGlobalData();
        }
      });
    });
  },

  // 获取每日卡路里目标
  fetchCalorieTarget: function() {
    const token =  app.common.getTokenFromStorageSync();
    wx.request({
      url: `${config.baseUrl}/user/profile/info`,
      method: 'GET',
      header:{
        'token': token
      },
      success: (res) => {
        app.common.checkTokenExpire(res.statusCode);
        
        console.log('获取卡路里目标成功:', res.data);
        if (res.data.code === 1) {
          // 更新全局变量
          app.globalData.calorieTarget = res.data.data.dailyCalorie || '0';
          app.globalData.weight = res.data.data.weight || '0';
          app.globalData.weekTarget = res.data.data.weightGoal || '0';
          app.globalData.totalCalorie = res.data.data.totalCalorie || '0';

          // updateFromGlobalData会自动被调用，因为我们设置了观察者
        } else {
          console.error('获取卡路里目标失败:', res.data.msg);
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
      }
    });
  },

  onUnload: function() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },

  setCurrentDate: function () {
    const now = new Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const week = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
    const hour = util.formatNumber(now.getHours());
    const minute = util.formatNumber(now.getMinutes());
    this.setData({
      date: `${month}月${day}日 周${week} ${hour}:${minute}`
    });
  },

  takePhoto: function() {
    wx.showActionSheet({
      itemList: ['拍摄', '从相册选择'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 拍摄
          wx.chooseImage({
            count: 1,
            sourceType: ['camera'],
            success: (imgRes) => {
              const path = encodeURIComponent(imgRes.tempFilePaths[0]);
              wx.navigateTo({
                url: `/pages/camerapage/camerapage?imagePath=${path}`
              });
            }
          });
        } else if (res.tapIndex === 1) {
          // 从相册选择
          wx.chooseImage({
            count: 1,
            sourceType: ['album'],
            success: (imgRes) => {
              const path = encodeURIComponent(imgRes.tempFilePaths[0]);
              wx.navigateTo({
                url: `/pages/camerapage/camerapage?imagePath=${path}`
              });
            }
          });
        }
        // 取消不做处理
      }
    });
  },

  manualInput: function() {
    wx.navigateTo({
      url: '/pages/food/food'
    });
  }
})
