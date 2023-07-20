<template>
    <v-container>
        <div class="text-h5 font-weight-bold">Nos recettes:</div>
        <RecipeSummary class="mx-2 my-1" v-if="!loading" v-for="recipe in recipes" :key="recipe.recetteId" :id="recipe.recetteId" 
            :name="recipe.nomRecette" :rating="recipe.ratingMoyen" :prepTime="recipe.tempsPreparationMinutes"
            :cookTime="recipe.tempsCuissonMinutes" :serving="recipe.nbPortions" :description="recipe.descriptionRecette"
            :image="recipe.image"/>
    </v-container>
</template>

<script>
import RecipeSummary from './RecipeSummary.vue'
import { fetchRecipes } from '../../RecipeService'

export default {
    components: {
        RecipeSummary: RecipeSummary
    },
    data() {
        return {
            recipes: [],
            loading: true,
            loadError: false
        };
    },
    mounted() {
        fetchRecipes().then(recipes => {
            this.recipes = recipes;
            this.loading = false;
            this.loadError = false;
        }).catch(err => {
            console.error(err);
            this.loading = false;
            this.loadError = true;
        });
    }
}
</script>