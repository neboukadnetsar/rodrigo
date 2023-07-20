<template>
    <v-row>
        <v-col cols="12">
            <router-link class="text-decoration-none" :to="detailedRecipeUrl">
                <v-card>
                    <v-row>
                        <v-col cols="3">
                            <v-img 
                                width="250"
                                :aspect-ratio="1"
                                v-bind:src="imageSrc"
                                cover
                            ></v-img>
                        </v-col>
                        <v-col cols="9" class="pr-10 my-a">
                            <v-card-title class="mt-3"><strong>{{ name }}</strong></v-card-title>
                            <v-card-subtitle>
                                <span v-if="rating">
                                    <v-rating size="x-small" v-model="computedRating" color="orange-darken-3" 
                                        density="compact" half-increments class="mr-3 pl-0" readonly></v-rating>
                                </span>
                                <span v-if="prepTime" class="recipe-prep-time recipe-spec"><strong>Préparation : {{ prepTime }}</strong></span>
                                <span v-if="cookTime" class="recipe-cook-time recipe-spec"><strong>Cuisson : {{ cookTime }}</strong></span>
                                <span v-if="serving" class="recipe-serving recipe-spec"><strong>Portions : {{ serving }}</strong></span>
                            </v-card-subtitle>
                            <p class="text-justify ml-5 py-5">{{ truncateDescription() }}</p>
                        </v-col>
                    </v-row>
                </v-card>
            </router-link>
        </v-col>
    </v-row>
</template>

<script>
import { addApiPrefixToPath } from '../../api_utils';

export default {
    props: {
        id: String,
        name: String,
        rating: Number,
        prepTime: Number,
        cookTime: Number,
        serving: Number,
        description: String,
        image: String
    },
    computed: {
        detailedRecipeUrl(){
            return "recettes/" + this.id;
        },
        imageSrc() {
            return addApiPrefixToPath(this.image);
        },
        computedRating() {
            return this.rating;
        }
    },
    methods: {
        truncateDescription(){
            const words = this.description.split(" ").slice(0, 75);
            let truncatedString = '';
            words.forEach((word, index) => {
                if(index == words.length - 1 && index == 74){
                    truncatedString = truncatedString + word + "...";
                }else{
                    truncatedString = truncatedString + word + " ";
                }
            });
            return truncatedString;
        }
    }
}
</script>

<style scoped>
.recipe{
    display: flex;
}
.recipe-info{
    padding-left: 2%;
}
.recipe-spec{
    margin-right: 2%;
}
</style>