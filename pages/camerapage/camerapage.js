const app = getApp();
const config = require('../../config');

Page({
  data: {
    imagePath: '',
    foods: [], // 识别出的食物列表
    totalCalories: 0 // 所有食物的总卡路里
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
              // 为每个食物添加amount和showInput属性
              const foods = result.foods.map(food => ({
                ...food,
                amount: 100, // 默认100克
                showInput: false,
                calorie: food.calorie_100g // 使用calorie_100g作为每100g的卡路里值
              }));
              
              this.setData({ foods }, () => {
                this.updateTotalCalories();
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

  goBack() {
    wx.navigateBack();
  },
  
  increase(e) {
    const index = e.currentTarget.dataset.index;
    const foods = this.data.foods;
    foods[index].amount += 10;
    this.setData({ foods }, () => {
      this.updateTotalCalories();
    });
  },
  
  decrease(e) {
    const index = e.currentTarget.dataset.index;
    const foods = this.data.foods;
    if (foods[index].amount > 10) {
      foods[index].amount -= 10;
      this.setData({ foods }, () => {
        this.updateTotalCalories();
      });
    }
  },
  
  showInputBox(e) {
    const index = e.currentTarget.dataset.index;
    const foods = this.data.foods;
    foods[index].showInput = true;
    this.setData({ foods });
  },
  
  hideInputBox(e) {
    const index = e.currentTarget.dataset.index;
    const foods = this.data.foods;
    foods[index].showInput = false;
    this.setData({ foods });
  },
  
  inputAmount(e) {
    const index = e.currentTarget.dataset.index;
    const foods = this.data.foods;
    let val = parseFloat(e.detail.value) || 0;
    if (val < 0) val = 0;
    foods[index].amount = val;
    this.setData({ foods }, () => {
      this.updateTotalCalories();
    });
  },
  
  updateTotalCalories() {
    const totalCalories = this.data.foods.reduce((total, food) => {
      return total + (food.amount * food.calorie / 100);
    }, 0);
    this.setData({ totalCalories: totalCalories.toFixed(1) });
  },
  
  saveRecord() {
    if (this.data.foods.length === 0) {
      wx.showToast({ 
        title: '无可保存的食物数据', 
        icon: 'none' 
      });
      return;
    }
    
    // 这里可以添加保存记录的逻辑
    const recordData = this.data.foods.map(food => ({
      name: food.name,
      amount: food.amount,
      calorie: food.calorie,
      totalCalories: (food.amount * food.calorie / 100).toFixed(1)
    }));
    
    console.log('保存的记录数据:', recordData);
    
    wx.showToast({ 
      title: '已保存', 
      icon: 'success' 
    });
  }
}); 