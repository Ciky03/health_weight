const config = require('../../config');
const app = getApp();

Page({
  data: {
    avatar: '/utils/images/default.png',
    name: '卡路里杀手',
    sex: '',
    sexArray: ['女', '男'],
    sexIndex: -1,
    age: '',
    weight: '',
    height: '',
    weekTarget: '',
    activityLevel: '',
    activityLevelIndex: 0,
    activityLevels: ['几乎不运动', '每周运动1-3天', '每周运动3-5天', '每周运动6-7天', '体力劳动或每天高强度训练'],
    calorieTarget: '',
    suggestedCalorie: ''
  },

  // 性别选择器改变事件
  onSexChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      sexIndex: index,
      sex: this.data.sexArray[index]
    });
  },

  // 保存用户资料
  onSaveProfile() {
    const that = this;
    
    // 将性别转换为对应的数字代码
    const sexCode = this.data.sex === '女' ? '0' : this.data.sex === '男' ? '1' : '';
    
    // 构建请求数据
    const profileData = {
      sex: sexCode,
      age: this.data.age ? parseInt(this.data.age) : null,
      weight: this.data.weight ? parseFloat(this.data.weight) : null,
      height: this.data.height ? parseFloat(this.data.height) : null,
      weightGoal: this.data.weekTarget ? parseFloat(this.data.weekTarget) : null,
      activityLevel: this.data.activityLevel ? this.data.activityLevelIndex.toString() : null,
      dailyCalorie: this.data.calorieTarget || null
    };
    

    // 数据验证
    if (!profileData.sex) {
      wx.showToast({
        title: '请选择性别',
        icon: 'none'
      });
      return;
    }
    if (!profileData.age) {
      wx.showToast({
        title: '请输入年龄',
        icon: 'none'
      });
      return;
    }
    if (!profileData.weight) {
      wx.showToast({
        title: '请输入体重',
        icon: 'none'
      });
      return;
    }
    if (!profileData.height) {
      wx.showToast({
        title: '请输入身高',
        icon: 'none'
      });
      return;
    }

    const token = app.common.getTokenFromStorageSync();

    wx.request({
      url: `${config.baseUrl}/user/profile/save`,
      method: 'POST',
      header: {
        'token': token
      },
      data: profileData,
      success: function(res) {
        app.common.checkTokenExpire(res.statusCode);
        console.log('保存用户资料成功:', res.data);
        if (res.data.code === 1) {
          // 更新全局变量
          app.globalData.calorieTarget = profileData.dailyCalorie || '0';
          app.globalData.weight = profileData.weight || '0';
          app.globalData.weekTarget = profileData.weightGoal || '0';
          
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          });
          // 重新获取用户资料
          that.fetchUserProfile();
        } else {
          wx.showToast({
            title: res.data.msg || '保存失败',
            icon: 'none'
          });
        }
      },
      fail: function(err) {
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  onLoad: function() {
    // 检查登录状态
    if (!app.common.checkLogin()) return;

    console.log('页面加载时的初始数据:', this.data);
    this.fetchUserProfile();
  },

  // 获取用户资料
  fetchUserProfile: function() {
    const token = app.common.getTokenFromStorageSync();

    const that = this;
    wx.request({
      url: `${config.baseUrl}/user/profile/list`,
      method: 'GET',
      header: {
        'token': token
      },
      success: function(res) {
        app.common.checkTokenExpire(res.statusCode);
        console.log('获取用户资料成功:', res.data);
        if (res.data.code === 1) {
          const profileData = res.data.data;
          
          // 将数据保存到本地缓存
          wx.setStorageSync('userProfile', profileData);
          
          // 更新全局变量
          app.globalData.calorieTarget = profileData.dailyCalorie || '0';
          app.globalData.weight = profileData.weight || '0';
          app.globalData.weekTarget = profileData.weightGoal || '0';
          
          // 更新页面数据
          that.setData({
            avatar: profileData.avatar || that.data.avatar,
            name: profileData.name || that.data.name,
            sex: that.convertSex(profileData.sex),
            age: profileData.age || '',
            weight: profileData.weight || '',
            height: profileData.height || '',
            weekTarget: profileData.weightGoal || '',
            activityLevel: that.data.activityLevels[parseInt(profileData.activityLevel)] || that.data.activityLevels[0],
            activityLevelIndex: profileData.activityLevel !== null ? parseInt(profileData.activityLevel) : 0,
            calorieTarget: profileData.dailyCalorie || '',
            suggestedCalorie: profileData.recommendedDailyCalorie || ''
          });
        } else {
          wx.showToast({
            title: res.data.msg || '获取资料失败',
            icon: 'none'
          });
        }
      },
      fail: function(err) {
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },

  // 添加性别转换方法
  convertSex(sexCode) {
    const result = sexCode == 0 ? '女' : sexCode == 1 ? '男' : '';
    return result;
  },

  // 年龄输入验证（只能输入正整数）
  onAgeInput(e) {
    const value = e.detail.value;
    // 如果输入的不是数字或是负数，保持原值不变
    if (!/^\d*$/.test(value) || Number(value) < 0) {
      return this.data.age;
    }
    this.setData({
      age: value
    });
    return value;
  },

  // 体重输入验证（只能输入正数，可以有小数）
  onWeightInput(e) {
    const value = e.detail.value;
    // 如果输入的不是数字或是负数，保持原值不变
    if (!/^\d*\.?\d*$/.test(value) || Number(value) < 0) {
      return this.data.weight;
    }
    this.setData({
      weight: value
    });
    return value;
  },

  // 身高输入验证（只能输入正数，可以有小数）
  onHeightInput(e) {
    const value = e.detail.value;
    // 如果输入的不是数字或是负数，保持原值不变
    if (!/^\d*\.?\d*$/.test(value) || Number(value) < 0) {
      return this.data.height;
    }
    this.setData({
      height: value
    });
    return value;
  },

  // 增减目标输入验证（可以输入正负数，可以有小数）
  onWeekTargetInput(e) {
    const value = e.detail.value;
    // 如果输入的不是数字（可以是负数），保持原值不变
    if (!/^-?\d*\.?\d*$/.test(value) || value === 0) {
      return this.data.weekTarget;
    }
    this.setData({
      weekTarget: value
    });
    return value;
  },

  // 卡路里目标输入验证（只能输入正数，可以有小数）
  onCalorieTargetInput(e) {
    const value = e.detail.value;
    // 如果输入的不是数字或是负数，保持原值不变
    if (!/^\d*\.?\d*$/.test(value) || Number(value) < 0) {
      return this.data.calorieTarget;
    }
    this.setData({
      calorieTarget: value
    });
    return value;
  },

  // 活动程度选择改变事件
  onActivityLevelChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      activityLevelIndex: index,
      activityLevel: this.data.activityLevels[index]
    });
  },

}); 