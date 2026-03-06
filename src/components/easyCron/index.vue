<script setup lang="ts">
import { $toast, validate } from "@oeos-components/utils";
import { ref, getCurrentInstance, watch } from "vue";
import validateCron from "./cronValidate";
import { ElSelect, ElOption } from "element-plus";
const { proxy } = getCurrentInstance();

// 定义 cron 表达式的响应式变量
const cronExpression = ref("");
// 定义各个时间单位的响应式变量
const second = ref("*");
const minute = ref("*");
const hour = ref("*");
const day = ref("?");
const week = ref("*");
const month = ref("*");
const year = ref("*");

// * * * ? * * *
// 更新cron表达式
const updateCronExpression = () => {
  cronExpression.value = `${second.value} ${minute.value} ${hour.value} ${day.value} ${month.value} ${week.value} ${year.value}`;
};

// 监听各个时间单位的变化
watch([second, minute, hour, day, month, week, year], () => {
  updateCronExpression();
});

// 初始化cron表达式
updateCronExpression();

// cron 表达式改变时的回调函数
const handleCronChange = (value: string) => {
  console.log("Cron expression changed:", value);
  cronExpression.value = value;

  // 解析cron表达式到各个字段
  const parts = value.split(" ");
  if (parts.length >= 6) {
    [
      second.value,
      minute.value,
      hour.value,
      day.value,
      month.value,
      week.value
    ] = parts.slice(0, 6);
  }
  if (parts.length === 7) {
    year.value = parts[6];
  }
};
</script>

<template>
  <div>
    <div>test/t1.vue</div>

    <!-- gEaryCron 组件用于选择和回显定时任务数据 -->
    <div class="cron-section">
      <h3>Cron 表达式配置</h3>

      <!-- 分别设置秒、分、时、日、月、周、年 -->
      <div class="cron-fields">
        <div class="field-group">
          <label>秒:</label>
          <el-select
            v-model="second"
            size="small"
            @change="updateCronExpression"
          >
            <el-option value="*" label="任意值(*)" />
            <el-option value="0" label="0" />
            <el-option value="5" label="5" />
            <el-option value="10" label="10" />
            <el-option value="15" label="15" />
            <el-option value="30" label="30" />
            <el-option value="45" label="45" />
            <el-option value="*/5" label="每5秒" />
            <el-option value="*/10" label="每10秒" />
            <el-option value="*/30" label="每30秒" />
          </el-select>
        </div>

        <div class="field-group">
          <label>分:</label>
          <el-select
            v-model="minute"
            size="small"
            @change="updateCronExpression"
          >
            <el-option value="*" label="任意值(*)" />
            <el-option value="0" label="0" />
            <el-option value="5" label="5" />
            <el-option value="10" label="10" />
            <el-option value="15" label="15" />
            <el-option value="30" label="30" />
            <el-option value="45" label="45" />
            <el-option value="*/5" label="每5分钟" />
            <el-option value="*/10" label="每10分钟" />
            <el-option value="*/30" label="每30分钟" />
          </el-select>
        </div>

        <div class="field-group">
          <label>时:</label>
          <el-select v-model="hour" size="small" @change="updateCronExpression">
            <el-option value="*" label="任意值(*)" />
            <el-option value="0" label="0" />
            <el-option value="1" label="1" />
            <el-option value="2" label="2" />
            <el-option value="3" label="3" />
            <el-option value="4" label="4" />
            <el-option value="5" label="5" />
            <el-option value="6" label="6" />
            <el-option value="12" label="12" />
            <el-option value="*/2" label="每2小时" />
            <el-option value="*/3" label="每3小时" />
            <el-option value="*/6" label="每6小时" />
          </el-select>
        </div>

        <div class="field-group">
          <label>日:</label>
          <el-select v-model="day" size="small" @change="updateCronExpression">
            <el-option value="*" label="任意日期(*)" />
            <el-option value="?" label="不指定(?)" />
            <el-option value="1" label="1号" />
            <el-option value="15" label="15号" />
            <el-option value="L" label="月末(L)" />
            <el-option value="*/5" label="每5天" />
            <el-option value="*/10" label="每10天" />
            <el-option value="*/15" label="每15天" />
          </el-select>
        </div>

        <div class="field-group">
          <label>月:</label>
          <el-select
            v-model="month"
            size="small"
            @change="updateCronExpression"
          >
            <el-option value="*" label="任意月份(*)" />
            <el-option value="1" label="1月" />
            <el-option value="2" label="2月" />
            <el-option value="3" label="3月" />
            <el-option value="4" label="4月" />
            <el-option value="6" label="6月" />
            <el-option value="12" label="12月" />
            <el-option value="*/2" label="每2个月" />
            <el-option value="*/3" label="每3个月" />
          </el-select>
        </div>

        <div class="field-group">
          <label>周:</label>
          <el-select v-model="week" size="small" @change="updateCronExpression">
            <el-option value="?" label="不指定(?)" />
            <el-option value="*" label="任意星期(*)" />
            <el-option value="1" label="星期一" />
            <el-option value="2" label="星期二" />
            <el-option value="3" label="星期三" />
            <el-option value="4" label="星期四" />
            <el-option value="5" label="星期五" />
            <el-option value="6" label="星期六" />
            <el-option value="0" label="星期日" />
            <el-option value="L" label="月末星期几(L)" />
            <el-option value="#1" label="每月第1个星期" />
            <el-option value="#2" label="每月第2个星期" />
            <el-option value="#3" label="每月第3个星期" />
            <el-option value="#4" label="每月第4个星期" />
          </el-select>
        </div>

        <div class="field-group">
          <label>年:</label>
          <el-select v-model="year" size="small" @change="updateCronExpression">
            <el-option value="*" label="任意年(*)" />
            <el-option value="2023" label="2023" />
            <el-option value="2024" label="2024" />
            <el-option value="2025" label="2025" />
            <el-option value="2026" label="2026" />
          </el-select>
        </div>
      </div>

      <!-- 显示完整的cron表达式 -->
      <div class="full-cron-expression">
        <strong>完整表达式:</strong> {{ cronExpression }}
      </div>

      <!-- 原有的gEaryCron组件 -->
      <g-EaryCron
        v-model="cronExpression"
        placeholder="请选择 Cron 表达式"
        @change="handleCronChange"
      />
      <div class="current-value">当前值: {{ cronExpression }}</div>
    </div>
  </div>
</template>

<style scoped>
.cron-section {
  padding: 20px;
  margin-top: 20px;
  border: 1px solid #e0e0e0;
}

.current-value {
  margin-top: 10px;
  font-weight: bold;
}

.cron-fields {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
}

.field-group label {
  margin-bottom: 5px;
  font-weight: bold;
}

/* 替换原有的select样式 */
.field-group .el-select {
  width: 80%;
}

.full-cron-expression {
  padding: 10px;
  margin: 15px 0;
  word-break: break-all;
  background-color: #f5f5f5;
  border-radius: 4px;
}
</style>
