<template>
  <div class="monograph-screen">
    <div class="monograph-header">
      <button class="back-btn" @click="$emit('set-screen', 'MonographScreen')">
        <span class="arrow">←</span>
      </button>
      <h2>{{ selectedLabelTitle }}</h2>
    </div>
    <div class="monograph-body">
      <div class="label-info" v-html="selectedLabelData"></div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'LabelScreen'
  ,
  props: {
    selectedLabelData: {
      type: String,
      required: true
    },
    selectedLabelTitle: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      labelInfo: null,
    }
  },
}
</script>

<style scoped>
.monograph-screen {
  display: grid;
  position: relative;
  z-index: 1000;
  flex-direction: column;

  width: 100%;
  height: 270px;

  background: #f4f6f2;

  .monograph-header {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 1000;

    align-items: center;
    height: 30px;

    background: #e9ede4;

    h2 {
      margin: 0;

      color: #1b3a57;
      font-size: 22px;
      font-weight: 400;
      text-transform: uppercase;
    }

    .back-btn {
      display: flex;
      width: fit-content;

      color: #1b3a57;
      font-size: 20px;

      background: none;
      border: none;

      cursor: pointer;
    }
  }

  .monograph-body {
    display: grid;
    padding: 5px 15px;

    background-color: inherit;
    overflow-y: auto;

    .label-info {
      display: grid;
    }
  }
}
</style>