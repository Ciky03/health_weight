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
    
    // 构造请求数据
    const requestData = {
      totalCalorie: parseFloat(this.data.totalCalories),
      foods: this.data.foods.map(food => ({
        foodName: food.name,
        calories: parseFloat((food.amount * food.calorie / 100).toFixed(1)),
        amount: food.amount
      }))
    };
    
    console.log('准备发送的数据:', requestData);

    // 获取token
    const token = app.common.getTokenFromStorageSync();
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 调用后端接口
    wx.request({
      url: `${config.baseUrl}/calorie/intake`,
      method: 'POST',
      header: {
        'content-type': 'application/json',
        'token': token
      },
      data: requestData,
      success: (res) => {
        // 检查token是否过期
        if (app.common.checkTokenExpire(res.statusCode)) return;

        if (res.statusCode === 200) {
          wx.showToast({ 
            title: '记录保存成功', 
            icon: 'success' 
          });
          
          // 更新全局变量的totalCalorie
          const currentTotalCalorie = parseFloat(app.globalData.totalCalorie) || 0;
          app.globalData.totalCalorie = (currentTotalCalorie + parseFloat(this.data.totalCalories)).toFixed(1);
          
          // 保存成功后返回上一页
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({ 
            title: '保存失败，请重试', 
            icon: 'none' 
          });
        }
      },
      fail: (err) => {
        console.error('保存记录失败:', err);
        wx.showToast({ 
          title: '网络错误，请重试', 
          icon: 'none' 
        });
      }
    });
  }
}); 