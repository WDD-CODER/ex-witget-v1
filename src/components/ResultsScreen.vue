<template>
  <div class="results-screen">
    <div class="card-header">
      <h3>Analysis Results</h3>
      <button class="back-btn" @click="$emit('set-screen', 'SearchScreen')">Back</button>
    </div>

    <div class="card-body">
      <section v-for="section in sections" :key="section.id" class="analysis-section">
        <h4>{{ section.label }}</h4>



        <div class="pill-container">
          <div v-for="(res, idx) in visibleData[section.id]" :key="section.id + idx" class="pill-wrapper">
            <button :class="['analysis-pill', section.pillClass, { active: activeItem === (section.id + idx) }]"
              @click.stop="toggleExpand(section.id + idx)">
              <span class="pill-text">{{ res.nutrient || res.title || res.name }}</span>
            </button>

            <div v-if="activeItem === (section.id + idx) && section.id === 'dep'" class="global-detail-card"
              ref="globalDetailCard" @click.stop>
              <div class="detail-content">
                <span v-if="res.shortDosage">Daily Dosage : {{ res.shortDosage }}</span>
                <div class="caused-by-section">
                  <p class="section-label">Depleted by:</p>
                  <div v-for="(drug, dIdx) in res.causedBy" :key="dIdx" @click="onSelectInteractedDrug(res, drug)"
                    class="
                    drug-link">
                    {{ drug }} <span class="arrow">→</span>
                  </div>
                </div>
              </div>
              <br>
              <div @click="onSelectItem(res, 'fromResult')" class="drug-link">
                {{ res.name }} Monograph <span class="arrow">→</span>
              </div>

            </div>
          </div>

          <div v-if="section.loading" class="loading-state">

            <span v-if="section.id === 'opt'" class="spinner"></span>
            {{ section.loadingText }}
            <div class="loader">
              <span class="spinner"></span>
            </div>
          </div>

          <div v-else-if="!section.data.length" class="empty-state">
            {{ section.emptyText }}
          </div>

          <button v-if="section.data.length > 8 || expandedSections[section.id]" class="show-more-btn"
            @click="toggleSection(section.id)">
            {{ expandedSections[section.id] ? 'Show Less' : `+${section.data.length - visibleData[section.id].length}
            More ${section.label}` }}
          </button>

        </div>

        <hr v-if="section.id === 'dep'" class="section-divider" />
      </section>
    </div>
  </div>
</template>

<script>
import DrugService from '../services/drug.service';
import { httpService } from '../services/http.service';

export default {
  props: {
    depletions: { type: Array, default: () => [] },
    optimizations: { type: Array, default: () => [] },
    isLoadingDepletions: { type: Boolean, default: false },
    isLoadingOptimizations: { type: Boolean, default: false },
  },
  data() {
    return {
      activeItem: null,
      currentDetailIdx: null,
      expandedSections: {
        dep: false,
        opt: false
      }
    }
  },
  methods: {
    async onSelectItem(drug, fromWere) {
      this.$emit('set-selected-item', drug, fromWere)
      this.$emit('set-screen', 'MonographScreen')
    },
    async onSelectInteractedDrug(MainDrug, interactedDrugName) {
      try {
        // 1. Fetch full drug data to access its labels
        const interactedDrug = await DrugService.fetchDragByName(interactedDrugName);
        if (!interactedDrug) return console.error('Drug not found');

        // 2. Implementation of Label-Based Logic
        // We check if this drug (e.g., Citalopram) has the specific SSRI Label ID 
        // that matches the "Vitamin D & SSRIs" interaction.
        const SSRI_LABEL_ID = '61c1163dbca1ec37f2e4a11c';
        const hasSsriLabel = interactedDrug.labels?.some(l => (l._id || l) === SSRI_LABEL_ID);

        // 3. Construct sideIds based on priority
        // If it has the label, we use the Label ID to match the existing interaction record
        let sideIds;
        if (hasSsriLabel) {
          sideIds = [MainDrug._id, SSRI_LABEL_ID];
        } else {
          sideIds = [MainDrug._id, interactedDrug._id];
        }

        const dataObj = {
          sideIds,
          side2DraftName: null
        };

        const encodedData = encodeURIComponent(JSON.stringify(dataObj));

        // 4. Execution
        const interactionInfo = await httpService.get(`/get-drug-by-drug-interaction?data=${encodedData}`) || null;

        this.$emit('set-drug-interaction', MainDrug.name, interactedDrugName, interactionInfo)
        this.$emit('set-screen', 'InteractionScreen')

      } catch (err) {
        console.error('Error in onSelectInteractedDrug:', err);
      }
    },
    toggleSection(sectionId) {
      this.expandedSections[sectionId] = !this.expandedSections[sectionId];
      // Close any open pills when collapsing to prevent orphaned dropdowns
      if (!this.expandedSections[sectionId]) {
        this.activeItem = null;
      }
    },
    toggleExpand(id) {
      this.activeItem = this.activeItem === id ? null : id;
    },
    handleGlobalClick() {
      if (!this.activeItem) return;

      this.activeItem = null;
    }
  },

  computed: {
    visibleData() {
      const depData = this.depletions || [];
      const optData = this.optimizations || [];

      return {
        // Show all if expanded, otherwise cap at 4
        dep: this.expandedSections.dep ? depData : depData.slice(0, 4),
        opt: this.expandedSections.opt ? optData : optData.slice(0, 4)
      }
    },
    sections() {
      return [
        {
          id: 'dep',
          label: 'Depletions',
          data: this.depletions,
          loading: this.isLoadingDepletions,
          loadingText: 'Finding depletions...',
          emptyText: 'No depletions detected.',
          pillClass: 'depletion'
        },
        {
          id: 'opt',
          label: 'Optimizations',
          data: this.optimizations,
          loading: this.isLoadingOptimizations,
          loadingText: 'Analyzing optimizations...',
          emptyText: 'No optimizations found.',
          pillClass: 'optimization'
        }
      ];
    }
  },
  mounted() {
    window.addEventListener('click', this.handleGlobalClick)
  },
  beforeUnmount() {
    window.removeEventListener('click', this.handleGlobalClick)

  }
}

