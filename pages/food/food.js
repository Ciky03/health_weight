const  app = getApp();
Page({
  data: {
    searchBars: [{
      searchText: '',
      calories: '0',
      selectedFood: null,
      amount: 1,
      totalCalories: 0
    }],
    foodList: []
  },

  onLoad(options) {
    // 检查登录状态
    if (!app.common.checkLogin()) return;
    // 页面加载时的初始化
  },

  // 搜索按钮点击事件
  onSearch(e) {
    const index = e.currentTarget.dataset.index;
    const searchBar = this.data.searchBars[index];
    
    if (!searchBar.searchText.trim()) {
      wx.showToast({
        title: '请输入食物名称',
        icon: 'none'
      })
      return
    }

    // 模拟搜索结果
    const mockFood = {
      name: searchBar.searchText,
      calories: 47,
      unit: '100克'
    }

    const searchBars = this.data.searchBars;
    searchBars[index].selectedFood = mockFood;
    searchBars[index].amount = 1;
    searchBars[index].totalCalories = (mockFood.calories * 1).toFixed(1);

    this.setData({ searchBars });
  },

  // 关闭食物卡片
  closeCard(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    searchBars[index].selectedFood = null;
    searchBars[index].amount = 1;
    searchBars[index].totalCalories = 0;
    this.setData({ searchBars });
  },

  // 减少数量
  decreaseAmount(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    if (searchBars[index].amount > 1) {
      const newAmount = searchBars[index].amount - 1;
      searchBars[index].amount = newAmount;
      searchBars[index].totalCalories = (searchBars[index].selectedFood.calories * newAmount).toFixed(1);
      this.setData({ searchBars });
    }
  },

  // 增加数量
  increaseAmount(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    const newAmount = searchBars[index].amount + 1;
    searchBars[index].amount = newAmount;
    searchBars[index].totalCalories = (searchBars[index].selectedFood.calories * newAmount).toFixed(1);
    this.setData({ searchBars });
  },

  // 输入数量变化
  onAmountChange(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    const newAmount = parseInt(e.detail.value) || 1;
    searchBars[index].amount = newAmount;
    searchBars[index].totalCalories = (searchBars[index].selectedFood.calories * newAmount).toFixed(1);
    this.setData({ searchBars });
  },

  // 更新搜索文本
  onSearchTextChange(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    searchBars[index].searchText = e.detail.value;
    this.setData({ searchBars });
  },

  // 更新卡路里值
  onCaloriesChange(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    searchBars[index].calories = e.detail.value;
    this.setData({ searchBars });
  },

  // 添加食物按钮点击事件
  onAddFood() {
    const searchBars = this.data.searchBars;
    searchBars.push({
      searchText: '',
      calories: '0',
      selectedFood: null,
      amount: 1,
      totalCalories: 0
    });
    this.setData({ searchBars });
  },

  // 删除搜索栏
  onDeleteSearchBar(e) {
    const index = e.currentTarget.dataset.index;
    const searchBars = this.data.searchBars;
    searchBars.splice(index, 1);
    this.setData({ searchBars });
  },

  // 保存记录按钮点击事件
  onSaveRecord() {
    const hasFood = this.data.searchBars.some(bar => bar.selectedFood);
    if (!hasFood) {
      wx.showToast({
        title: '请先添加食物',
        icon: 'none'
      })
      return
    }
    // TODO: 实现保存记录逻辑
  }
}) 