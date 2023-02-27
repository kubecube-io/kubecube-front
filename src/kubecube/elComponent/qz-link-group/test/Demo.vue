<template>
  <section class="container">
    <div class="cell">
      <div class="title">
        max:3
      </div>
      <qz-link-group>
        <el-link>默认链接</el-link>
        <el-link
          type="primary"
          @click="test"
        >
          主要链接
        </el-link>
        <el-link
          type="success"
          @click="test"
        >
          成功链接
        </el-link>
        <el-link
          type="warning"
          @click="test"
        >
          警告链接
        </el-link>
      </qz-link-group>
    </div>
    <div class="cell">
      <div class="title">
        max:5
      </div>
      <qz-link-group max="5">
        <el-link>默认链接</el-link>
        <el-link
          type="primary"
          @click="test"
        >
          主要链接
        </el-link>
        <el-link
          type="success"
          @click="test"
        >
          成功链接
        </el-link>
        <el-link
          type="warning"
          @click="test"
        >
          警告链接
        </el-link>
        <el-link
          type="danger"
          @click="test"
        >
          危险链接
        </el-link>
        <el-link
          type="info"
          @click="test"
        >
          信息链接
        </el-link>
      </qz-link-group>
    </div>
    <div class="cell">
      <div class="title">
        max:5
      </div>
      <qz-link-group
        max="5"
        is-button
        more-type="danger"
      >
        <el-button>默认链接</el-button>
        <el-button
          type="primary"
          @click="test"
        >
          主要链接
        </el-button>
        <el-button
          type="success"
          @click="test"
        >
          成功链接
        </el-button>
        <el-button
          type="warning"
          @click="test"
        >
          警告链接
        </el-button>
        <el-button
          type="danger"
          @click="test"
        >
          危险链接
        </el-button>
        <el-button
          type="info"
          @click="test"
        >
          信息链接
        </el-button>
      </qz-link-group>
    </div>
  </section>
</template>
<script>
export default {
    methods: {
        test() {
            console.log('asbdashjd');
        },
    },
};
</script>
<style>
.cell {
    border: 1px solid #d6d6d6;
    margin: 20px 0;
    padding: 20px;
}
.title {
    margin-bottom: 10px;
    font-weight: bold;
}
</style>
