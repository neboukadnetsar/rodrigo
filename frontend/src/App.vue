<template>
    <v-app>
        <NavBar />
        <v-main class="mt-4 bg-grey-lighten-5">
            <router-view></router-view>
        </v-main>
    </v-app>
</template>

<script>
import NavBar from './components/NavBar.vue';

export default {
    components: {
        NavBar
    }
}
</script>

<style></style>