<template>
  <div class="stats-container">
    <div class="page-header">
      <h2>{{ project?.name || '统计分析' }}</h2>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        @change="fetchStats"
      />
    </div>

    <!-- Stats Cards -->
    <el-row :gutter="20" class="stats-cards">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #409eff;">
              <el-icon :size="24" color="white"><View /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">页面浏览量</div>
              <div class="stat-value">{{ dashboardStats.totalPageViews.toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #67c23a;">
              <el-icon :size="24" color="white"><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">独立访客</div>
              <div class="stat-value">{{ dashboardStats.totalUniqueVisitors.toLocaleString() }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #e6a23c;">
              <el-icon :size="24" color="white"><Timer /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">平均加载时间</div>
              <div class="stat-value">{{ dashboardStats.avgLoadTime.toFixed(2) }}s</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-icon" style="background-color: #f56c6c;">
              <el-icon :size="24" color="white"><Connection /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-label">实时在线</div>
              <div class="stat-value">{{ dashboardStats.realTimeVisitors }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Charts -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="16">
        <el-card shadow="never">
          <template #header>
            <h3>访问趋势</h3>
          </template>
          <div ref="trendChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never">
          <template #header>
            <h3>浏览器分布</h3>
          </template>
          <div ref="browserChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <h3>热门页面</h3>
          </template>
          <el-table :data="pageStats" stripe>
            <el-table-column prop="title" label="页面标题" show-overflow-tooltip />
            <el-table-column prop="views" label="浏览量" width="120" />
            <el-table-column prop="uniqueVisitors" label="独立访客" width="120" />
          </el-table>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="never">
          <template #header>
            <h3>性能指标</h3>
          </template>
          <el-table :data="performanceStats" stripe>
            <el-table-column prop="url" label="页面" show-overflow-tooltip />
            <el-table-column label="加载时间" width="120">
              <template #default="{ row }">
                {{ row.avgLoadTime.toFixed(2) }}s
              </template>
            </el-table-column>
            <el-table-column label="FCP" width="100">
              <template #default="{ row }">
                {{ row.avgFCP.toFixed(2) }}s
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { projectApi, statsApi, type Project, type DashboardStats, type PageStat, type PerformanceStat, type VisitorStats } from '@/api';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

const route = useRoute();
const projectId = route.params.projectId as string;

const project = ref<Project | null>(null);
const dashboardStats = ref<DashboardStats>({
  totalPageViews: 0,
  totalUniqueVisitors: 0,
  avgLoadTime: 0,
  realTimeVisitors: 0,
  dailyStats: [],
});
const pageStats = ref<PageStat[]>([]);
const performanceStats = ref<PerformanceStat[]>([]);
const visitorStats = ref<VisitorStats>({
  browsers: [],
  os: [],
  screens: [],
});

const dateRange = ref<[Date, Date]>([
  dayjs().subtract(7, 'day').toDate(),
  dayjs().toDate(),
]);

const trendChartRef = ref<HTMLDivElement>();
const browserChartRef = ref<HTMLDivElement>();
let trendChart: echarts.ECharts | null = null;
let browserChart: echarts.ECharts | null = null;

const fetchProject = async () => {
  try {
    project.value = await projectApi.getProjectById(projectId);
  } catch (error) {
    // Error handled by request interceptor
  }
};

const fetchStats = async () => {
  try {
    const [dashboard, pages, performance, visitors] = await Promise.all([
      statsApi.getDashboardStats(projectId, 7),
      statsApi.getPageStats(projectId, { limit: 10 }),
      statsApi.getPerformanceStats(projectId),
      statsApi.getVisitorStats(projectId),
    ]);

    dashboardStats.value = dashboard;
    pageStats.value = pages;
    performanceStats.value = performance;
    visitorStats.value = visitors;

    await nextTick();
    renderCharts();
  } catch (error) {
    // Error handled by request interceptor
  }
};

const renderCharts = () => {
  // Trend Chart
  if (trendChartRef.value) {
    if (!trendChart) {
      trendChart = echarts.init(trendChartRef.value);
    }

    const dates = dashboardStats.value.dailyStats.map((stat) => stat.statDate);
    const pageViews = dashboardStats.value.dailyStats.map((stat) => stat.pageViews);
    const uniqueVisitors = dashboardStats.value.dailyStats.map((stat) => stat.uniqueVisitors);

    trendChart.setOption({
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: ['页面浏览量', '独立访客'],
      },
      xAxis: {
        type: 'category',
        data: dates,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '页面浏览量',
          type: 'line',
          data: pageViews,
          smooth: true,
        },
        {
          name: '独立访客',
          type: 'line',
          data: uniqueVisitors,
          smooth: true,
        },
      ],
    });
  }

  // Browser Chart
  if (browserChartRef.value) {
    if (!browserChart) {
      browserChart = echarts.init(browserChartRef.value);
    }

    const browserData = visitorStats.value.browsers.map((item) => ({
      name: item.name,
      value: item.count,
    }));

    browserChart.setOption({
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          radius: '70%',
          data: browserData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });
  }
};

onMounted(() => {
  fetchProject();
  fetchStats();

  window.addEventListener('resize', () => {
    trendChart?.resize();
    browserChart?.resize();
  });
});

onUnmounted(() => {
  trendChart?.dispose();
  browserChart?.dispose();
});
</script>

<style scoped>
.stats-container {
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

.stats-cards {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 350px;
}

:deep(.el-card__header h3) {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
}
</style>
