<template>
  <div class="results-screen">
    <div class="card-header">
      <h3>Analysis Results</h3>
      <button class="back-btn" @click="$emit('set-screen', 'SearchScreen')">Back</button>
    </div>

    <div class="card-body">
      <section v-for="section in sections" :key="section.id" class="analysis-section">
        <h4>{{ section.label }}</h4>

        <div v-if="section.loading" class="loading-state">
          <span v-if="section.id === 'opt'" class="spinner"></span>
          {{ section.loadingText }}
        </div>

        <div v-else-if="!section.data.length" class="empty-state">
          {{ section.emptyText }}
        </div>

        <div v-else class="pill-container">

          <div v-for="(res, idx) in visibleData[section.id]" :key="section.id + idx" class="pill-wrapper"
            ref="pillWrappers">
            <button :class="['analysis-pill', section.pillClass, { active: activeItem === (section.id + idx) }]"
              @click.stop="toggleExpand(section.id + idx)">
              <span class="pill-text">{{ res.nutrient || res.title || res.name }}</span>
              <span class="info-icon">i</span>
            </button>

            <div v-if="activeItem === (section.id + idx) && res.causedBy" class="pill-details">
              <div v-for="(drug, dIdx) in res.causedBy" :key="dIdx" class="caused-by-item">
                <span class="drug-name" @click.stop="handleInfoClick(dIdx)">{{ drug }}</span>
              </div>
            </div>
          </div>

          <button v-if="section.data.length > 8 || expandedSections[section.id]" class="show-more-btn"
            @click="toggleSection(section.id)">
            <template v-if="expandedSections[section.id]">
              Show Less
            </template>
            <template v-else>
              +{{ section.data.length - visibleData[section.id].length }} More {{ section.label }}
            </template>
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
      // This will be used later to show the description/details
      // console.log("Viewing details for:", item.nutrient);
    },

    handleGlobalClick(ev) {
      if (!this.activeItem) return;
      const wrappers = this.$refs.pillWrappers || [];
      const clickedInside = wrappers.some(el => el.contains(ev.target));
      if (!clickedInside) {
        this.activeItem = null;
      }
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
  position: relative;

  .card-header {
    display: flex;
    position: sticky;
    top: 0;

    justify-content: space-between;
    align-items: center;
    padding: 15px;

    background: white;
    border-bottom: 1px solid #eee;

    z-index: 1000;

    h3 {
      margin: 0;

      color: #1b3a57;
      font-size: 16px;
    }

    .back-btn {
      background: none;
      border: none;
      color: #1b3a57;
      text-decoration: underline;

      cursor: pointer;
    }
  }

  .card-body {
    overflow-y: auto;

    padding: 15px;

    /* max-height: 400px; */

    .analysis-section {
      margin-bottom: 20px;

      h4 {
        margin: 0 0 10px 0;

        color: #555;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .loading-state,
      .empty-state {
        padding: 15px;

        color: #888;
        font-size: 12px;
        text-align: center;
        font-style: italic;

        .spinner {
          display: inline-block;

          width: 12px;
          height: 12px;

          border: 2px solid #ccc;
          border-top-color: #1b3a57;
          border-radius: 50%;

          animation: spin 1s linear infinite;
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
      }

      .analysis-pill {
        position: relative;
        /* z-index: 2000; */

        display: flex;

        align-items: center;
        width: 100%;
        padding: 6px 12px;

        border: 1px solid transparent;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 500;

        cursor: pointer;
        box-sizing: border-box;

        &.active {
          border-bottom-left-radius: 0;
          border-bottom-right-radius: 0;
          border-color: #eee;
        }

        .pill-text {
          flex: 1;
          overflow: hidden;

          text-align: left;
          text-overflow: ellipsis;
          white-space: nowrap;
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
          border-radius: 50%;
          font-size: 11px;
          font-weight: bold;
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

      .pill-details {
        position: absolute;
        top: 100%;
        left: 0;
        z-index: 1000;

        display: flex;
        flex-direction: column;

        width: 100%;

        background: #f9f9f9;
        border: 1px solid #eee;
        border-top: none;
        border-radius: 0 0 8px 8px;

        box-sizing: border-box;

        cursor: pointer;
        overflow: hidden;

        .caused-by-item {
          display: flex;

          /* padding: 6px 8px; */

          border-bottom: 1px solid #eee;
          text-align: center;
          font-size: 11px;
          color: #555;

          .drug-name {
            display: block;

            width: 100%;
            padding: 10px 12px;
            /* Increased padding for the 'large' look */

            color: #555;
            font-size: 11px;
            text-align: center;

            cursor: pointer;
            transition: background 0.2s;

            &:hover {
              background: #f0f0f0;
              color: #1b3a57;
            }
          }

          &:last-child {
            border-bottom: none;
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>