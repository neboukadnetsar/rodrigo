import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Recipes from './pages/recipes/Recipes.vue';
import DetailedRecipe from './pages/detailed_recipe/DetailedRecipe.vue';
import EditingRecipe from './pages/admin_recipe/EditingRecipe.vue'
import LoginForm from './pages/LoginForm.vue';
import Inscription from './pages/InscriptionForm.vue';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { aliases, mdi } from 'vuetify/iconsets/mdi';
import '@mdi/font/css/materialdesignicons.css';

const app = createApp(App);

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '', component: Recipes },
        { path: '/recettes/:id', component: DetailedRecipe, props: true },
        { path: '/add', component: EditingRecipe },
        { path: '/edit/:id', component: EditingRecipe, props: true },
        { path: '/connexion', component: LoginForm },
        { path: '/inscription', component: Inscription }
    ]
});

app.use(router);

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi
        }
    },
    theme: { 
        defaultTheme: 'light' 
    }
});

app.use(vuetify);

app.mount("#app");