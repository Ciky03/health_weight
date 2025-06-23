const app = getApp();
const config = require('../../config');

Page({
  data: {
    imagePath: '',
    amount: 100, // 默认100克
    kcalPerUnit: 0, // 每克的卡路里
    totalKcal: 0,
    showInput: false,
    foods: [], // 识别出的食物列表
    currentFoodIndex: 0, // 当前选中的食物索引
    showFoodPicker: false, // 是否显示食物选择器
    formattedCalorie: '0.0' // 格式化后的每100g卡路里值
  },

  // 更新格式化的卡路里值
  updateFormattedCalorie: function() {
    const currentFood = this.data.foods[this.data.currentFoodIndex] || {};
    const calorie = currentFood.calorie_100g || 0;
    this.setData({
      formattedCalorie: calorie.toFixed(1)
    });
  },

  onLoad: function(options) {
    // 检查登录状态
    if (!app.common.checkLogin()) return;

    if (options && options.imagePath) {
      this.setData({
        imagePath: decodeURIComponent(options.imagePath)
      });
      // 加载图片后立即调用AI识别
      this.analyzeImage(this.data.imagePath);
    }
    this.updateTotalKcal();
  },

  // 调用后端AI接口分析图片
  analyzeImage: function(imagePath) {
    const token = app.common.getTokenFromStorageSync();
    wx.showLoading({
      title: '正在识别图片...'
    });

    wx.uploadFile({
      url: `${config.baseUrl}/ai/photo`,
      filePath: imagePath,
      name: 'file',
      header: {
        'token': token,
        'content-type': 'multipart/form-data'
      },
      formData: {
        'prompt': '判断文件是否为图片,判断图片中是否为食物,返回食物名称和对应的卡路里(每100g)'
      },
      success: (res) => {
        app.common.checkTokenExpire(res.statusCode);
        
        wx.hideLoading();
        if (res.statusCode === 200) {
          try {
            // 解析返回的数据
            const result = JSON.parse(res.data);
            console.log('AI识别结果:', result);
            
            if (!result.isPic) {
              wx.showToast({
                title: '请上传图片文件',
                icon: 'none'
              });
              return;
            }
            
            if (!result.isFood) {
              wx.showToast({
                title: '未能识别出食物',
                icon: 'none'
              });
              return;
            }
            
            if (result.foods && result.foods.length > 0) {
              this.setData({
                foods: result.foods,
                showFoodPicker: result.foods.length > 1,
                // 设置默认选中第一个食物
                kcalPerUnit: result.foods[0].calorie_100g / 100, // 转换为每克的卡路里
                currentFoodIndex: 0
              }, () => {
                this.updateFormattedCalorie(); // 更新格式化的卡路里值
                this.updateTotalKcal();
              });
            } else {
              wx.showToast({
                title: '未能识别出食物',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('解析返回数据失败:', error);
            wx.showToast({
              title: '识别结果解析失败',
              icon: 'none'
            });
          }
        } else {
          console.error('请求失败:', res);
          wx.showToast({
            title: '识别失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('上传图片失败:', err);
        wx.showToast({
          title: '上传图片失败',
          icon: 'none'
        });
      }
    });
  },

  // 切换选中的食物
  switchFood: function(e) {
    const index = parseInt(e.detail.value);
    if (index >= 0 && index < this.data.foods.length) {
      const food = this.data.foods[index];
      this.setData({
        currentFoodIndex: index,
        kcalPerUnit: food.calorie_100g / 100, // 转换为每克的卡路里
        amount: 100 // 重置为默认100克
      }, () => {
        this.updateFormattedCalorie(); // 更新格式化的卡路里值
        this.updateTotalKcal();
      });
    }
  },

  goBack() {
    wx.navigateBack();
  },
  
  increase() {
    this.setData({ amount: this.data.amount + 10 }, this.updateTotalKcal);
  },
  
  decrease() {
    if (this.data.amount > 10) {
      this.setData({ amount: this.data.amount - 10 }, this.updateTotalKcal);
    }
  },
  
  showInputBox() {
    this.setData({ showInput: true });
  },
  
  hideInputBox() {
    this.setData({ showInput: false });
  },
  
  inputAmount(e) {
    let val = parseFloat(e.detail.value) || 0;
    if (val < 0) val = 0;
    this.setData({ amount: val }, this.updateTotalKcal);
  },
  
  updateTotalKcal() {
    let total = (this.data.kcalPerUnit * this.data.amount).toFixed(1);
    if (isNaN(total)) total = '0.0';
    this.setData({ totalKcal: total });
  },
  
  saveRecord() {
    const currentFood = this.data.foods[this.data.currentFoodIndex];
    if (!currentFood) {
      wx.showToast({ 
        title: '无可保存的食物数据', 
        icon: 'none' 
      });
      return;
    }
    
    // 这里可以添加保存记录的逻辑
    wx.showToast({ 
      title: '已保存', 
      icon: 'success' 
    });
  }
}); 