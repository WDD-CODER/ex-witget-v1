<template>
    <div class="search-screen">
        <div class="card-header">
            <h3>Check Interactions</h3>
            <button class="close-btn"></button>
        </div>

        <div class="card-body">
            <div class="search-container">
                <div class="search-input-wrapper">
                    <input ref="searchInput" type="text" v-debounce:400="onSearchInput" v-model="query"
                        :class="{ 'input-error': isInvalidInput }" placeholder="Search drugs or supplements..."
                        @keydown.down.prevent="moveHighlight(1)" @keydown.up.prevent="moveHighlight(-1)"
                        @keydown.enter.prevent="selectHighlighted" />

                    <div v-if="isAutocompleteLoading" class="loader">
                        <div class="spinner"></div>
                    </div>

                    <div v-if="isInvalidInput" class="error-notice">
                        <span class="error-icon">⚠️</span>
                        Invalid characters detected (text only)
                    </div>

                    <!-- <button class="add-btn" @click="handleManualAdd">Add</button> -->

                    <ul v-if="suggestions.length && !isInvalidInput" class="suggestions-list">
                        <li v-for="(item, index) in suggestions" :key="item.name" ref="detailsRef"
                            :class="{ 'highlighted': index === highlightedIndex }" @click="handleSuggestSelect(item)">
                            <!-- <span class="suggest-icon">
                                <img :src="item.icon" :alt="item.name + ' icon'" />
                            </span> -->
                            <span class="suggest-name">{{ item.name }}</span>
                        </li>
                    </ul>
                </div>
                <span class="logo-back"></span>
            </div>

            <div class="items-list">
                <div v-for="(item, index) in selectedItems" :key="index" class="chip">
                    <span class="chip-icon">
                        <img :src="item.icon" :alt="item.name + ' icon'" />
                    </span>
                    <span class="chip-text"  @click="onSelectItem(item.name)" style="cursor: pointer;">{{ item.name }}</span>
                    <span class="remove-chip" @click="$emit('remove-item', index)"><button
                            class="close-btn"></button></span>
                </div>
            </div>
        </div>

        <div class="submit-btn">
            <button class="check-interactions-btn" :disabled="selectedItems.length === 0 || loading"
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
        onSelectItem(drugName) {
            this.$emit('set-selected-item', drugName)
            this.$emit('set-screen', 'MonographScreen')
        },

        async onSearchInput(val) {
            // const dangerousChars = /[\\^$*+?()|[\]{}/]/;
            // this.isInvalidInput = dangerousChars.test(val);
            try {
                if (this.isInvalidInput || !val) {
                    this.suggestions = [];
                    return;
                }
                const cleanedVal = val ? val.trimStart() : ''

                this.isAutocompleteLoading = true;

                const results = await DrugService.queryDrugBank(cleanedVal, this.selectedItems);
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
*,
*::before,
*::after {
    box-sizing: border-box;
}


.search-screen {
    display: flex;
    flex-direction: column;
    position: relative;

    height: 326px;

    background-color: #F4F5F0;
    border-radius: inherit;


    .card-header {
        display: flex;
        position: relative;

        place-content: center;
        align-items: baseline;

        padding: 15px;

        h3 {
            margin: 0 auto;
            color: #205072;
            font-size: 22px;
            font-weight: lighter;
            line-height: 100%;
        }


    }

    .close-btn {
        /* position: absolute; */
        position: relative;
        display: flex;

        border: none;
        /* top: 20px;
        right: 10px; */
        /* Layout & Positioning */

        /* Spacing & Dimensions */
        width: 11.67px;
        height: 11.67px;

        /* Content Aesthetics */
        cursor: pointer;
        background-color: inherit;

        /* Structural Aesthetics */
        &::before,
        &::after {
            content: '';
            display: block;
            position: absolute;
            top: 50%;
            left: 50%;

            width: 1.25px;
            height: 100%;

            background: #000000;
        }

        /* Interactions & Effects */
        &::before {
            transform: translate(-50%, -50%) rotate(45deg);
        }

        &::after {
            transform: translate(-50%, -50%) rotate(-45deg);
        }

    }

    .card-body {
        display: flex;
        flex-direction: column;
        position: relative;
        padding: 0 26px 16px 26px;
        ;
        min-height: 200px;

        .logo-back {
            position: absolute;
            top: 60%;
            left: 50%;
            z-index: 0;

            width: 103px;
            height: 109px;

            background-image: url('../assets/img/logo-layer-1.png');
            background-size: contain;
            background-repeat: no-repeat;

            opacity: 0.15;
            transform: translate(-50%, -50%);
        }

        .search-input-wrapper {
            display: flex;
            flex-direction: column;
            position: relative;

            gap: 4px;



            input {

                font-size: 14px;

                color: #ADADAD;

                padding: 12px 4px 12px 20px;

                border: 1px solid #225474;
                border-radius: 24px;
                font-family: inherit;

                &.input-error {
                    background-color: #fff8f8;
                    border-color: #d32f2f;
                }
            }

            .loader {
                position: absolute;
                top: 10px;
                right: 65px;
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
                display: grid;
                position: absolute;
                top: 100%;
                left: 0;
                z-index: 2000;

                width: 100%;
                max-height: 148px;

                gap: 4px;
                margin: 4px 0;
                padding: 16px;

                background: #fff;
                overflow: auto;

                border: 1px solid #ddd;
                border-radius: 16px;

                box-shadow: 0px 2px 6px 0px #6D6D6D4D;

                list-style: none;

                &::-webkit-scrollbar {
                    width: 6px;
                    /* Narrower for a cleaner look */
                }

                &::-webkit-scrollbar-track {
                    background: transparent;
                    /* Blends with your container */
                    margin: 10px 0;
                    /* Keeps the bar away from the rounded corners */
                }

                &::-webkit-scrollbar-thumb {
                    background: #cbd5e0;
                    /* Neutral grey color */
                    border-radius: 10px;
                    /* Fully rounded handle */

                    &:hover {
                        background: #a0aec0;
                        /* Darker on hover */
                    }
                }



                li {
                    display: flex;

                    align-items: center;
                    /* padding: 10px; */

                    cursor: pointer;
                    transition: background 0.2s;

                    &.highlighted {
                        background: #e3f2fd;
                        border-left: 4px solid #1b3a57;
                    }

                    &:hover {
                        background: #f5f5f5;
                    }

                    /* .suggest-icon {
                        margin-right: 8px;
                    } */

                    .suggest-name {
                        color: #333;
                        font-size: 16px;
                    }
                }
            }
        }

        .items-list {
            display: grid;
            grid-template-columns: repeat(2, minmax(100px, 1fr));
            grid-auto-flow: dense;
            row-gap: 5px;
            margin: 10px 0 18px 0;
            z-index: 1;

            .chip {
                display: grid;
                grid-template-columns: 15px 1fr 15px;
                height: 30px;
                width: 100%;

                place-items: center;
                gap: 6px;
                padding: 0 4px;

                background: #FFFFFF;

                font-size: 13px;

                border-radius: 16px;
                border: 1px solid #E0E0E0;

                .chip-icon {
                    display: flex;
                    /* width: 18px;
                    height: 18px; */

                    img {
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                    }
                }

                .chip-text {

                    color: #484848;
                    font-size: 14px;
                    line-height: 100%;

                    /* Essential for Ellipsis */
                    width: 100%;
                    overflow: hidden;
                    text-overflow: ellipsis;

                    white-space: nowrap;
                    text-align: center;
                }

                .remove-chip {
                    display: flex;

                    justify-content: center;
                    align-items: center;

                    width: 24px;
                    height: 24px;
                }

                .close-btn {
                    position: relative;

                    width: 8px;
                    height: 8px;

                    padding: 0;

                    cursor: pointer;

                    background: transparent;
                    border: none;

                    &::before,
                    &::after {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        width: 1.5px;
                        height: 100%;
                        background-color: #C1C1C1;
                    }

                    &::before {
                        transform: translate(-50%, -50%) rotate(45deg);
                    }

                    &::after {
                        transform: translate(-50%, -50%) rotate(-45deg);
                    }
                }
            }
        }
    }

    .submit-btn {
        display: flex;
        place-content: center;

        .check-interactions-btn {
            display: flex;

            place-content: center;
            width: 166px;
            height: 32px;

            padding: 8px 24px;

            background: #D1D1D1;
            color: #fff;
            font-weight: bold;

            border: none;
            border-radius: 29px;

            cursor: pointer;
            transition: background 0.2s;


            font-size: 14px;
            font-family: Roboto;
            font-weight: 500;

            &:disabled {
                background: #ccc;

                cursor: not-allowed;
            }

            &:not(:disabled) {
                background: #205072;
            }
        }
    }
}
</style>