const app = getApp();
const config = require('../../config');

Page({
  data: {
    searchBars: [{
      searchText: '',
      calories: '',
      selectedFood: null,
      amount: 100,
      totalCalories: 0
    }],
    foodList: []
  },

  onLoad: function() {
    // 检查登录状态
    if (!app.common.checkLogin()) return;
  },

  // 搜索文本改变
  onSearchTextChange: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const searchBars = this.data.searchBars;
    searchBars[index].searchText = value;
    this.setData({ searchBars });
  },

  // 卡路里值改变
  onCaloriesChange: function(e) {
    const index = e.currentTarget.dataset.index;
    let value = e.detail.value;
    
    // 如果是空字符串，直接设置
    if (value === '') {
      const searchBars = this.data.searchBars;
      searchBars[index].calories = '';
      this.setData({ searchBars });
      return;
    }
    
    // 移除非数字字符（保留小数点）
    value = value.replace(/[^\d.]/g, '');
    
    // 确保只有一个小数点
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // 如果以小数点开始，补充0
    if (value.startsWith('.')) {
      value = '0' + value;
    }
    
    // 限制小数点后一位
    if (parts.length === 2 && parts[1].length > 1) {
      value = parseFloat(value).toFixed(1);
    }
    
    // 限制最大值为9999.9
    if (parseFloat(value) > 9999.9) {
      value = '9999.9';
      wx.showToast({
        title: '卡路里不能超过9999.9',
        icon: 'none'
      });
    }

    const searchBars = this.data.searchBars;
    searchBars[index].calories = value;
    this.setData({ searchBars });
  },

  // 搜索食物
  onSearch: function(e) {
    const index = e.currentTarget.dataset.index;
    const searchBar = this.data.searchBars[index];
    
    if (!searchBar.searchText.trim()) {
      wx.showToast({
        title: '请输入食物名称',
        icon: 'none'
      });
      return;
    }

    const token = app.common.getTokenFromStorageSync();
    wx.showLoading({
      title: '搜索中...'
    });

    wx.request({
      url: `${config.baseUrl}/ai/foodname`,
      method: 'GET',
      header: {
        'token': token
      },
      data: {
        prompt: '判断输入的是否是食物,返回食物名称和对应的卡路里(每100g)',
        foodName: searchBar.searchText.trim()
      },
      success: (res) => {
        app.common.checkTokenExpire(res.statusCode);
        
        wx.hideLoading();
        if (res.statusCode === 200) {
          const result = res.data;
          console.log('搜索结果:', result);

          if (!result.isFood) {
            wx.showToast({
              title: '找不到该食物,请手动输入',
              icon: 'none'
            });
            return;
          }

          // 更新搜索栏数据
          const searchBars = this.data.searchBars;
          searchBars[index].selectedFood = {
            name: result.food.name,
            calories: result.food.calorie_100g
          };
          searchBars[index].amount = 100; // 默认100g
          searchBars[index].totalCalories = result.food.calorie_100g; // 默认100g的卡路里值
          
          this.setData({ searchBars });
        } else {
          wx.showToast({
            title: '搜索失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
      }
    });
  },

  // 关闭食物卡片
  closeCard: function(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    searchBars[index].selectedFood = null;
    searchBars[index].amount = 100;
    searchBars[index].totalCalories = 0;
    this.setData({ searchBars });
  },

  // 增加数量
  increaseAmount: function(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    searchBars[index].amount += 10;
    this.updateTotalCalories(index);
    this.setData({ searchBars });
  },

  // 减少数量
  decreaseAmount: function(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    if (searchBars[index].amount > 10) {
      searchBars[index].amount -= 10;
      this.updateTotalCalories(index);
      this.setData({ searchBars });
    }
  },

  // 数量输入变化
  onAmountChange: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = parseFloat(e.detail.value) || 0;
    const searchBars = this.data.searchBars;
    searchBars[index].amount = value;
    this.updateTotalCalories(index);
    this.setData({ searchBars });
  },

  // 更新总卡路里
  updateTotalCalories: function(index) {
    const searchBar = this.data.searchBars[index];
    if (searchBar.selectedFood) {
      const totalCal = (searchBar.selectedFood.calories * searchBar.amount / 100).toFixed(1);
      this.data.searchBars[index].totalCalories = totalCal;
    }
  },

  // 添加新的搜索栏
  onAddFood: function() {
    const searchBars = this.data.searchBars;
    searchBars.push({
      searchText: '',
      calories: '',
      selectedFood: null,
      amount: 100,
      totalCalories: 0
    });
    this.setData({ searchBars });
  },

  // 删除搜索栏
  onDeleteSearchBar: function(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    searchBars.splice(index, 1);
    this.setData({ searchBars });
  },

  // 保存记录
  onSaveRecord: function() {
    const searchBars = this.data.searchBars;
    
    // 检查是否有数据要保存
    if (searchBars.length === 0) {
      wx.showToast({
        title: '请添加食物记录',
        icon: 'none'
      });
      return;
    }

    // 获取token
    const token = app.common.getTokenFromStorageSync();
    if (!token) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }

    // 构造请求数据
    const foods = searchBars.map(bar => {
      if (bar.selectedFood) {
        // 搜索状态，使用填写的amount值
        return {
          foodName: bar.selectedFood.name,
          calories: parseFloat(bar.totalCalories),
          amount: bar.amount
        };
      } else {
        // 未搜索状态，amount设置为null
        return {
          foodName: bar.searchText,
          calories: parseFloat(bar.calories || 0),
          amount: null
        };
      }
    });

    // 计算总卡路里
    const totalCalorie = foods.reduce((total, food) => {
      return total + food.calories;
    }, 0);

    const requestData = {
      totalCalorie,
      foods
    };

    console.log('准备发送的数据:', requestData);

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
          app.globalData.totalCalorie = (currentTotalCalorie + totalCalorie).toFixed(1);
          
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