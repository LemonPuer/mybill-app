<template>
  <div>
    <!-- 账户管理 -->
    <el-card l-card class="manage-grid-card account-list-card" :header-class="'recently-bill-card-header'">
      <template #header>
        <strong class="card-header-title">账户管理</strong>
        <el-button :icon="Plus" type='' link plain color="#6200EE"
          @click="openAccountDialog(false, null)">添加账户</el-button>
      </template>
      <div>
        <el-table :data="accountList" :show-header="false">
          <el-table-column v-for="column in accountTablecolumns" :key="column.prop" :prop="column.prop"
            :label="column.label" :width="column.width" />
          <el-table-column fixed="right" label="Operations" min-width="140">
            <template #default="scope">
              <el-button size="small" type="primary" @click="openAccountDialog(scope.$index, scope.row)">
                编辑
              </el-button>
              <el-button size="small" type="danger" @click="deleteAccount(scope.$index, scope.row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>


    <!-- 新增/编辑账户弹窗 -->
    <el-dialog v-model="accountDialogVisible" :title="isEditAccount ? '编辑账户' : '新增账户'" width="30%">
      <el-form ref="accountFormRef" :model="currentAccount" @submit.prevent="submitAccount" :rules="accountRules"
        label-width="80px">
        <el-form-item label="账户名" prop="accountName">
          <el-input v-model="currentAccount.accountName" />
        </el-form-item>
        <el-form-item label="余额" prop="amount">
          <el-input-number v-model="currentAccount.amount" :precision="2" />
        </el-form-item>
        <el-form-item label="父账户" prop="pid">
          <el-select v-model="currentAccount.pid" placeholder="请选择父级账户" no-data-text="暂无可用账户">
            <el-option v-for="item in accountList" :key="item.id" :label="item.accountName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="accountType">
          <el-select v-model="currentAccount.accountType" placeholder="请选择账户类型">
            <el-option v-for="item in accountTypeEnumList" :key="item.key" :label="item.value" :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="分类" prop="accountCategory">
          <el-select v-model="currentAccount.accountCategory" placeholder="请选择账户分类">
            <el-option v-for="item in accountCategoryEnumList" :key="item.key" :label="item.value" :value="item.key" />
          </el-select>
        </el-form-item>
        <div style="text-align: center;">
          <el-button @click="accountDialogVisible = false">取消</el-button>
          <el-button type="primary" native-type="submit">保存</el-button>
        </div>
      </el-form>



    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import Account from '@/models/Account';
import type SimpleEnum from '@/models/SimpleEnum';
import * as billApi from '@/services/bill';
import { useDictionaryStore } from '@/stores/useCommonStore';
import { Plus } from '@element-plus/icons-vue';
import { ElLoading, ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { onMounted, reactive, ref, watchEffect } from 'vue';

const dictionaryStore = useDictionaryStore();
const accountCategoryEnumList = ref<Array<SimpleEnum>>([]);
const accountTypeEnumList = ref<Array<SimpleEnum>>([]);

const accountList = ref<Array<Account>>([])
const accountTablecolumns = ref([
  { prop: 'accountName', label: '账户名', width: '120' },
  { prop: 'accountType', label: '账户类型', width: '100' },
  { prop: 'accountCategory', label: '账户分类', width: '100' },
  { prop: 'amount', label: '金额', width: '120' },
  { prop: 'children', label: '子账户', width: '120' },
]);

const accountDialogVisible = ref(false)
const isEditAccount = ref(false)
const accountFormRef = ref<FormInstance>();
const currentAccount = ref(new Account('', '', '', 0))


const accountRules = reactive<FormRules<Account>>({
  accountName: [
    { required: true, message: '请输入账户名', trigger: ['blur'] },
  ],
  amount: [
    { required: true, message: '请输入金额', trigger: ['blur'] },
  ],
  accountType: [
    { required: true, message: '请选择账户类型', trigger: ['change'] },
  ],
  accountCategory: [
    { required: true, message: '请选择账户类别', trigger: ['change'] },
  ]
});

const openAccountDialog = (isEdit: boolean, item: Account | null) => {
  isEditAccount.value = isEdit;
  if (isEdit && item) {
    currentAccount.value = { ...item }
  } else {
    currentAccount.value = new Account('', '', '', 0)
  }
  accountFormRef.value?.resetFields();
  // 打开弹窗
  accountDialogVisible.value = true;
}

// 提交账户的方法
const submitAccount = () => {
  // 这里可以调用 API 或者触发父组件事件
  accountFormRef.value?.validate((valid) => {
    if (!valid) {
      ElMessage.error('请检查必填项是否填写完整！')
      return;
    }
    const data = ({ ...currentAccount.value });
    data.pid = 0;
    billApi.saveAccount(data)
      .then(() => {
        ElMessage.success('添加成功');
        // 提交后清空数据
        currentAccount.value = new Account('', '', '', 0);
        flashAccountList();
        accountDialogVisible.value = false;
      })
  })
};


const flashAccountList = () => {
  billApi.getAccounts({ pid: 0 }).then((res) => {
    accountList.value = res.data.data;
  });
};

const deleteAccount = (index: number, row: Account) => {
  console.log(index)
  console.log(row)
}

onMounted(() => {
  const loadingInstance = ElLoading.service({
    fullscreen: true,
    text: '加载中...',
    background: 'rgba(0, 0, 0, 0.5)',
  });
  try {
    flashAccountList();
  } catch (error) {
    console.error('API 请求失败:', error);
    ElMessage.error('数据加载失败，请重试');
  } finally {
    loadingInstance.close();
  }


});

watchEffect(() => {
  const categories = dictionaryStore.getDictionaryList("AccountCategory");
  const types = dictionaryStore.getDictionaryList("AccountType");

  if (categories && categories.length > 0) {
    accountCategoryEnumList.value = categories;
  }

  if (types && types.length > 0) {
    accountTypeEnumList.value = types;
  }
});
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
.manage-grid-card {
  border-radius: 16px;
}

.card-header-title {
  flex: 70%;
  text-align: left;
  padding: 0px 10px;
}
</style>
