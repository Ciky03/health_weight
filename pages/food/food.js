Page({
  data: {
    searchText: '',
    calories: '0',
    foodList: [],
    selectedFood: null,
    amount: 1,
    totalCalories: 0
  },

  onLoad(options) {
    // 检查登录状态
    if (!app.common.checkLogin()) return;
    // 页面加载时的初始化
  },

  // 搜索按钮点击事件
  onSearch() {
    if (!this.data.searchText.trim()) {
      wx.showToast({
        title: '请输入食物名称',
        icon: 'none'
      })
      return
    }

    // 模拟搜索结果
    const mockFood = {
      name: this.data.searchText,
      calories: 47,
      unit: '100克'
    }

    this.setData({
      selectedFood: mockFood,
      amount: 1,
      totalCalories: (mockFood.calories * 1).toFixed(1)
    })
  },

  // 关闭食物卡片
  closeCard() {
    this.setData({
      selectedFood: null,
      amount: 1,
      totalCalories: 0
    })
  },

  // 减少数量
  decreaseAmount() {
    if (this.data.amount > 1) {
      const newAmount = this.data.amount - 1
      this.setData({
        amount: newAmount,
        totalCalories: (this.data.selectedFood.calories * newAmount).toFixed(1)
      })
    }
  },

  // 增加数量
  increaseAmount() {
    const newAmount = this.data.amount + 1
    this.setData({
      amount: newAmount,
      totalCalories: (this.data.selectedFood.calories * newAmount).toFixed(1)
    })
  },

  // 输入数量变化
  onAmountChange(e) {
    const newAmount = parseInt(e.detail.value) || 1
    this.setData({
      amount: newAmount,
      totalCalories: (this.data.selectedFood.calories * newAmount).toFixed(1)
    })
  },

  // 添加食物按钮点击事件
  onAddFood() {
    if (!this.data.selectedFood) {
      wx.showToast({
        title: '请先搜索并选择食物',
        icon: 'none'
      })
      return
    }
    // TODO: 实现添加食物逻辑
  },

  // 保存记录按钮点击事件
  onSaveRecord() {
    if (!this.data.selectedFood) {
      wx.showToast({
        title: '请先添加食物',
        icon: 'none'
      })
      return
    }
    // TODO: 实现保存记录逻辑
  }
}) 