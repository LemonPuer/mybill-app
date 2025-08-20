<template>
  <div>
    <!-- 顶部数据概览 -->
    <div class="stats-overview">
      <el-card class="stat-card income-card">
        <div class="stat-icon">
          <el-icon>
            <ArrowDownBold />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">本月收入</div>
          <div class="stat-value">{{ overviewData.income.amount ? overviewData.income.amount : '-' }} 元</div>
        </div>
      </el-card>

      <el-card class="stat-card expense-card">
        <div class="stat-icon">
          <el-icon>
            <ArrowUpBold />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">本月支出</div>
          <div class="stat-value">{{ overviewData.expend.amount ? overviewData.expend.amount : '-' }} 元</div>
        </div>
      </el-card>

      <el-card class="stat-card balance-card">
        <div class="stat-icon">
          <el-icon>
            <Wallet />
          </el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-label">本月结余</div>
          <div class="stat-value">{{ overviewData.balance.amount ? overviewData.balance.amount : '-' }} 元</div>
        </div>
      </el-card>
    </div>

    <div class="dashboard-grid">
      <!-- 左侧列 -->
      <div class="grid-column">
        <!-- 近期账单 -->
        <el-card class="dashboard-grid-card recently-bill" :header-class="'recently-bill-card-header'">
          <template #header>
            <strong class="card-header-title">近期账单</strong>
            <el-link class="card-header-link" @click.prevent="skipBill('/bill')" underline="never">查看全部</el-link>
          </template>
          <div class="recentlyBill-empty-state" v-if="recentlyBillList.length === 0">
            <div class="common-empty-state">
              <strong>当月暂无账单</strong>
            </div>
          </div>
          <ol v-else>
            <li v-for="item in recentlyBillList" :key="item.id">
              <div class="recently-bill-item">
                <div class="recently-bill-item-title">
                  <el-icon>
                    <Wallet />
                  </el-icon>
                  <div>
                    <strong>{{ item.note }}</strong>
                    <span>{{ item.transactionDate }}</span>
                  </div>
                </div>
                <div class="recently-bill-item-content">
                  <span>{{ item.amount }}</span>
                </div>
              </div>
            </li>
          </ol>
        </el-card>

        <!-- 消费分类占比 -->
        <el-card class="dashboard-grid-card Consumption-pie" :header-class="'recently-bill-card-header'">
          <template #header>
            <strong class="card-header-title">消费分类占比</strong>
            <el-link class="card-header-link" @click.prevent="skipBill('/bill')" underline="never">查看详情</el-link>
          </template>
          <div class="consumption-pie-chart" v-if="chartOption.series[0].data.length === 0">
            <div class="common-empty-state">
              <strong>本月暂无数据</strong>
            </div>
          </div>
          <div class="consumption-pie-chart" v-else>
            <v-chart :option="chartOption" />
          </div>
        </el-card>

        <!-- 财务目标 -->
        <el-card class="dashboard-grid-card Financial-list-card" :header-class="'recently-bill-card-header'">
          <template #header>
            <strong class="card-header-title">财务目标</strong>
            <el-link class="card-header-link" @click.prevent="skipBill('/manage')" underline="never">管理目标</el-link>
          </template>
          <div class="consumption-pie-chart" v-if="financialObjectives.length === 0">
            <div class="common-empty-state">
              <strong>暂未设置目标</strong>
            </div>
          </div>
          <div class="consumption-pie-chart" v-else>
            <!-- todo: 财务目标 -->
            <ol>
              <li v-for="(item, index) in financialObjectives" :key="index">
                <el-card shadow="never">
                  <div class="card-content">
                    <div class="card-title">
                      <div class="card-icon">
                        <img :src="item.icon" alt="">
                      </div>
                      <div class="card-text">
                        <div class="card-text-title">{{ item.objective }}</div>
                      </div>
                    </div>
                  </div>
                </el-card>
              </li>
            </ol>
          </div>
        </el-card>


      </div>
      <!-- 右侧列 -->
      <div class="grid-column">
        <!-- 预算执行情况 -->
        <el-card class="dashboard-grid-card budget-list-card" :header-class="'recently-bill-card-header'">
          <template #header>
            <strong class="card-header-title">预算执行情况</strong>
            <el-link class="card-header-link" @click.prevent="skipBill('/manage')" underline="never">查看全部</el-link>
          </template>
          <div class="budget-list-empty-state" v-if="recentlyBillList.length === 0">
            <div class="common-empty-state">
              <strong>暂未设置预算</strong>
            </div>
          </div>
          <!-- todo：预算数据展示 -->
        </el-card>

        <!-- 类型管理 -->
        <el-card class="dashboard-grid-card category-list-card" :header-class="'recently-bill-card-header'">
          <template #header>
            <strong class="card-header-title">类型管理</strong>
            <el-link class="card-header-link" @click.prevent="skipBill('/manage')" underline="never">查看全部</el-link>
          </template>
          <div>
            <ol class="category-list-state">
              <li v-for="item in categoryList" :key="item.id">
                <div class="button-with-text">
                  <el-button :icon="item.icon" circle size='large' @click="openCategoryDialog(true, item)" />
                  <span>{{ item.category }}</span>
                </div>
              </li>
              <li>
                <div class="button-with-text">
                  <el-button :icon="ElIcons.Plus" type="primary" circle size='large'
                    @click="openCategoryDialog(false, null)" />
                  <span>更多</span>
                </div>
              </li>
            </ol>
          </div>
        </el-card>

        <!-- 消费趋势 -->



      </div>
    </div>


    <!-- 新增/编辑分类弹窗 -->
    <el-dialog v-model="showCategoryDialog" :title="isEditCategory ? '编辑分类' : '新增分类'" center :append-to-body="true">
      <el-form ref="categoryFormRef" :model="category" @submit.prevent="submitCategory" label-position="top"
        :rules="newCategoryRules">
        <el-form-item label="分类名称" prop="category">
          <el-input v-model="category.category" placeholder="请输入分类名称" />
        </el-form-item>

        <!-- 图标选择 -->
        <el-form-item label="选择图标" prop="icon">
          <el-scrollbar>
            <el-radio-group v-model="category.icon">
              <div class="icon-list">
                <el-radio-button class="icon-item" v-for="icon in iconOptions" :key="icon.name" :value="icon.name">
                  <el-icon>
                    <component :is="icon.component" />
                  </el-icon>
                </el-radio-button>
              </div>
            </el-radio-group>
          </el-scrollbar>
        </el-form-item>

        <div style="text-align: center;">
          <el-button @click="showCategoryDialog = false">取消</el-button>
          <el-button type="primary" native-type="submit">提交</el-button>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import router from '@/router';
