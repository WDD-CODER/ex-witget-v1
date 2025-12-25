<template>
  <div class="monograph-screen">
    <div class="monograph-header">
      <button class="back-btn" @click="$emit('set-screen', 'ResultsScreen')">
        <span class="arrow">←</span>
      </button>
      <section class="materials-interaction">
        <div class="main-drug">{{ mainDrugName }}</div>
        <div class="interacted">{{ interactedDrugName }}</div>
      </section>
      <div class="articles" v-if="articleNum">A
        <span class="num-of-articles">{{ articleNum }}
        </span>
      </div>
    </div>
    <div class="monograph-body">
      <div v-if="!!interactionData" class="drug-info">
        interactions
      </div>
      <div v-else class="loader">
        <span class="spinner"></span>
      </div>
      <!-- <div class="label-info" v-html="SelectedLabelData"></div> -->
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
  },
  data() {
    return {
      interactionData: null,
      articleNum: 1,
    }
  },
}
</script>

<style scoped>
.monograph-screen {

  .monograph-header {
    justify-content: space-around;

    div {
      display: flex;
      text-align: center;
      justify-content: space-evenly;
      align-items: center;
      border: 1px black solid;
    }

    .materials-interaction {
      display: flex;

      .main-drug {
        border-radius: 1vh;
      }

      .interacted {
        border-radius: 1vh;
      }

    }

    .articles {
      width: 30px;
      height: 30px;
      border-radius: 50%;
    }


  }


  .monograph-body {

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