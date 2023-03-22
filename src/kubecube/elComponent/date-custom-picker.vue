<template>
  <div>
    <template v-if="currentType === 'quick'">
      <el-radio-group  v-model="quickValue" @change="handleQuickValueChange">
        <el-radio-button v-for="(item, index) in quickOptions" :key="index" :label="item.value">{{item.text}}</el-radio-button>
      </el-radio-group>
      <el-link style="margin-left:8px" type="primary" @click="handleChangeCurrentType('custom')">自定义</el-link>
    </template>
    <template
      v-else
    >
      <el-date-picker
        v-model="customStartTime"
        type="datetime"
        placeholder="开始时间"
        :clearable="false"
      />
      至
      <el-date-picker
        v-model="customEndTime"
        type="datetime"
        placeholder="结束时间"
        :clearable="false"
      />
      <el-button style="margin-left:8px" type="primary" @click="handleOk">确定</el-button>
      <el-link style="margin-left:8px" type="primary" @click="handleChangeCurrentType('quick')">返回默认</el-link>
    </template>

    <!-- <el-date-picker
      
      v-model="timeRange"
      type="datetimerange"
      range-separator="至"
      start-placeholder="开始日期"
      end-placeholder="结束日期">
    </el-date-picker> -->
  </div>
</template>
<script>
export default {
  props: {
    quickOptions: {
      type: Array,
      default: () => {
        return [
          { text: '近30分钟', value: 30 * 60 * 1000 },
          { text: '近6小时', value: 360 * 60 * 1000 },
          { text: '近1天', value: 1440 * 60 * 1000 },
        ]
      }
    },
    date: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
   return {
    currentType: 'quick', // quick custom
    quickValue: '',
    startTime: new Date(this.date.startTime),
    endTime: new Date(this.date.endTime),
    customStartTime: new Date(this.date.startTime),
    customEndTime: new Date(this.date.endTime),
   }
  },
  computed: {
    st() {
      return this.startTime.getTime()
    },
    et() {
      return this.endTime.getTime()
    },
    timeRange() {
      return { startTime: this.st, endTime: this.et, type: this.currentType, quickValue: this.quickValue}
    }
  },
  created() {
    this.initTime();
  },
  watch: {
    quickOptions(val) {
      this.initTime();
    },
    timeRange(val) {
      this.$emit('update', val);
    },
    customStartTime(val) {
      if(val.getTime() > this.customEndTime.getTime()) {
        this.customEndTime = new Date(val.getTime())
      }
    },
    customEndTime(val) {
      if(val.getTime() < this.customStartTime.getTime()) {
        this.customStartTime = new Date(val.getTime())
      }
    }
  },
  methods: {
    initTime() {
      this.quickValue = this.quickOptions[0] ? this.quickOptions[0].value : '';
      this.currentType = 'quick';
      const start = new Date();
      const end = new Date();
      start.setTime(start.getTime() - this.quickValue);
      this.startTime = start;
      this.endTime = end;
    },
    handleOk() {
      const start = new Date(this.customStartTime.getTime());
      const end = new Date(this.customEndTime.getTime());
      this.startTime = start;
      this.endTime = end;
    },
    handleChangeCurrentType(val) {
      if (val === 'quick') {
        this.initTime();
        this.currentType = val;
      } else {
        this.currentType = val;
        const start = new Date(this.startTime.getTime());
        const end = new Date(this.endTime.getTime());
        this.customStartTime = start;
        this.customEndTime = end;
      }
    },
    handleQuickValueChange(val) {
      console.log(val);
      const start = new Date();
      const end = new Date();
      start.setTime(start.getTime() - val);
      this.startTime = start;
      this.endTime = end;
    }
  }
}
</script>