import * as billApi from '@/services/bill';
import { formatFriendlyTime, getMonthRangeTimestamps, } from '@/utils/commonUtil';
import * as ElIcons from '@element-plus/icons-vue';
import { ElLoading, ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { onMounted, reactive, ref } from 'vue';
import VChart from 'vue-echarts';
// 引入需要的图表类型
import { BarChart, PieChart } from 'echarts/charts';
// 引入必要的组件（如 tooltip、legend 等）
import {
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent
} from 'echarts/components';
// 引入 Canvas 渲染器（必须）
import { CanvasRenderer } from 'echarts/renderers';
// 局部注册需要的图表类型
import Category from '@/models/Category';
import type FinanceTransactions from '@/models/FinanceTransactions';
import type FinancialObjectives from '@/models/FinancialObjectives';
import { use } from 'echarts/core';

use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  PieChart,
  CanvasRenderer
])

// 控制弹窗显示
const showCategoryDialog = ref(false);
const overviewData: {
  income: {
    amount: number;
    type: number;
    ratio: string
    ratioType: number
  },
  expend: {
    amount: number;
    type: number;
    ratio: string
    ratioType: number
  },
  balance: {
    amount: number;
    type: number;
    ratio: string
    ratioType: number
  }
} = reactive({
  income: {
    amount: 0,
    type: 0,
    ratio: '0%',
    ratioType: 0
  },
  expend: {
    amount: 0,
    type: 0,
    ratio: '0%',
    ratioType: 0
  },
  balance: {
    amount: 0,
    type: 0,
    ratio: '0%',
    ratioType: 0
  }
});

const recentlyBillList = ref<Array<FinanceTransactions>>([]);

