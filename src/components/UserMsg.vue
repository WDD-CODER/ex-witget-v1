<script>
import { eventBus } from '@/services/event-bus.service';

export default {
    name: 'user-msg',
    data() {
        return {
            msg: { txt: '' } // Initialize as object to avoid 'null' errors
        }
    },
    methods: {
        showMsg(msg) {
            this.msg = msg
            setTimeout(() => {
                this.msg = { txt: '' }
            }, 2500);
        },
    },
    computed: {
        msgStyle() {
            if (this.msg && this.msg.txt) return this.msg.type + ' show'
            return '' // Added default return
        },
        hasMsg() {
            if (this.msg && this.msg.txt) return 'show'
            return '' // Added default return
        },
    },
    created() {
        // ONLY CHANGE: Removed "this.msg =" 
        // We just want to start the listener, not save the listener-function into our data
        eventBus.on('user-msg', this.showMsg)
    }
}
</script>

<template>
    <Transition name="fade">
        <div v-if="msg.txt" class="user-msg" :class="msgStyle">
            <p class="msg">{{ msg.txt }}</p>
        </div>
    </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: 0.3s ease;
    opacity: 0;
    transform: translateX(150%);
}

.fade-enter-to,
.fade-leave-from {
    /* Explicitly set the visible position for clarity (even though it defaults to 0) */
    opacity: 1;
    transform: translateX(0);
}

.user-msg {
    display: flex;
    position: fixed;
    top: 20px;
    right: 20px;
    /* transform: translateX(-50%); */

    place-content: center;

    width: 200px;
    padding: 1em;

    border: 1px solid white;
    border-radius: 1vh;

    
    z-index: 10000;
    &.success {
        background-color: green;
    }

    &.error {
        background-color: red;
    }
}
</style>