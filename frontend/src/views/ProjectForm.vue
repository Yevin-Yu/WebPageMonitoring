<template>
  <div class="project-form-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <h3>{{ isEdit ? '编辑项目' : '创建项目' }}</h3>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" />
        </el-form-item>

        <el-form-item label="项目描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入项目描述"
          />
        </el-form-item>

        <el-form-item label="网站地址" prop="website">
          <el-input v-model="form.website" placeholder="请输入网站地址" />
        </el-form-item>

        <el-form-item v-if="isEdit" label="状态" prop="isActive">
          <el-switch v-model="form.isActive" />
        </el-form-item>

        <el-form-item>
          <el-button @click="cancel">取消</el-button>
          <el-button type="primary" :loading="loading" @click="submit">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { projectApi, type Project, type CreateProjectParams, type UpdateProjectParams } from '@/api';

const router = useRouter();
const route = useRoute();

const formRef = ref<FormInstance>();
const loading = ref(false);
const project = ref<Project | null>(null);

const isEdit = computed(() => !!route.params.id);

const form = reactive<CreateProjectParams & { isActive?: boolean }>({
  name: '',
  description: '',
  website: '',
  isActive: true,
});

const rules: FormRules = {
  name: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 1, max: 100, message: '项目名称长度在 1 到 100 个字符', trigger: 'blur' },
  ],
  description: [
    { max: 500, message: '描述长度不能超过 500 个字符', trigger: 'blur' },
  ],
  website: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          // Allow empty website field
          callback();
        } else if (!/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value)) {
          callback(new Error('请输入正确的URL格式'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const fetchProject = async () => {
  const id = route.params.id as string;
  try {
    project.value = await projectApi.getProjectById(id);
    form.name = project.value.name;
    form.description = project.value.description || '';
    form.website = project.value.website || '';
    form.isActive = project.value.isActive;
  } catch (error) {
    // Error handled by request interceptor
  }
};

const submit = async () => {
  if (!formRef.value) return;

  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        // Remove empty website field
        const { isActive, ...submitData } = form;
        if (!submitData.website) {
          delete submitData.website;
        }

        if (isEdit.value) {
          const id = route.params.id as string;
          await projectApi.updateProject(id, { ...submitData, isActive });
          ElMessage.success('更新成功');
        } else {
          await projectApi.createProject(submitData);
          ElMessage.success('创建成功');
        }
        router.push('/projects');
      } catch (error) {
        // Error handled by request interceptor
      } finally {
        loading.value = false;
      }
    }
  });
};

const cancel = () => {
  router.back();
};

onMounted(() => {
  if (isEdit.value) {
    fetchProject();
  }
});
</script>

<style scoped>
.project-form-container {
  max-width: 800px;
  margin: 0 auto;
}

.card-header h3 {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}
</style>