const chartOption = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{a}<br/>{b}: {c}元 ({d}%)'
  },
  legend: {
    orient: 'vertical',
    right: '5%',
    top: 'center',
    data: ['餐饮', '交通', '购物', '娱乐', '其他']
  },
  series: [
    {
      name: '消费分类',
      type: 'pie',
      radius: '80%',
      center: ['30%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 1048, name: '餐饮' },
        { value: 732, name: '交通' },
        { value: 530, name: '购物' },
        { value: 310, name: '娱乐' },
        { value: 274, name: '其他' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
});

// 图标选项列表
const iconOptions = Object.keys(ElIcons).map((key) => ({
  name: key,
  component: ElIcons[key as keyof typeof ElIcons],
}));

const newCategoryRules = reactive<FormRules<Category>>({
  category: [
    { required: true, message: '请输入分类名', trigger: ['blur'] },
  ],
  icon: [
    { required: true, message: '请选择图标', trigger: ['blur'] },
  ],
});

const categoryList = ref<Array<Category>>([]);

const isEditCategory = ref(false);
const categoryFormRef = ref<FormInstance>();
const category = ref(new Category('', '', 0));

const financialObjectives = ref<Array<FinancialObjectives>>([]);

//打开编辑/新增分类弹窗
const openCategoryDialog = (isEdit: boolean, item: Category | null) => {
  isEditCategory.value = isEdit;
  if (isEdit && item) {
    category.value = new Category(item.category, item.icon, item.id);
  } else {
    category.value = Category.getCategory();
  }
  categoryFormRef.value?.resetFields();
  // 打开弹窗
  showCategoryDialog.value = true;
}

// 提交分类的方法
const submitCategory = () => {
  // 这里可以调用 API 或者触发父组件事件
  categoryFormRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error('请检查必填项是否填写完整！')
      return;
    }
    const payload = (({ id, category, icon }) =>
      id ? { category, icon, id } : { category, icon })(category.value);
    billApi.saveCategory(payload)
      .then(() => {
        ElMessage.success('添加成功');
        // 提交后清空数据
        category.value.category = '';
        category.value.icon = '';
        category.value.id = 0;
        flashCategory();
        showCategoryDialog.value = false;
      })
  })
};

const skipBill = (to: string) => {
  router.push(to);
};

onMounted(() => {
  // 显示加载动画
  const loadingInstance = ElLoading.service({
    fullscreen: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.5)',
  });
  try {
    const { monthStart, monthEnd } = getMonthRangeTimestamps() as { monthStart: string; monthEnd: string };
    // 获取渲染数据
    // 顶部数据概览
    billApi.getCashFlowCard({ startTime: monthStart, endTime: monthEnd })
      .then((res) => {
        const dataList = res.data.data as Array<{
          amount: number;
          type: number;
          ratio: string;
          ratioType: number;
        }>;
        dataList.forEach(item => {
          if (item.type === 1) {
            overviewData.income.amount = item.amount;
            overviewData.income.ratio = item.ratio || '0%';
            overviewData.income.ratioType = item.ratioType;
          } else if (item.type === 2) {
            overviewData.expend.amount = item.amount;
            overviewData.expend.ratio = item.ratio || '0%';
            overviewData.expend.ratioType = item.ratioType;
          } else if (item.type === 3) {
            overviewData.balance.amount = item.amount;
            overviewData.balance.ratio = item.ratio || '0%';
            overviewData.balance.ratioType = item.ratioType;
          }
        });
      });

    // 近期账单
    billApi.getFinanceTransactionsList({ startTime: monthStart, endTime: monthEnd, pageNum: 1, pageSize: 3 })
      .then((res) => {
        recentlyBillList.value = (res.data.data.result);
        recentlyBillList.value.forEach(item => {
          item.transactionDate = formatFriendlyTime(item.transactionDate);
        });
      });

    //预算执行情况


    //消费分类占比

    //类型管理
    flashCategory();

    //财务目标
    billApi.financialObjectives({ pageNum: 1, pageSize: 2 })
      .then((res) => {
        financialObjectives.value = res.data.data.result;
      });


  } catch (error) {
    console.error('API 请求失败:', error);
    ElMessage.error('数据加载失败，请重试');
  } finally {
    loadingInstance.close();
  }

});

//刷新分类
const flashCategory = () => {
  billApi.getCategory({ pageNum: 1, pageSize: 4 })
    .then((res) => {
      categoryList.value = res.data.data.result;
    });
}
</script>


<style>
/* 近期账单 */
.recently-bill-card-header {
  padding: 10px;
  display: flex;
  border: 0cap;
}
</style>

<style scoped>
.icon-list {
  display: flex;
  gap: 10px;
  padding: 0;
  margin: 0;
}

