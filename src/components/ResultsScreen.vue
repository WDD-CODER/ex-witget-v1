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
                  <div v-for="(drug, dIdx) in res.causedBy" :key="dIdx" @click="onSelectInteractedDrug(res.name, drug)"
                    class="
                    drug-link">
                    {{ drug }} <span class="arrow">→</span>
                  </div>
                </div>
              </div>
              <br>
              <div @click="onSelectItem(res.name)" class="drug-link">
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
    onSelectItem(drugName) {
      this.$emit('set-selected-item', drugName)
      this.$emit('set-screen', 'MonographScreen')
    },
    onSelectInteractedDrug(MainDrugName, interactedDrugName) {
      this.$emit('set-drug-interaction', MainDrugName, interactedDrugName)
      this.$emit('set-screen', 'InteractionScreen')
    },

    // isSectionActive(sectionId) {
    //   return this.activeItem && this.activeItem.startsWith(sectionId);
    // },
    // getActiveItem(sectionId) {
    //   if (!this.isSectionActive(sectionId)) return null;
    //   const index = parseInt(this.activeItem.replace(sectionId, ''));
    //   return this.visibleData[sectionId][index];
    // },
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
    handleInfoClick(idx) {
      this.currentDetailIdx = idx
      console.log('idx', idx)

      // This will be used later to show the description/details
      // console.log("Viewing details for:", item.nutrient);
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
    console.log("🚀 ~ 'click':", 'click')
  },
  beforeUnmount() {
    window.removeEventListener('click', this.handleGlobalClick)

  }
}

</script>
<style scoped>
.results-screen {
  /* min-width: 320px;
  min-height: 320px; */
  display: grid;
  position: relative;

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

    .back-btn {
      background: none;

      color: #1b3a57;
      text-decoration: underline;

      border: none;

      cursor: pointer;
    }

    h3 {
      margin: 0;

      color: #1b3a57;
      font-size: 16px;
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
        position: relative;
        display: flex;

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

          border: 1px solid #ffcdd2;
          border-radius: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          box-sizing: border-box;

          .detail-content {
            .dosage-text {
              margin-bottom: 12px;

              color: #1b3a57;
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

          .drug-link {
            display: flex;

            align-items: center;
            padding: 4px 0;

            color: #1b3a57;
            font-size: 13px;

            cursor: pointer;

            .arrow {
              margin-left: 5px;

              color: #cbd5e0;
            }
          }

          .monograph-link {
            margin-top: 12px;

            color: #1b3a57;
            font-size: 13px;
            font-weight: 500;

            cursor: pointer;

            .arrow {
              margin-left: 5px;

              color: #cbd5e0;
            }
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