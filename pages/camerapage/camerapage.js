Page({
  data: {
    imagePath: '',
    unit: '份',
    amount: 1,
    kcalPerUnit: 1, // 1千卡/份
    totalKcal: 1,
    showInput: false
  },
  onLoad: function(options) {
    // 检查登录状态
    if (!app.common.checkLogin()) return;

    if (options && options.imagePath) {
      this.setData({
        imagePath: decodeURIComponent(options.imagePath)
      });
    }
    this.updateTotalKcal();
  },
  goBack() {
    wx.navigateBack();
  },
  switchUnit(e) {
    const unit = e.currentTarget.dataset.unit;
    let kcalPerUnit = 1;
    if (unit === '克') kcalPerUnit = 0.01; // 1千卡/100克
    this.setData({ unit, kcalPerUnit, amount: 1, showInput: false }, this.updateTotalKcal);
  },
  increase() {
    this.setData({ amount: this.data.amount + 1 }, this.updateTotalKcal);
  },
  decrease() {
    if (this.data.amount > 1) {
      this.setData({ amount: this.data.amount - 1 }, this.updateTotalKcal);
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
    wx.showToast({ title: '已保存', icon: 'success' });
  }
}); 