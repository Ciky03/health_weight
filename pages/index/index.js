// index.js
const util = require('../../utils/util.js');
const config = require('../../config');

Page({
  data: {
    date: '',
    fireIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwcHgiIGhlaWdodD0iODAwcHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMkM4LjEzIDIgNSA1LjEzIDUgOUM1IDEyLjA0IDcuOTQgMTQuODMgMTAuNjEgMTYuMjJDOC44NCAxNi4zNCAxMS4wMiAxNi41MyAxMS4xMyAxNi43NkMxMS42NiAxNy44NyAxMS44MyAxOS40NCAxMiAyMkMxMi4xNyAxOS40NCAxMi4zNCAxNy44NyAxMi44NyAxNi43NkMxMi45OCAxNi41MyAxMy4xNiAxNi4zNCAxMy4zOSAxNi4yMkMxNi4wNiAxNC44MyAxOSAxMi4wNCAxOSAxOUMxOSA1LjEzIDE1Ljg3IDIgMTIgMloiIGZpbGw9IiMwMDAwMDAiLz48L3N2Zz4=',
    cameraIcon: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDE1QzEzLjY1NjkgMTUgMTUgMTMuNjU2OSAxNSAxMkMxNSAxMC4zNDMxIDEzLjY1NjkgOSAxMiA5QzEwLjM0MzEgOSAxMCAxMC4zNDMxIDEwIDEyQzEwIDEzLjY1NjkgMTAuMzQzMSAxNSAxMiAxNVoiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTTIgN1YxN0MyIDE4LjEwNDYgMi44OTU0MyAxOSA0IDE5SDIwQzIxLjEwNDYgMTkgMjIgMTguMTA0NiAyMiAxN1Y3QzIyIDUuODk1NDMgMjEuMTA0NiA1IDIwIDVIMTcuODI4NEMxNy40MjY0IDUgMTcuMDM5OCA0Ljg2MjAxIDE2LjczNzMgNC42MDk5TDE1LjI2MjcgMy4zOTAxQzE0LjU0MjEgMi43NjY4NiAxMy41NjEyIDIuNSAxMi41NTI4IDIuNUgxMS40NDcyQzEwLjQzODggMi41IDkuNDU3ODkgMi43NjY4NiA4LjczNzMgMy4zOTAxTDcuMjYyNyA0LjYwOTlDNi45NjAyNSA0Ljg2MjAxIDYuNTczNjIgNSA2LjE3MTU3IDVINEEyLjg5NTQzIDUgMiA1uODk1NDMgMiA3WiIgZmlsbD0iYmxhY2siLz48L3N2Zz4=',
    calorieTarget: 0, // 添加卡路里目标数据
    todayCalorie: 0,  //今日卡路里
    absorbCalorie:0, //已摄入卡路里百分比
    remainCalorie: 0, //剩余卡路里
    weight: 80.2,  //目前体重
    targetWeight: 70.0 //目标体重
  },

  onLoad: function () {
    this.setCurrentDate();
    this.timer = setInterval(() => {
      this.setCurrentDate();
    }, 60000);
    this.fetchCalorieTarget(); // 获取卡路里目标
  },

  // 获取每日卡路里目标
  fetchCalorieTarget: function() {
    wx.request({
      url: `${config.baseUrl}/user/profile/calorie`,
      method: 'GET',
      success: (res) => {
        console.log('获取卡路里目标成功:', res.data);
        if (res.data.code === 1) {
          this.setData({
            calorieTarget: res.data.data || 0
          });
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
