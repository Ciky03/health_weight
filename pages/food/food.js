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
    const value = e.detail.value;
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
    // 这里添加保存记录的逻辑
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
  }
}); 