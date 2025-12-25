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

  height: 270px;


  flex-direction: column;
  width: 100%;

  background: #f4f6f2;

  z-index: 1000;

  .monograph-header {
    position: sticky;
    display: flex;

    height: 30px;
    align-items: center;
    padding: 10px 5px;

    background: #e9ede4;

    .back-btn {
      display: flex;

      width: fit-content;

      /* margin-right: 15px; */
      background: none;

      color: #1b3a57;
      font-size: 20px;

      border: none;

      cursor: pointer;
    }

    h2 {
      margin: 0;

      color: #1b3a57;
      font-size: 22px;
      font-weight: 400;
      text-transform: uppercase;
    }
  }


  .monograph-body {
    display: grid;
    padding: 15px;
    background-color: inherit;
  overflow-y: auto;


    .label-info{
      display: grid;
    }

  }


}
</style>