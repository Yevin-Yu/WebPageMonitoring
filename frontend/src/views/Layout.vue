<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="logo">
        <el-icon><Monitor /></el-icon>
        <span>监控中心</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/projects">
          <el-icon><FolderOpened /></el-icon>
          <span>项目管理</span>
        </el-menu-item>
        <el-menu-item index="/profile">
          <el-icon><User /></el-icon>
          <span>个人设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header>
        <div class="header-content">
          <h2>{{ currentTitle }}</h2>
          <div class="header-actions">
            <span class="username">{{ userStore.user?.username }}</span>
            <el-dropdown @command="handleCommand">
              <el-avatar :size="32" :src="userStore.user?.avatar">
                <el-icon><UserFilled /></el-icon>
              </el-avatar>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">个人设置</el-dropdown-item>
                  <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/store';
import { ElMessageBox } from 'element-plus';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);

const currentTitle = computed(() => {
  const titleMap: Record<string, string> = {
    Projects: '项目管理',
    CreateProject: '创建项目',
    EditProject: '编辑项目',
    Stats: '统计分析',
    Profile: '个人设置',
  };
  return titleMap[route.name as string] || '监控系统';
});

const handleCommand = async (command: string) => {
  if (command === 'profile') {
    router.push('/profile');
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      });
      userStore.logout();
      router.push('/login');
    } catch {
      // User canceled
    }
  }
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.el-aside {
  background-color: #304156;
  color: #fff;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  gap: 8px;
}

.el-menu {
  border-right: none;
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h2 {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  font-size: 14px;
  color: #606266;
}

.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
