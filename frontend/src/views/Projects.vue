<template>
  <div class="projects-container">
    <div class="page-header">
      <h2>我的项目</h2>
      <el-button type="primary" :icon="Plus" @click="createProject">新建项目</el-button>
    </div>

    <el-card shadow="never">
      <el-table :data="projects" v-loading="loading">
        <el-table-column prop="name" label="项目名称" width="200" />
        <el-table-column prop="key" label="项目Key" width="280">
          <template #default="{ row }">
            <el-input
              v-model="row.key"
              readonly
              size="small"
              style="width: 260px"
            >
              <template #append>
                <el-button :icon="CopyDocument" @click="copyKey(row.key)" />
              </template>
            </el-input>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip />
        <el-table-column prop="website" label="网站地址" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.isActive ? 'success' : 'info'">
              {{ row.isActive ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              :icon="DataAnalysis"
              @click="viewStats(row)"
            >
              统计
            </el-button>
            <el-button
              type="default"
              size="small"
              :icon="Edit"
              @click="editProject(row)"
            >
              编辑
            </el-button>
            <el-popconfirm
              title="确定要删除这个项目吗？"
              @confirm="deleteProject(row.id)"
            >
              <template #reference>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                />
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="fetchProjects"
          @current-change="fetchProjects"
        />
      </div>
    </el-card>

    <!-- Integration Dialog -->
    <el-dialog
      v-model="integrationDialogVisible"
      title="集成代码"
      width="600px"
    >
      <el-alert
        title="将以下代码添加到您的网站中"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px"
      />
      <el-input
        :model-value="integrationCode"
        type="textarea"
        :rows="6"
        readonly
      />
      <template #footer>
        <el-button @click="integrationDialogVisible = false">关闭</el-button>
        <el-button type="primary" :icon="CopyDocument" @click="copyIntegrationCode">
          复制代码
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Plus,
  Edit,
  Delete,
  CopyDocument,
  DataAnalysis,
} from '@element-plus/icons-vue';
import { projectApi, type Project } from '@/api';
import dayjs from 'dayjs';

const router = useRouter();

const loading = ref(false);
const projects = ref<Project[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

const integrationDialogVisible = ref(false);
const selectedProject = ref<Project | null>(null);

const integrationCode = computed(() => {
  if (!selectedProject.value) return '';
  return `<script src="${window.location.origin}/sdk.js?key=${selectedProject.value.key}"><\/script>`;
});

const fetchProjects = async () => {
  loading.value = true;
  try {
    const response = await projectApi.getProjects({
      page: currentPage.value,
      limit: pageSize.value,
    });
    projects.value = response.projects;
    total.value = response.pagination.total;
  } catch (error) {
    // Error handled by request interceptor
  } finally {
    loading.value = false;
  }
};

const createProject = () => {
  router.push('/projects/create');
};

const editProject = (project: Project) => {
  router.push(`/projects/${project.id}/edit`);
};

const deleteProject = async (id: string) => {
  try {
    await projectApi.deleteProject(id);
    ElMessage.success('删除成功');
    fetchProjects();
  } catch (error) {
    // Error handled by request interceptor
  }
};

const viewStats = (project: Project) => {
  router.push(`/stats/${project.id}`);
};

const showIntegrationDialog = (project: Project) => {
  selectedProject.value = project;
  integrationDialogVisible.value = true;
};

const copyKey = async (key: string) => {
  try {
    await navigator.clipboard.writeText(key);
    ElMessage.success('复制成功');
  } catch {
    ElMessage.error('复制失败');
  }
};

const copyIntegrationCode = async () => {
  try {
    await navigator.clipboard.writeText(integrationCode.value);
    ElMessage.success('复制成功');
  } catch {
    ElMessage.error('复制失败');
  }
};

const formatDate = (date: string) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};

onMounted(() => {
  fetchProjects();
});
</script>

<style scoped>
.projects-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
