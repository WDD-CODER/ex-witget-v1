<script>
export default {
    name: 'Home',
}
</script>

<template>
    <div class="main">
        About
        <section class="routes">
            <RouterLink to="/about/team"><button>team</button></RouterLink>
            <RouterLink to="/about/vis"><button>vis</button></RouterLink>
        </section>
        <RouterView />
    </div>
</template>

<style scoped>
    .routes{
        display: grid;
        grid-auto-flow: column;
    }
</style>