<template>
    <v-container v-if="recipe" class="detailed-recipe">
        <v-row v-if="session.user && session.user.isAdmin">
            <v-col>
                <v-sheet elevation="8" rounded="lg" width="100%" class="pa-4">
                    <v-form @submit.prevent="submitImage">
                        <v-row align="center" justify="space-around">
                            <v-col cols="2">
                                <v-btn @click="this.$router.push(`/edit/${recipe.recetteId}`)">Éditer</v-btn>
                            </v-col>
                            <v-col cols="2">
                                <v-btn @click="this.delete()">Supprimer</v-btn>
                            </v-col>
                            <v-col cols="4">
                                <v-file-input v-model="imageFiles" prepend-icon="mdi-camera" id="recipe-image" accept="image/png, image/jpeg, image/gif" hide-details="auto"></v-file-input>
                            </v-col>
                            <v-col cols="2">
                                <v-btn type="submit">Soumettre Image</v-btn>
                            </v-col>
                        </v-row>
                    </v-form>
                </v-sheet>
            </v-col>
        </v-row>
        <v-row class="recipe-header">
            <v-col :key="imageChangeCounter">
                <v-img v-bind:src="imageSrc"></v-img>
            </v-col>
            <v-col>
                <v-sheet elevation="12" max-width="600" rounded="lg" width="100%" class="pa-4 text-left">
                    <div class="recipe-info">
                        <div class="text-h4 font-weight-bold">{{ recipe.nomRecette }}</div>
                        <div class="mt-1" v-if="rating">
                            <span><strong>Évaluation moyenne : {{ rating }}</strong></span>
                            <span>
                                <v-rating size="x-small" v-model=rating color="orange-darken-3" 
                                    density="compact" half-increments class="ml-2" readonly></v-rating>
                            </span>
                        </div>
                        <div class="mt-1">
                            <span v-if="recipe.tempsPreparationMinutes">
                                <strong>Préparation : {{ recipe.tempsPreparationMinutes }}</strong>
                            </span>
                            <span v-if="recipe.tempsCuissonMinutes" class="ml-5">
                                <strong>Cuisson : {{ recipe.tempsCuissonMinutes }}</strong>
                            </span>
                            <span v-if="recipe.nbPortions" class="ml-5">
                                <strong>Portions : {{ recipe.nbPortions }}</strong>
                            </span>
                        </div>
                        <div class="mt-1" v-if="session.user">
                            <Rating :recipeId="id" @rating-changed="handleRatingChange"/>
                        </div>
                        <p class="mt-1 pa-2 text-justify text-pre-wrap">{{ recipe.descriptionRecette }}</p>
                    </div>
                </v-sheet>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-sheet elevation="8" rounded="lg" width="100%" class="pa-4">
                    <div class="text-h5 font-weight-bold">Ingrédients :</div>
                    <Ingrediants class="mt-1" :ingrediants="recipe.ingredients" />
                </v-sheet>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-sheet elevation="8" rounded="lg" width="100%" class="pa-4">
                    <div class="text-h5 font-weight-bold">Étapes :</div>
                    <Steps class="mt-1" :steps="recipe.etapes" />
                </v-sheet>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <v-sheet elevation="8" rounded="lg" width="100%" class="pa-4">
                    <div class="text-h5 font-weight-bold">Commentaires :</div>
                    <Commentaires :recipeId="id"/>
                </v-sheet>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import session from '../../session';
import Ingrediants from './Ingrediants.vue';
import Steps from './Steps.vue'
import { fetchRecipe, deleteRecipe, putImage, fetchAverageRatingByRecetteId } from '../../RecipeService'
import { addApiPrefixToPath } from '../../api_utils';
import Commentaires from './Commentaires.vue';
import Rating from './Rating.vue';

export default {
    components: {
        Ingrediants: Ingrediants,
        Steps: Steps,
        Rating: Rating,
        Commentaires: Commentaires
    },
    props: {
        id: String
    },
    data() {
        return {
            imageChangeCounter: 0,
            session: session,
            loading: true,
            loadError: false,
            recipe: null,
            imageFiles: [],
            rating: null
        }
    },
    methods: {
        delete() {
            deleteRecipe(this.recipe.recetteId).then(() => {
                this.$router.push('/');
            }).catch(err => {
                console.error(err);
            });
        },
        submitImage() {
            const formData = new FormData();
 
            if(!this.imageFiles[0]) return;

            formData.append('recette-image', this.imageFiles[0]);
            putImage(this.recipe.recetteId, formData).then(() => {
                // Since Img Url dont change, forcin Vue to see a change in this.recipe proxy and reload img src. 
                const igmUrl = this.recipe.image;
                this.recipe.image = '';
                this.recipe.image = igmUrl;
                // Forcing Vue to rerender the v-col surrounding the img because images can be of different size ratio
                this.imageRerender();
                // Clearing value in file input
                this.imageFiles = null;
            }).catch(err => {
                console.error(err);
            });
        },
        imageRerender(){
            this.imageChangeCounter += 1;
        },
        handleRatingChange() {
            this.fetchAverageRating();
        },
        fetchAverageRating() {
            fetchAverageRatingByRecetteId(this.id).then(rating => {
                this.rating = rating.ratingMoyen;
            }).catch(err => {
                console.error(err);
            });
        },
        // onUpdateAverageRating(avrRating){
        //     this.recipe.ratingMoyen = avrRating;
        // }
    },
    computed: {
        imageSrc() {
            if(this.recipe && this.recipe.image)
                return addApiPrefixToPath(this.recipe.image);

            return '';
        }
    },
    mounted() {
        fetchRecipe(this.id).then(recipe => {
            this.recipe = recipe;
            this.loading = false;
            this.loadError = false;
        }).catch(err => {
            console.error(err);
            this.loading = false;
            this.loadError = true;
        });

        this.fetchAverageRating();
    }
}
</script>