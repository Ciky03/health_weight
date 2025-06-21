const config = require('../../config');

Page({
  data: {
    avatar: '/utils/images/default.png',
    name: '卡路里杀手',
    sex: '',
    age: '',
    weight: '',
    height: '',
    weekTarget: '',
    activityLevel: '',
    activityLevelIndex: 0,
    activityLevels: ['久坐不动', '轻度活动', '中度活动', '重度活动', '极度活动'],
    calorieTarget: '',
    suggestedCalorie: ''
  },

  // 性别输入处理
  onSexInput(e) {
    const value = e.detail.value;
    // 只允许输入"男"或"女"
    if (value !== '男' && value !== '女' && value !== '') {
      return this.data.sex;
    }
    this.setData({
      sex: value
    });
    return value;
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
    
    console.log('发送的请求数据:', profileData);

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

    wx.request({
      url: `${config.baseUrl}/user/profile/save`,
      method: 'POST',
      data: profileData,
      success: function(res) {
        console.log('保存用户资料成功:', res.data);
        if (res.data.code === 1) {
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
    console.log('页面加载时的初始数据:', this.data);
    this.fetchUserProfile();
  },

  // 获取用户资料
  fetchUserProfile: function() {
    // const token = wx.getStorageSync('token');
    // if (!token) {
    //   console.log('未找到token，用户未登录');
    //   return;
    // }

    const that = this;
    wx.request({
      url: `${config.baseUrl}/user/profile/list`,
      method: 'GET',
      // header: {
      //   'Authorization': token
      // },
      success: function(res) {
        console.log('获取用户资料成功:', res.data);
        if (res.data.code === 1) {
          const profileData = res.data.data;
          
          // 将数据保存到本地缓存
          wx.setStorageSync('userProfile', profileData);
          
          // 更新页面数据
          that.setData({
            avatar: profileData.avatar || that.data.avatar,
            name: profileData.name || that.data.name,
            sex: that.convertSex(profileData.sex),
            age: profileData.age || '',
            weight: profileData.weight || '',
            height: profileData.height || '',
            weekTarget: profileData.weightGoal || '',
            activityLevel: that.data.activityLevels[profileData.activityLevel] || that.data.activityLevels[0],
            activityLevelIndex: that.data.activityLevels.indexOf(profileData.activityLevel) !== -1 
              ? that.data.activityLevels.indexOf(profileData.activityLevel) 
              : 0,
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
    console.log('转换性别，输入值:', sexCode);
    const result = sexCode == 0 ? '女' : sexCode == 1 ? '男' : '';
    console.log('转换后的性别:', result);
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
    if (value === /^\d*\.?\d*$/.test(value) && Number(value) >= 0) {
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
    console.log('选择的活动程度索引:', index);
    this.setData({
      activityLevelIndex: index,
      activityLevel: this.data.activityLevels[index]
    });
  },

  onAvatarTap() {
    console.log('头像被点击了');
    const that = this;
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success(userRes) {
        console.log('获取用户信息成功:', userRes);
        const { encryptedData, iv, rawData, signature } = userRes;
        wx.login({
          success(res) {
            console.log('wx.login 成功:', res);
            if (res.code) {
              wx.request({
                url: `${config.baseUrl}/user/login`,
                header:{
                  "Content-Type": "application/json"
                },
                method: 'POST',
                data: {
                  code: res.code,
                  encryptedData,
                  iv,
                  signature
                },
                success(resp) {
                  console.log('请求后端成功，返回数据:', resp.data);
                  console.log('后端返回的data字段:', resp.data.data);
                  if (resp.data.data && resp.data.data.token) {
                    // 修正token的存储
                    wx.setStorageSync('token', resp.data.data.token);
                    console.log('后端返回的性别值:', resp.data.data.sex);
                    const newData = {
                      avatar: resp.data.data.avatar || that.data.avatar,
                      name: resp.data.data.name || that.data.name,
                      sex: that.convertSex(resp.data.data.sex)
                    };
                    console.log('准备设置的新数据:', newData);
                    that.setData(newData, () => {
                      console.log('数据设置完成，当前数据:', that.data);
                    });
                  } else {
                    console.error('后端返回数据格式不正确:', resp.data);
                  }
                },
                fail(err) {
                  console.error('请求后端失败:', err);
                }
              });
            }
          },
          fail(err) {
            console.error('wx.login 失败:', err);
          }
        });
      },
      fail(err) {
        console.error('获取用户信息失败:', err);
      }
    });
  }
}); 