.icon-item {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
  margin: 0px 0px 10px 0px;
}

.icon-item:hover,
.icon-item.is-active {
  background-color: #63bbe1;
}

.icon-item .el-icon {
  font-size: 24px;
}

.el-button--large {
  --el-button-size: 43px;
  font-size: 20px;
}

/* 网格布局 - 优化间距 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* 增大间距 */
  gap: 20px;
  /* 增大底部间距 */
  margin-bottom: 20px;
}

.grid-column {
  display: flex;
  flex-direction: column;
  /* 增大列间距 */
  gap: 20px;
}

.common-empty-state {
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /*  Element Plus 提供的辅助文字颜色*/
  color: var(--el-text-color-secondary);
  /* 占满父容器剩余空间 */
  flex: 1;
}

.recentlyBill-empty-state {
  display: flex;
  height: 250px;
}

.budget-list-empty-state {
  display: flex;
  height: 200px;
}

.category-list-state {
  display: flex;
  height: 60px;
  gap: 10px;
}

.category-list-state li {
  justify-content: center;
  align-items: center;
  display: flex;
}

.button-with-text {
  display: flex;
  /* 子元素垂直排列 */
  flex-direction: column;
  /* 水平居中 */
  align-items: center;
}

.button-with-text span {
  margin-top: 5px;
  font-size: 12px;
}

.consumption-pie-chart {
  display: flex;
  height: 180px;
}

.card-header-title {
  flex: 70%;
  text-align: left;
  padding: 0px 10px;
}

.card-header-link {
  flex: auto;
  text-align: center;
  color: #6200EE;
  background-color: transparent;
}

.card-header-link:hover {
  opacity: 0.3;
}


.dashboard-grid-card {
  border-radius: 8%;
}


:deep(.recently-bill .el-card__body) {
  padding: 0px 10px 10px 10px;
  height: 260px;
}

:deep(.budget-list-card .el-card__body) {
  padding: 0px 10px 10px 10px;
  height: 210px;
}

:deep(.Consumption-pie .el-card__body) {
  padding: 0px;
  height: 180px;
}

:deep(.category-list-card .el-card__body) {
  padding: 0px 10px 10px 10px;
  height: 70px;
}

:deep(.stat-card .el-card__body) {
  padding: 0px;
  display: flex;
  width: 150px;
  height: 45px;
}

/* 收入卡片样式 */
.income-card {
  border-left-color: #00BFA6;
}

.stat-icon {
  border-radius: 100%;
  width: 36px;
  height: 36px;
  margin-top: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.income-card .stat-icon {
  background-color: rgba(0, 191, 166, 0.1);
  color: #00BFA6;
}

/* 支出卡片样式 */
.expense-card {
  border-left-color: #FF5252;
}

.expense-card .stat-icon {
  background-color: rgba(255, 82, 82, 0.1);
  color: #FF5252;
}

/* 结余卡片样式 */
.balance-card {
  border-left-color: #6200EE;
}

.balance-card .stat-icon {
  background-color: rgba(98, 0, 238, 0.1);
  color: #6200EE;
}

/* 悬停效果优化 */
.stat-card {
  display: flex;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* 顶部数据概览 */
.stats-overview {
  display: flex;
  justify-content: space-around;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
  /* 允许在小屏幕换行 */
}

/* 卡片基础样式 */
.stat-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  border-left: 4px solid transparent;
  display: flex;
}

/* 增强响应式布局 */
@media (max-width: 768px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .stats-overview {
    grid-template-columns: 1fr;
  }
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* 收入样式 */
.income-card {
  border-left-color: #00BFA6;
}

.income-card .stat-icon {
  background-color: rgba(0, 191, 166, 0.1);
  color: #00BFA6;
}

/* 支出样式 */
.expense-card {
  border-left-color: #FF5252;
}

.expense-card .stat-icon {
  background-color: rgba(255, 82, 82, 0.1);
  color: #FF5252;
}

/* 结余样式 */
.balance-card {
  border-left-color: #6200EE;
}

.balance-card .stat-icon {
  background-color: rgba(98, 0, 238, 0.1);
  color: #6200EE;
}

/* 文字样式 */
.stat-info {
  margin-left: 20px;
  flex: 1;
}

.stat-label {
  font-size: 12px;
  color: #666;
  margin-bottom: 3px;
}

.stat-value {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}
</style>
