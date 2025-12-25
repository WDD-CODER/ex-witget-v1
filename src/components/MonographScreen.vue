<template>
  <div class="monograph-screen">
    <div class="monograph-header">
      <button class="back-btn" @click="$emit('set-screen', 'SearchScreen')">
        <span class="arrow">←</span>
      </button>
      <h2>{{ selectedItemName }}</h2>
    </div>
    <div class="monograph-body">
      <div v-if="!!drugInfo" class="drug-info">
        <div v-for="(value, title) in drugInfo" :key="title" class="drug-label" @click="setLabel(value, title)">
          <span class="title">{{ title }}</span>
          <span class="arrow">→</span>
        </div>
      </div>
      <div v-else class="loader">
        <span class="spinner"></span>
      </div>
    </div>
  </div>
</template>

<script>
import DrugService from '../services/drug.service';

export default {
  name: 'MonographScreen'
  ,
  props: {
    selectedItemName: {
      type: String,
      required: true
    },
  },
  data() {
    return {
      drugInfo: null,
    }
  },
  methods: {
    mapMaterialInfo(raw) {
      const labels = {};

      // 1. Preserving HTML for Background
      const backgroundParts = [raw.desc, raw.dBankDesc].filter(v => v?.trim());
      if (backgroundParts.length > 0) {
        labels['Background'] = backgroundParts.join('<br><br>');
      }

      // 2. Preserving HTML for Medicinal uses
      const clinicalParts = [raw.medicinalUsesTxt, raw.dBankClinicalDesc].filter(v => v?.trim());
      if (clinicalParts.length > 0) {
        labels['Medicinal uses'] = clinicalParts.join('<br><br>');
      }

      // 3. Preserving HTML for Dosage (Updated)
      if (raw.shortDosage) {
        labels['Daily dosage'] = raw.shortDosage;
      }

      if (raw.dosage) {
        // Logic updated: No longer stripping HTML tags
        labels['Dosage'] = raw.dosage.trim();
      }

      // 4. Remaining Standard Labels (Text only)
      const standardFields = {
        'Active constituents': raw.activeConstituents,
        'Plant part used': raw.plantPartUsed,
        'Qualities': raw.qualities,
        'Precautions': raw.precautions,
        'Adverse reactions': raw.adverseReactions,
        'Toxicity': raw.toxicity,
        'Nutritional sources': raw.nutritionalSources,
        'Symptoms of deficiency': raw.symptomsOfDeficiency
      };

      Object.entries(standardFields).forEach(([label, value]) => {
        if (value && typeof value === 'string' && value.trim().length > 0) {
          labels[label] = value.trim();
        }
      });

      return labels
    },
    setLabel(data, title) {
      this.$emit('set-label', data, title)
      this.$emit('set-screen', 'LabelScreen')

    },
  },
  async mounted() {
    try {
      const drug = await DrugService.fetchDragByName(this.selectedItemName);
      if (!drug) return
      this.drugInfo = this.mapMaterialInfo(drug)
    } catch (err) {
      console.error("Fetch failed", err);
    }
  }
}
</script>

<style scoped>
.monograph-screen {
  display: grid;
  position: relative;

  min-height: 270px;


  flex-direction: column;
  height: 100%;
  width: 100%;

  background: #f4f6f2;

  z-index: 1000;

  .monograph-header {
    display: flex;

    height: 30px;
    align-items: center;
    padding: 10px 5px;

    background: #e9ede4;

    .back-btn {
      display: flex;

      width: fit-content;

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

  .loader {
    display: flex;
    position: absolute;
    top: 50%;
    left: calc(50% - 13px);

    .spinner {
      width: 26px;
      height: 26px;
    }
  }

  .monograph-body {
    display: grid;
    padding: 15px;
    background-color: inherit;

    .drug-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-auto-flow: dense;
      z-index: 1000;

      justify-content: flex-start;
      align-items: stretch;
      gap: 12px;
      width: 100%;


      .drug-label {
        display: flex;
        align-items: center;

        height: fit-content;
        padding: 6px;

        background: #ffffff;
        color: #1b3a57;

        border: 1px solid #e5e7eb;
        border-radius: 12px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

        cursor: pointer;
        transition: transform 0.1s ease;

        &:active {
          transform: scale(0.98);
        }

        .title {
          font-size: smaller;
        }

        .arrow {
          padding-inline-start: 2px;
        }
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>