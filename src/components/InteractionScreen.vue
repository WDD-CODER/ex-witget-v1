<template>
  <div class="monograph-screen">
    <div class="monograph-header">
      <button class="back-btn" @click="$emit('set-screen', 'ResultsScreen')">
        <span class="arrow">←</span>
      </button>
      <section class="materials-interaction">
        <div class="main-drug pill-left">{{ mainDrugName }}</div>
        <div class="interacted pill-right">{{ interactedDrugName }}</div>
      </section>
      <div class="articles" v-if="articleNum || articleNum === 0">A
        <span class="num-of-articles">({{ articleNum }})
        </span>
      </div>
    </div>
    <div class="monograph-body">
      <div v-if="!!interactionInfo" class="drug-info" v-html="interactionInfo.summary">

      </div>
      <div v-else class="loader">
        <span class="spinner"></span>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'InteractionScreen'
  ,
  props: {
    mainDrugName: {
      type: String,
      required: true
    },
    interactedDrugName: {
      type: String,
      required: true
    },
    interactionInfo: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      interactionData: null,
      articleNum: 0,
    }
  },
}
</script>

<style scoped>
.monograph-screen {
  border-radius: 24px;

  .monograph-header {
    display: flex;
    justify-content: space-around;
    padding: 18px 5px;

    border-top-left-radius: inherit;
    border-top-right-radius: inherit;

    div {
      display: flex;
      justify-content: space-evenly;
      align-items: center;

      text-align: center;
      border: 1px black solid;
    }

    .materials-interaction {
      display: flex;

      .main-drug {
        width: 115px;
        height: 40px;

        background-color: #ffffff;

        border: 1px solid transparent;
        border-right: 2px solid #55c595;
        border-radius: 50px;
      }

      .interacted {
        width: 115px;
        height: 40px;

        background-color: #ffffff;

        border: 1px solid transparent;
        border-left: 2px solid #55c595;
        border-radius: 50px;
      }
    }

    .articles {
      display: flex;
      position: relative;

      justify-content: center;
      align-items: center;
      width: 42px;
      height: 42px;

      background-color: #ffffff;
      color: #133146;

      border-radius: 50%;

      .num-of-articles {
        position: relative;
        top: 1px;

        color: #6f818e;
        font-size: 10px;
      }
    }
  }

  .monograph-body {
    border-radius: inherit;
    overflow-y: auto;

    .label-info {
      display: grid;
    }

    .loader {
      position: absolute;
      left: calc(50% - 13px);
    }
  }
}
</style>