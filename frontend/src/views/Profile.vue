<template>
  <div class="profile-container">
    <el-card shadow="never">
      <template #header>
        <h3>个人设置</h3>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="info">
          <el-form
            ref="profileFormRef"
            :model="profileForm"
            :rules="profileRules"
            label-width="100px"
            style="max-width: 600px"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileForm.username" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileForm.email" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="loading" @click="updateProfile">
                保存
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            style="max-width: 600px"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input v-model="passwordForm.currentPassword" type="password" show-password />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" show-password />
            </el-form-item>

            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" :loading="loading" @click="changePassword">
                修改密码
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { authApi } from '@/api';
import { useUserStore } from '@/store';

const userStore = useUserStore();

const activeTab = ref('info');
const loading = ref(false);

const profileFormRef = ref<FormInstance>();
const profileForm = reactive({
  username: '',
  email: '',
  avatar: '',
});

const passwordFormRef = ref<FormInstance>();
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const profileRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度在 3 到 50 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
};

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const passwordRules: FormRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' },
  ],
};

const loadUserProfile = () => {
  if (userStore.user) {
    profileForm.username = userStore.user.username;
    profileForm.email = userStore.user.email;
    profileForm.avatar = userStore.user.avatar || '';
  }
};

const updateProfile = async () => {
  if (!profileFormRef.value) return;

  await profileFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await authApi.updateProfile(profileForm);
        await userStore.fetchCurrentUser();
        ElMessage.success('更新成功');
        loadUserProfile();
      } catch (error) {
        // Error handled by request interceptor
      } finally {
        loading.value = false;
      }
    }
  });
};

const changePassword = async () => {
  if (!passwordFormRef.value) return;

  await passwordFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await authApi.changePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        });
        ElMessage.success('密码修改成功，请重新登录');
        userStore.logout();
        window.location.href = '/login';
      } catch (error) {
        // Error handled by request interceptor
      } finally {
        loading.value = false;
      }
    }
  });
};

onMounted(() => {
  loadUserProfile();
});
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
}

:deep(.el-card__header h3) {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}
</style>
