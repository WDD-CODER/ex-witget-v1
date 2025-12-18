<script>
import { drugBank } from '../assets/data/drugBank';
import ApiService from '../services/ApiService';
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service';

export default {
  name: 'WidgetRoot',
  props: {
    config: { type: Object, required: true }
  },
  data() {
    return {
      isExpanded: false,
      contentMode: 'search',
      searchQuery: '',
      selectedItems: [],
      drugBank: drugBank,
      loading: false,
      error: null,
      apiResults: null,
    };
  },
  mounted() {
    if (process.env.NODE_ENV === 'development') {
      this.injectDevStyles();
    }
  },
  // Add this block:
  updated() {
    if (process.env.NODE_ENV === 'development') {
      this.injectDevStyles();
    }
  },
  methods: {
    injectDevStyles() {
      const shadowRoot = this.$el.parentNode;
      if (!shadowRoot || !shadowRoot.host) return;

      // Remove old cloned styles first to prevent duplication
      const oldStyles = shadowRoot.querySelectorAll('style.cloned-dev-style');
      oldStyles.forEach(s => s.remove());

      const styles = document.querySelectorAll('style');
      styles.forEach(style => {
        if (style.textContent.includes('afikasafe')) {
          const clone = style.cloneNode(true);
          clone.classList.add('cloned-dev-style'); // Mark it so we can find/remove it later
          shadowRoot.appendChild(clone);
        }
      });
    },
    addToList() {
      if (this.searchQuery.trim()) {
        this.selectedItems.push(this.searchQuery.trim());
        this.searchQuery = '';
      }
    },
    removeItem(index) {
      this.selectedItems.splice(index, 1);
    },
    async handleCheckInteractions() {
      if (this.selectedItems.length === 0) return;

      this.loading = true;
      this.error = null;
      this.apiResults = null;

      try {
        const response = await ApiService.fetchMedicalFileData(
          this.config.userAuthToken,
          this.selectedItems
        );

        if (response.success) {
          this.apiResults = response.data;
          this.contentMode = 'results';
          // Added Success Message

          console.log("🚀 ~ Analysis complete:")
          showSuccessMsg('Analysis complete');
        } else {
          this.error = "No analysis available.";
          console.log("🚀 ~ No analysis available:")
          // Added Error Message for business logic failure
          showErrorMsg(this.error);
        }
      } catch (err) {
        this.error = "Connection failed.";
        // Added Error Message for network/code failure
        showErrorMsg(this.error);
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
    selectFromSuggest(item) {
      this.selectedItems.push({ ...item });
      this.searchQuery = '';
      showSuccessMsg(`${item.name} added`);
    },
    addManual() {
      if (!this.searchQuery.trim()) return;
      // Default to drug icon if manually typed and not in bank
      const newItem = {
        name: this.searchQuery.trim(),
        type: 'manual',
        icon: '💊'
      };
      this.selectedItems.push(newItem);
      this.searchQuery = '';
    },
  },

  computed: {
    suggestions() {
      const query = this.searchQuery.toLowerCase().trim();
      if (query.length < 2) return [];

      return this.drugBank.filter(item => {
        console.log("🚀 ~ item:", item)
        return item.name.toLowerCase().includes(query) &&
          !this.selectedItems.find(s => s.name === item.name);
      }
      ).slice(0, 5);
    }

  },
}

</script>

<template>

  <div class="afikasafe-wrapper">
    <div class="afikasafe-icon-trigger" :class="{ 'is-card-anchor': isExpanded }" @click="isExpanded = !isExpanded">
      <span class="leaf-icon">🍃</span>
    </div>

    <div v-if="isExpanded" class="afikasafe-widget-card">
      <div class="card-header">
        <h3>Check Interactions</h3>
        <button v-if="contentMode === 'results'" class="back-btn" @click="contentMode = 'search'">
          Back
        </button>
      </div>

      <div class="card-body">
        <div v-if="contentMode === 'search'">
          <div class="search-container">
            <label for="search">
              <div class="search-input-wrapper">
                <input type="text" v-model="searchQuery" placeholder="Search drugs or supplements..."
                  @keyup.enter="addManual" />
                <button class="add-btn" @click="addManual">Add</button>

                <ul v-if="suggestions.length" class="suggestions-list">
                  <li v-for="item in suggestions" :key="item.name" @click="selectFromSuggest(item)">
                    <span class="suggest-icon">{{ item.icon }}</span>
                    <span class="suggest-name">{{ item.name }}</span>
                  </li>
                </ul>
              </div>
            </label>
          </div>

          <div class="items-list">
            <div v-for="(item, index) in selectedItems" :key="index" class="chip">
              <span class="chip-icon">{{ item.icon }}</span>
              <span class="chip-text">{{ item.name }}</span>
              <span class="remove-chip" @click="removeItem(index)">×</span>
            </div>
          </div>
        </div>

        <div v-else-if="contentMode === 'results'">
          <div v-if="loading" class="loading-state">
            Analyzing interactions...
          </div>

          <div v-else class="results-container">
            <div v-if="apiResults && apiResults.length === 0" class="loading-state">
              No interactions detected for these items.
            </div>

            <div v-for="(res, idx) in apiResults" :key="idx"
              :class="['result-card', res.severity === 'high' ? 'danger' : 'safe']">
              <span class="result-title">{{ res.title }}</span>
              <p>{{ res.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="contentMode === 'search'" class="card-footer">
        <button class="submit-btn" :disabled="selectedItems.length === 0 || loading" @click="handleCheckInteractions">
          {{ loading ? 'Processing...' : 'Check Interactions' }}
        </button>
      </div>
    </div>
  </div>
</template>



<style>
.afikasafe-wrapper {
  display: flex;
  position: fixed;
  flex-direction: column;
  top: 20px;
  left: 20px;

  align-items: flex-end;

  font-family: Arial, sans-serif;

  z-index: 10000;

  .afikasafe-icon-trigger {
    display: flex;
    position: relative;

    align-items: center;
    justify-content: center;

    width: 50px;
    height: 50px;

    background: #fff;
    border: 2px solid #2e7d32;
    border-radius: 50%;

    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

    z-index: 2000;

    &.is-card-anchor {
      position: absolute;
      bottom: -20px;
      right: -27px;

      width: 40px;
      height: 40px;
    }

    .leaf-icon {
      font-size: 24px;
    }
  }

  .afikasafe-widget-card {
    display: flex;
    flex-direction: column;

    margin-top: 10px;

    width: 320px;

    background: #fff;
    border-radius: 12px;

    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);

    .card-header {
      display: flex;

      justify-content: space-between;
      align-items: center;

      padding: 15px;

      border-bottom: 1px solid #eee;

      h3 {
        margin: 0;
        font-size: 16px;
        color: #1b3a57;
      }

      .back-btn {
        background: none;
        border: none;
        color: #1b3a57;
        font-size: 12px;
        cursor: pointer;
        text-decoration: underline;
      }
    }

    .card-body {
      padding: 15px;

      min-height: 120px;

      .search-input-wrapper {
        display: flex;
        position: relative;

        align-items: center;

        width: 100%;

        input {
          width: 100%;

          padding: 10px 60px 10px 12px;

          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;

          transition: border-color 0.2s;

          &:focus {
            border-color: #1b3a57;
            outline: none;
          }
        }

        .add-btn {
          position: absolute;
          right: 5px;

          padding: 6px 12px;

          background: #1b3a57;
          border: none;
          border-radius: 6px;
          color: #fff;
          font-size: 12px;
          font-weight: bold;

          cursor: pointer;
          transition: opacity 0.2s;

          &:hover {
            opacity: 0.9;
          }
        }

        .suggestions-list {
          display: flex;
          position: absolute;
          top: 100%;
          left: 0;
          flex-direction: column;

          width: 100%;
          margin: 4px 0 0 0;
          padding: 0;

          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          list-style: none;

          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          overflow: hidden;

          z-index: 2000;

          li {
            display: flex;
            align-items: center;
            padding: 10px 12px;
            font-size: 14px;
            color: #333;
            cursor: pointer;
            transition: background 0.2s;

            &:hover {
              background: #f0f7f0;
            }

            .suggest-icon {
              margin-right: 8px;
            }

            &:not(:last-child) {
              border-bottom: 1px solid #eee;
            }
          }
        }
      }

      .items-list {
        display: flex;
        flex-wrap: wrap;

        margin-top: 10px;

        gap: 8px;

        .chip {
          display: flex;
          align-items: center;
          padding: 4px 10px;
          background: #e8f5e9;
          border-radius: 16px;
          color: #2e7d32;
          font-size: 13px;

          .chip-icon {
            margin-right: 6px;
            font-size: 12px;
          }

          .chip-text {
            flex: 1;
          }

          .remove-chip {
            margin-left: 8px;
            cursor: pointer;
            font-weight: bold;
            opacity: 0.6;
            transition: opacity 0.2s;

            &:hover {
              opacity: 1;
            }
          }
        }
      }

      .results-container {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .result-card {
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          border-left: 4px solid #ddd;

          &.danger {
            background: #fff5f5;
            border-left-color: #d32f2f;
            color: #b71c1c;
          }

          &.safe {
            background: #f1f8e9;
            border-left-color: #388e3c;
            color: #1b5e20;
          }

          .result-title {
            display: block;
            font-weight: bold;
            margin-bottom: 2px;
          }
        }
      }

      .loading-state {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px;
        color: #666;
        font-style: italic;
      }
    }

    .card-footer {
      padding: 15px;

      .submit-btn {
        width: 100%;

        padding: 12px;

        background: #1b3a57;
        border: none;
        border-radius: 6px;
        color: white;
        font-weight: bold;

        cursor: pointer;

        &:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      }
    }
  }
}
</style>