<template>
    <div class="search-screen">
        <div class="card-header">
            <h3>Check Interactions</h3>
        </div>

        <div class="card-body">
            <div class="search-container">
                <div class="search-input-wrapper">
                    <input type="text" v-debounce:400="onSearchInput" v-model="query"
                        placeholder="Search drugs or supplements..." @keydown.down.prevent="moveHighlight(1)"
                        @keydown.up.prevent="moveHighlight(-1)" @keydown.enter.prevent="selectHighlighted" />

                    <button class="add-btn" @click="handleManualAdd">Add</button>

                    <ul v-if="suggestions.length" class="suggestions-list">
                        <li v-for="(item, index) in suggestions" :key="item.name"
                            :class="{ 'highlighted': index === highlightedIndex }" @click="handleSuggestSelect(item)">
                            <span class="suggest-icon">{{ item.icon }}</span>
                            <span class="suggest-name">{{ item.name }}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="items-list">
                <div v-for="(item, index) in selectedItems" :key="index" class="chip">
                    <span class="chip-icon">{{ item.icon }}</span>
                    <span class="chip-text">{{ item.name }}</span>
                    <span class="remove-chip" @click="$emit('remove-item', index)">×</span>
                </div>
            </div>
        </div>

        <div class="card-footer">
            <button class="submit-btn" :disabled="selectedItems.length === 0 || loading"
                @click="$emit('process-analysis')">
                {{ loading ? 'Processing...' : 'Check Interactions' }}
            </button>
        </div>
    </div>
</template>

<script>
import DrugService from '../services/drug.service';

export default {
    props: ['selectedItems', 'loading'],
    data() {
        return {
            query: '',
            suggestions: [],
            highlightedIndex: -1
        };
    },
    methods: {
        async onSearchInput(val) {
            if (!val || val.length < 2) {
                this.suggestions = [];
                this.highlightedIndex = -1;
                return;
            }

            try {
                const results = await DrugService.queryDrugBank(val);
                console.log("🚀 ~ results:", results)

                // CRITICAL: Must be 'suggestions' to match your v-for in the template
                this.suggestions = results || [];
                this.highlightedIndex = -1;

                console.log("Suggestions updated:", this.suggestions.length);
            } catch (err) {
                console.error("Autocomplete UI update failed", err);
                this.suggestions = [];
            }
        },
        moveHighlight(dir) {
            if (!this.suggestions.length) return;
            this.highlightedIndex = (this.highlightedIndex + dir + this.suggestions.length) % this.suggestions.length;
        },
        selectHighlighted() {
            if (this.highlightedIndex >= 0 && this.suggestions[this.highlightedIndex]) {
                this.handleSuggestSelect(this.suggestions[this.highlightedIndex]);
            } else {
                this.handleManualAdd();
            }
        },
        handleSuggestSelect(item) {
            this.$emit('add-item', { ...item });
            this.query = '';
            this.suggestions = [];
            this.highlightedIndex = -1;
        },
        handleManualAdd() {
            if (!this.query.trim()) return;
            this.$emit('add-item', { name: this.query.trim(), type: 'manual', icon: '💊' });
            this.query = '';
        }
    }
};
</script>

<style scoped>
.search-screen {
    display: flex;
    flex-direction: column;
    position: relative;

    .card-header {
        display: flex;
        justify-content: space-between;
        padding: 15px;
        border-bottom: 1px solid #eee;

        h3 {
            margin: 0;
            color: #1b3a57;
            font-size: 16px;
        }
    }

    .card-body {
        padding: 15px;
        min-height: 120px;

        .search-input-wrapper {
            display: flex;
            position: relative;
            width: 100%;

            input {
                width: 100%;
                padding: 10px 60px 10px 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-family: inherit;
            }

            .add-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                bottom: 5px;
                padding: 0 12px;
                background: #1b3a57;
                color: #fff;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                transition: opacity 0.2s;

                &:hover {
                    opacity: 0.9;
                }
            }

            .suggestions-list {
                position: absolute;
                top: 100%;
                left: 0;
                width: 100%;
                margin: 4px 0;
                padding: 0;
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                list-style: none;
                z-index: 2000;

                li {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    cursor: pointer;
                    transition: background 0.2s;

                    &.highlighted {
                        background: #e3f2fd;
                        border-left: 4px solid #1b3a57;
                    }

                    &:hover {
                        background: #f5f5f5;
                    }

                    .suggest-icon {
                        margin-right: 8px;
                    }

                    .suggest-name {
                        font-size: 14px;
                        color: #333;
                    }
                }
            }
        }

        .items-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 15px;

            .chip {
                display: flex;
                align-items: center;
                padding: 4px 10px;
                background: #e8f5e9;
                border-radius: 16px;
                font-size: 13px;

                .chip-icon {
                    margin-right: 6px;
                }

                .remove-chip {
                    margin-left: 8px;
                    cursor: pointer;
                    color: #666;

                    &:hover {
                        color: #d32f2f;
                    }
                }
            }
        }
    }

    .card-footer {
        padding: 15px;
        border-top: 1px solid #eee;

        .submit-btn {
            width: 100%;
            padding: 12px;
            background: #1b3a57;
            color: #fff;
            border: none;
            border-radius: 6px;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;

            &:disabled {
                background: #ccc;
                cursor: not-allowed;
            }

            &:hover:not(:disabled) {
                background: #142d44;
            }
        }
    }
}
</style>