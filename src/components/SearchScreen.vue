<template>
    <div class="search-screen">
        <div class="card-header">
            <h3>Check Interactions</h3>
        </div>

        <div class="card-body">
            <div class="search-container">

                <div class="search-input-wrapper">
                    <input ref="searchInput" type="text" v-debounce:400="onSearchInput" v-model="query"
                        :class="{ 'input-error': isInvalidInput }" placeholder="Search drugs or supplements..."
                        @keydown.down.prevent="moveHighlight(1)" @keydown.up.prevent="moveHighlight(-1)"
                        @keydown.enter.prevent="selectHighlighted" />

                    <div v-if="isAutocompleteLoading" class="search-loader">
                        <div class="spinner"></div>
                    </div>

                    <div v-if="isInvalidInput" class="error-notice">
                        <span class="error-icon">⚠️</span>
                        Invalid characters detected (text only)
                    </div>

                    <button class="add-btn" @click="handleManualAdd">Add</button>

                    <ul v-if="suggestions.length && !isInvalidInput" class="suggestions-list">
                        <li v-for="(item, index) in suggestions" :key="item.name" ref="detailsRef"
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
import { showErrorMsg } from '../services/event-bus.service';

export default {
    props: ['selectedItems', 'loading'],
    data() {
        return {
            query: '',
            suggestions: [],
            highlightedIndex: -1,
            isInvalidInput: false,
            isAutocompleteLoading: false,
        };
    },
    methods: {
        async onSearchInput(val) {
            // const dangerousChars = /[\\^$*+?()|[\]{}/]/;
            // this.isInvalidInput = dangerousChars.test(val);

            try {
                if (this.isInvalidInput || !val) {
                    this.suggestions = [];
                    return;
                }
                this.isAutocompleteLoading = true;

                const results = await DrugService.queryDrugBank(val, this.selectedItems);
                const res = results || [];
                this.suggestions = res
                this.$emit('search', val);
            } catch (err) {
                showErrorMsg("Autocomplete failed")
                console.error(err);
                this.suggestions = [];
            } finally {
                // Stop Loading
                this.isAutocompleteLoading = false;
            }
        },
        moveHighlight(dir) {
            if (!this.suggestions.length) return;

            const nextIndex = this.highlightedIndex + dir;
            if (nextIndex >= 0 && nextIndex < this.suggestions.length) {
                this.highlightedIndex = nextIndex;
            }
        },
        selectHighlighted() {
            if (this.highlightedIndex >= 0 && this.suggestions[this.highlightedIndex]) {
                this.handleSuggestSelect(this.suggestions[this.highlightedIndex]);
            }
        },
        handleSuggestSelect(item) {
            if (!this.query || this.isInvalidInput) return;
            this.$emit('add-item', item);
            this.query = '';
            this.suggestions = [];
            this.highlightedIndex = -1;
            this.openDetails = true

            const exists = this.selectedItems.some(i => i.id === item.id);

            if (!exists) {
                this.$emit('add-item', item);
            }

            this.query = '';
            this.suggestions = [];

        },
        onRemoveItem(index) {
            this.$emit('remove-item', index);
        },
        handleManualAdd() {
            if (!this.query.trim()) return;
            this.$emit('add-item', { name: this.query.trim(), type: 'manual', icon: '💊' });
            this.query = ''
            this.suggestions = []
        },

    },
    mounted() {
        // Ensure the input is ready and then focus
        this.$nextTick(() => {
            if (this.$refs.searchInput) {
                this.$refs.searchInput.focus();
            }
        });
    },
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
            flex-direction: column;
            position: relative;

            gap: 4px;

            input {
                padding: 10px 90px 10px 12px;

                border: 1px solid #ddd;
                border-radius: 8px;
                font-family: inherit;

                &.input-error {
                    background-color: #fff8f8;
                    border-color: #d32f2f;
                }
            }

            .search-loader {
                display: flex;
                position: absolute;
                top: 10px;
                right: 65px;
                z-index: 1000;

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #f3f3f3;
                    border-top: 2px solid #1b3a57;
                    border-radius: 50%;

                    animation: spin 0.8s linear infinite;
                }
            }


            .error-notice {
                display: flex;

                align-items: center;
                gap: 6px;
                padding: 6px 10px;

                background: #fdecea;
                color: #d32f2f;
                font-size: 11px;
                font-weight: 600;

                border: 1px solid #ffcdd2;
                border-radius: 4px;

                .error-icon {
                    font-size: 12px;
                }
            }

            .add-btn {
                display: flex;
                place-items: center;
                position: absolute;
                top: 5px;
                right: 5px;
                bottom: 5px;

                height: 26px;
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
                z-index: 2000;

                width: 100%;
                max-height: 150px;

                margin: 4px 0;
                padding: 0;

                background: #fff;

                overflow: auto;

                border: 1px solid #ddd;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

                list-style: none;

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
                        color: #333;
                        font-size: 14px;
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

                    color: #666;

                    cursor: pointer;

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
            font-weight: bold;

            border: none;
            border-radius: 6px;

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

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>