</script>
<style scoped>
.results-screen {
  display: grid;
  position: relative;
  z-index: 1000;

  width: 100%;
  height: 100%;

  border-radius: inherit;

  .card-header {
    display: flex;
    position: sticky;
    top: 0;
    z-index: 1000;

    justify-content: space-between;
    align-items: center;
    padding: 15px;

    h3 {
      margin: 0;

      color: #1b3a57;
      font-size: 16px;
    }

    .back-btn {
      color: #1b3a57;
      font-size: 13px;
      text-decoration: underline;

      background: none;
      border: none;

      cursor: pointer;
    }
  }

  .card-body {
    padding: 15px;

    .analysis-section {
      position: relative;

      margin-bottom: 20px;

      h4 {
        margin: 0 0 10px 0;

        color: #555;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .loading-state {
        display: flex;

        justify-content: space-evenly;
        width: calc(200% + 8px);

        .loader {
          display: flex;

          width: 16px;
          height: 16px;
        }
      }

      .pill-container {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        grid-auto-flow: dense;

        gap: 8px;

        .show-more-btn {
          grid-column: 1 / -1;

          margin-top: 8px;
          padding: 8px;

          background: #f8f9fa;
          color: #1b3a57;
          font-size: 11px;
          font-weight: bold;

          border: 1px dashed #cbd5e0;
          border-radius: 6px;

          cursor: pointer;
          transition: all 0.2s;

          &:hover {
            background: #edf2f7;

            border-color: #1b3a57;
          }
        }
      }

      .pill-wrapper {
        display: flex;
        position: relative;

        flex-direction: column;
        align-items: center;
        width: 100%;

        &:nth-child(even) {
          .global-detail-card {
            left: calc(-100% - 8px);
          }
        }

        .analysis-pill {
          display: flex;

          align-items: center;
          width: 100%;
          padding: 6px 12px;

          font-size: 13px;
          font-weight: 500;

          border: 1px solid transparent;
          border-radius: 20px;

          cursor: pointer;
          box-sizing: border-box;

          .pill-text {
            flex: 1;

            text-align: left;
            text-overflow: ellipsis;
            white-space: nowrap;

            overflow: hidden;
          }

          .info-icon {
            display: flex;

            justify-content: center;
            align-items: center;
            flex-shrink: 0;
            margin-left: 8px;
            width: 16px;
            height: 16px;

            background: currentColor;
            color: white;
            font-size: 11px;
            font-weight: bold;

            border-radius: 50%;
          }

          &.depletion {
            background: #fdecea;
            color: #d32f2f;

            border-color: #ffcdd2;

            .info-icon {
              background: #d32f2f;
              color: #fdecea;
            }
          }

          &.optimization {
            background: #e8f5e9;
            color: #2e7d32;

            border-color: #c8e6c9;

            .info-icon {
              background: #2e7d32;
              color: #e8f5e9;
            }
          }
        }

        .global-detail-card {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          z-index: 2000;

          width: calc(200% + 8px);
          padding: 16px;

          background: #ffffff;
          color: #1b3a57;

          border: 1px solid #ffcdd2;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;

          .detail-content {
            .dosage-text {
              margin-bottom: 12px;

              font-size: 13px;
              font-weight: 600;
            }
          }

          .caused-by-section {
            .section-label {
              margin-bottom: 8px;

              color: #555;
              font-size: 12px;
            }
          }

          .drug-link, .monograph-link {
            display: flex;

            align-items: center;
            padding: 4px 0;

            font-size: 13px;

            cursor: pointer;

            .arrow {
              margin-left: 5px;

              color: #cbd5e0;
            }
          }

          .monograph-link {
            margin-top: 12px;

            font-weight: 500;
          }
        }
      }
    }

    .section-divider {
      margin: 20px 0;

      border: 0;
      border-top: 1px solid #f0f0f0;
    }
  }
}
</style>